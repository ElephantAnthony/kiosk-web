package com.seniosk.event;

import java.time.ZoneOffset;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class EventRepository {
    private final JdbcTemplate jdbc;
    public EventRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    // Unique event UUID and per-session sequence; never update an existing body.
    boolean insertOrIdentical(TrainingEvent e) {
        String json = e.body().toString();
        int added = jdbc.update("""
            INSERT INTO training_event(event_id,session_id,sequence,event_type,scenario_id,scenario_version,
                ui_variant,client_timestamp,body) VALUES (?,?,?,?,?,?,?,?,CAST(? AS jsonb))
            ON CONFLICT DO NOTHING
            """, e.eventId(),e.sessionId(),e.sequence(),e.eventType(),e.scenarioId(),e.scenarioVersion(),
            e.uiVariant(),e.clientTimestamp().atOffset(ZoneOffset.UTC),json);
        if (added == 1) return true;
        return jdbc.query("""
            SELECT body = CAST(? AS jsonb) AS same FROM training_event WHERE event_id=? AND session_id=?
            """, (rs,row)->rs.getBoolean("same"),json,e.eventId(),e.sessionId()).stream().anyMatch(Boolean::booleanValue);
    }
}
