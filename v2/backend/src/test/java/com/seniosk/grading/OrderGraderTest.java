package com.seniosk.grading;

import com.seniosk.scenario.Scenario.OrderLine;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class OrderGraderTest {
    private static OrderLine line(String option, int count) {
        return new OrderLine("americano", List.of(option), "TAKE_OUT", count);
    }
    private final List<OrderLine> expected = List.of(line("ice", 2));
    private OrderGrader.Score grade(List<OrderLine> actual, String payment) {
        return OrderGrader.grade(expected, "CARD", actual, payment);
    }
    private void counts(OrderGrader.Score score, int m, int n, int x, String accuracy, boolean correct) {
        assertAll(() -> assertEquals(m, score.matched()), () -> assertEquals(n, score.missing()),
            () -> assertEquals(x, score.extra()), () -> assertEquals(new BigDecimal(accuracy), score.accuracy()),
            () -> assertEquals(correct, score.correct()));
    }
    @Test void exact() { counts(grade(expected, "CARD"), 2, 0, 0, "1.000000", true); }
    @Test void allMissing() { counts(grade(List.of(), "CARD"), 0, 2, 0, "0.000000", false); }
    @Test void extra() { counts(grade(List.of(line("ice", 3)), "CARD"), 2, 0, 1, "0.666667", false); }
    @Test void wrongOption() { counts(grade(List.of(line("hot", 2)), "CARD"), 0, 2, 2, "0.000000", false); }
    @Test void wrongPacking() {
        counts(grade(List.of(new OrderLine("americano", List.of("ice"), "DINE_IN", 2)), "CARD"), 0, 2, 2, "0.000000", false);
    }
    @Test void wrongQuantity() { counts(grade(List.of(line("ice", 1)), "CARD"), 1, 1, 0, "0.500000", false); }
    @Test void splitOrder() { counts(grade(List.of(line("ice", 1), line("ice", 1)), "CARD"), 2, 0, 0, "1.000000", true); }
    @Test void paymentMismatch() {
        var s = grade(expected, "CASH");
        counts(s, 2, 0, 0, "1.000000", false);
        assertFalse(s.paymentMatched());
    }
    @Test void sortedOptionsAndMultipleKeys() {
        var first = new OrderLine("americano", List.of("ice","large"), "TAKE_OUT", 1);
        var second = new OrderLine("americano", List.of("large","ice"), "TAKE_OUT", 2);
        var cookie = new OrderLine("cookie", List.of(), "DINE_IN", 1);
        assertEquals(2, OrderGrader.normalize(List.of(first, second, cookie)).size());
        assertEquals(3, OrderGrader.normalize(List.of(first, second, cookie)).getFirst().quantity());
        counts(OrderGrader.grade(List.of(first, cookie), "CARD", List.of(second), "CARD"), 1, 1, 1, "0.333333", false);
    }
    @Test void emptyExpectedRejected() {
        assertThrows(IllegalArgumentException.class, () -> OrderGrader.grade(List.of(), "CARD", List.of(), "CARD"));
    }
    @Test void quantityGrid() {
        for (int e=1; e<=20; e++) for (int a=0; a<=20; a++) {
            var actual = a==0 ? List.<OrderLine>of() : List.of(line("ice",a));
            var s = OrderGrader.grade(List.of(line("ice",e)), "CARD", actual, "CARD");
            assertEquals(Math.min(e,a), s.matched());
            assertEquals(Math.max(e-a,0), s.missing());
            assertEquals(Math.max(a-e,0), s.extra());
            assertEquals(BigDecimal.valueOf(Math.min(e,a)).divide(BigDecimal.valueOf(Math.max(e,a)),6,RoundingMode.HALF_UP), s.accuracy());
            assertEquals(a==e, s.correct());
        }
    }
}
