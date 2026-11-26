package com.seniosk.health;

import java.util.Map;
import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    private final JdbcTemplate jdbc;

    public HealthController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/healthz")
    public ResponseEntity<Map<String, String>> health() {
        try {
            if (Integer.valueOf(1).equals(jdbc.queryForObject("SELECT 1", Integer.class))) {
                return ResponseEntity.ok(Map.of("status", "UP"));
            }
        } catch (DataAccessException ignored) {
            // Do not expose connection strings or database error details.
        }
        return ResponseEntity.status(503).body(Map.of("status", "DOWN"));
    }
}
