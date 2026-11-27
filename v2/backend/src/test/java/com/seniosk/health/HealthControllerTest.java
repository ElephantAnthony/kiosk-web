package com.seniosk.health;

import com.seniosk.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HealthController.class)
@Import(SecurityConfig.class)
class HealthControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean JdbcTemplate jdbc;

    @Test void healthyDatabaseReturns200() throws Exception {
        when(jdbc.queryForObject("SELECT 1", Integer.class)).thenReturn(1);
        mvc.perform(get("/healthz")).andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test void databaseFailureReturns503WithoutDetails() throws Exception {
        when(jdbc.queryForObject("SELECT 1", Integer.class))
            .thenThrow(new DataAccessResourceFailureException("internal connection detail"));
        mvc.perform(get("/healthz")).andExpect(status().isServiceUnavailable())
            .andExpect(content().json("{\"status\":\"DOWN\"}"));
    }

    @Test void unknownAdminRouteIsDenied() throws Exception {
        mvc.perform(get("/api/admin/funnel")).andExpect(status().isForbidden());
    }
}
