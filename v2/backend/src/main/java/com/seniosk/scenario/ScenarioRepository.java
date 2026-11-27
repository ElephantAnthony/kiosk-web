package com.seniosk.scenario;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ScenarioRepository {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    public ScenarioRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.mapper = mapper;
    }

    // Never overwrite an existing version. An incompatible change needs a new version.
    public void ensureVersion(Scenario scenario) {
        try {
            String json = mapper.writeValueAsString(scenario);
            jdbc.update("""
                INSERT INTO scenario_version(scenario_id, version, definition)
                VALUES (?, ?, CAST(? AS jsonb)) ON CONFLICT DO NOTHING
                """, scenario.scenarioId(), scenario.version(), json);
            Boolean same = jdbc.queryForObject("""
                SELECT definition = CAST(? AS jsonb) FROM scenario_version
                WHERE scenario_id = ? AND version = ?
                """, Boolean.class, json, scenario.scenarioId(), scenario.version());
            if (!Boolean.TRUE.equals(same)) throw new IllegalStateException("Scenario version is immutable");
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Cannot serialize scenario", ex);
        }
    }
    public Scenario readVersion(String id, int version) {
        String json = jdbc.queryForObject("""
            SELECT definition::text FROM scenario_version WHERE scenario_id=? AND version=?
            """, String.class, id, version);
        try {
            return mapper.readValue(json, Scenario.class);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Stored scenario is invalid", ex);
        }
    }
}
