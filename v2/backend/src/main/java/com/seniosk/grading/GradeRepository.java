package com.seniosk.grading;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seniosk.scenario.Scenario.OrderLine;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class GradeRepository {
    public record StoredGrade(GradeResult result, List<OrderLine> actual, String payment) {}
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    public GradeRepository(JdbcTemplate jdbc, ObjectMapper mapper) { this.jdbc = jdbc; this.mapper = mapper; }

    public void insert(GradeResult result, List<OrderLine> actual, String payment) {
        try {
            jdbc.update("""
                INSERT INTO mission_result(session_id,actual_order,actual_payment,matched,missing,extra,
                  accuracy,payment_matched,correct,server_elapsed_ms,client_active_ms,completed_at)
                VALUES (?,CAST(? AS jsonb),?,?,?,?,?,?,?,?,?,?)
                """, result.sessionId(), mapper.writeValueAsString(actual), payment,
                result.matched(), result.missing(), result.extra(), result.accuracy(),
                result.paymentMatched(), result.correct(), result.serverElapsedMs(), result.clientActiveMs(),
                result.completedAt().atOffset(ZoneOffset.UTC));
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Cannot serialize order", ex);
        }
    }

    public Optional<StoredGrade> find(UUID sessionId) {
        return jdbc.query("""
            SELECT *, actual_order::text AS actual_json FROM mission_result WHERE session_id=?
            """, (rs, row) -> read(rs), sessionId).stream().findFirst();
    }

    private StoredGrade read(ResultSet rs) throws SQLException {
        var result = new GradeResult(rs.getObject("session_id", UUID.class), rs.getInt("matched"),
            rs.getInt("missing"), rs.getInt("extra"), rs.getBigDecimal("accuracy"),
            rs.getBoolean("payment_matched"), rs.getBoolean("correct"), rs.getLong("server_elapsed_ms"),
            rs.getLong("client_active_ms"), rs.getObject("completed_at", OffsetDateTime.class).toInstant());
        try {
            List<OrderLine> order = mapper.readValue(rs.getString("actual_json"), new TypeReference<>() {});
            return new StoredGrade(result, order, rs.getString("actual_payment"));
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Stored order is invalid", ex);
        }
    }
}
