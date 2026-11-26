package com.seniosk.session;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seniosk.mission.Mission;
import com.seniosk.scenario.Scenario;
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
public class SessionRepository {
    public record StoredSession(TrainingSession session, Mission mission) {}
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    public SessionRepository(JdbcTemplate jdbc, ObjectMapper mapper) { this.jdbc = jdbc; this.mapper = mapper; }

    public void insert(TrainingSession session, Mission mission) {
        jdbc.update("""
            INSERT INTO training_session(id, owner_id, scenario_id, scenario_version, ui_variant, status, started_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, session.id(), session.ownerId(), session.scenarioId(), session.scenarioVersion(),
            session.uiVariant(), session.status().name(), session.startedAt().atOffset(ZoneOffset.UTC));
        try {
            jdbc.update("""
                INSERT INTO mission(id, session_id, template_id, instruction, expected_order, expected_payment)
                VALUES (?, ?, ?, ?, CAST(? AS jsonb), ?)
                """, mission.id(), mission.sessionId(), mission.templateId(), mission.instruction(),
                mapper.writeValueAsString(mission.expected()), mission.expectedPayment());
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Cannot serialize expected order", ex);
        }
    }

    public Optional<StoredSession> findOwned(UUID id, UUID owner) {
        return jdbc.query("""
            SELECT s.*, m.id AS mission_id, m.template_id, m.instruction,
                   m.expected_order::text AS expected_json, m.expected_payment
            FROM training_session s JOIN mission m ON m.session_id = s.id
            WHERE s.id = ? AND s.owner_id = ?
            """, (rs, row) -> read(rs), id, owner).stream().findFirst();
    }

    public Optional<StoredSession> findOwnedForUpdate(UUID id, UUID owner) {
        return jdbc.query("""
            SELECT s.*, m.id AS mission_id, m.template_id, m.instruction,
                   m.expected_order::text AS expected_json, m.expected_payment
            FROM training_session s JOIN mission m ON m.session_id = s.id
            WHERE s.id = ? AND s.owner_id = ? FOR UPDATE OF s
            """, (rs, row) -> read(rs), id, owner).stream().findFirst();
    }

    public void markCompleted(UUID id, UUID owner) {
        int changed = jdbc.update("""
            UPDATE training_session SET status='COMPLETED'
            WHERE id=? AND owner_id=? AND status='ACTIVE'
            """, id, owner);
        if (changed != 1) throw new IllegalStateException("Expected one active session update");
    }

    private StoredSession read(ResultSet rs) throws SQLException {
        TrainingSession session = new TrainingSession(rs.getObject("id", UUID.class),
            rs.getObject("owner_id", UUID.class), rs.getString("scenario_id"), rs.getInt("scenario_version"),
            rs.getString("ui_variant"), TrainingSession.Status.valueOf(rs.getString("status")),
            rs.getObject("started_at", OffsetDateTime.class).toInstant());
        try {
            List<Scenario.OrderLine> lines = mapper.readValue(rs.getString("expected_json"), new TypeReference<>() {});
            Mission mission = new Mission(rs.getObject("mission_id", UUID.class), session.id(),
                rs.getString("template_id"), rs.getString("instruction"), lines, rs.getString("expected_payment"));
            return new StoredSession(session, mission);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Stored mission is invalid", ex);
        }
    }
}
