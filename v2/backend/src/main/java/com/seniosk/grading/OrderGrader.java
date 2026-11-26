package com.seniosk.grading;

import com.seniosk.scenario.Scenario.OrderLine;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

public final class OrderGrader {
    private OrderGrader() {}

    private record Key(String menuId, List<String> optionIds, String packing) {}
    public record Score(int matched, int missing, int extra, BigDecimal accuracy,
                        boolean paymentMatched, boolean correct) {}

    private static Map<Key, Integer> quantities(List<OrderLine> lines) {
        Map<Key, Integer> result = new HashMap<>();
        for (var line : lines) {
            if (line.quantity() <= 0) throw new IllegalArgumentException("Nonpositive quantity");
            var key = new Key(line.menuId(), line.optionIds().stream().sorted().toList(), line.packing());
            result.merge(key, line.quantity(), Math::addExact);
        }
        return result;
    }

    public static List<OrderLine> normalize(List<OrderLine> lines) {
        Comparator<Key> order = Comparator.comparing(Key::menuId)
            .thenComparing(key -> String.join(",", key.optionIds())).thenComparing(Key::packing);
        return quantities(lines).entrySet().stream().sorted(Map.Entry.comparingByKey(order))
            .map(e -> new OrderLine(e.getKey().menuId(), e.getKey().optionIds(), e.getKey().packing(), e.getValue()))
            .toList();
    }

    public static Score grade(List<OrderLine> expected, String expectedPayment,
                              List<OrderLine> actual, String actualPayment) {
        if (expected.isEmpty()) throw new IllegalArgumentException("Expected order must not be empty");
        var e = quantities(expected);
        var a = quantities(actual);
        var keys = new HashSet<>(e.keySet());
        keys.addAll(a.keySet());
        int matched = 0, missing = 0, extra = 0;
        for (var key : keys) {
            int x = e.getOrDefault(key, 0), y = a.getOrDefault(key, 0);
            matched = Math.addExact(matched, Math.min(x, y));
            missing = Math.addExact(missing, Math.max(x - y, 0));
            extra = Math.addExact(extra, Math.max(y - x, 0));
        }
        long denominator = (long) matched + missing + extra;
        var accuracy = BigDecimal.valueOf(matched).divide(BigDecimal.valueOf(denominator), 6, RoundingMode.HALF_UP);
        boolean paymentMatched = expectedPayment.equals(actualPayment);
        return new Score(matched, missing, extra, accuracy, paymentMatched,
            missing == 0 && extra == 0 && paymentMatched);
    }
}
