package com.seniosk.session;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.UUID;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class SessionApiIT {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate jdbc;

    private record Browser(MockHttpSession session, String header, String value) {}
    private Browser browser() throws Exception {
        var result = mvc.perform(get("/api/csrf")).andExpect(status().isOk())
            .andExpect(header().string("Cache-Control", "no-store")).andReturn();
        JsonNode body = mapper.readTree(result.getResponse().getContentAsString());
        return new Browser((MockHttpSession) result.getRequest().getSession(false),
            body.get("headerName").asText(), body.get("token").asText());
    }

    private static final String REQUEST = """
        {"scenarioId":"boram-cafe","version":1,"uiVariant":"standard"}
        """;
    private UUID start(Browser b) throws Exception {
        var response = mvc.perform(post("/api/sessions").session(b.session()).header(b.header(), b.value())
            .contentType("application/json").content(REQUEST)).andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("ACTIVE"))
            .andExpect(jsonPath("$.mission.instruction").isNotEmpty())
            .andExpect(jsonPath("$.mission.expected").doesNotExist())
            .andExpect(jsonPath("$.ownerId").doesNotExist()).andReturn().getResponse();
        return UUID.fromString(mapper.readTree(response.getContentAsString()).get("id").asText());
    }

    @Test void scenarioReadAndInputValidation() throws Exception {
        mvc.perform(get("/api/scenarios")).andExpect(status().isOk()).andExpect(jsonPath("$[0].scenarioId").value("boram-cafe"));
        mvc.perform(get("/api/scenarios/boram-cafe/1")).andExpect(status().isOk());
        mvc.perform(get("/api/scenarios/boram-cafe/99")).andExpect(status().isNotFound());
        var b = browser();
        mvc.perform(post("/api/sessions").session(b.session()).contentType("application/json").content(REQUEST))
            .andExpect(status().isForbidden());
        mvc.perform(post("/api/sessions").session(b.session()).header(b.header(), b.value())
            .contentType("application/json").content("{\"scenarioId\":\"boram-cafe\",\"version\":0,\"uiVariant\":\"standard\"}"))
            .andExpect(status().isBadRequest());
        mvc.perform(post("/api/sessions").session(b.session()).header(b.header(), b.value())
            .contentType("application/json").content(REQUEST.replace("boram-cafe", "unknown")))
            .andExpect(status().isNotFound());
    }

    @Test void concurrentBrowsersRemainIsolatedAndPersisted() throws Exception {
        var a = browser(); var b = browser();
        UUID idA; UUID idB;
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            var fa = executor.submit(() -> start(a));
            var fb = executor.submit(() -> start(b));
            idA = fa.get(); idB = fb.get();
        }
        assertNotEquals(idA, idB);
        mvc.perform(get("/api/sessions/" + idA).session(a.session())).andExpect(status().isOk());
        mvc.perform(get("/api/sessions/" + idA).session(b.session())).andExpect(status().isNotFound());
        mvc.perform(get("/api/sessions/" + idB).session(a.session())).andExpect(status().isNotFound());
        mvc.perform(get("/api/sessions/" + idB)).andExpect(status().isNotFound());
        assertEquals(2, jdbc.queryForObject("SELECT count(*) FROM mission WHERE session_id IN (?, ?)", Integer.class, idA, idB));
        assertEquals(2, jdbc.queryForObject("SELECT count(DISTINCT owner_id) FROM training_session WHERE id IN (?, ?)", Integer.class, idA, idB));
        assertEquals(1, jdbc.queryForObject("SELECT count(*) FROM scenario_version WHERE scenario_id='boram-cafe' AND version=1", Integer.class));
    }

    @Test void foreignKeyRejectsUnknownScenario() {
        assertThrows(DataIntegrityViolationException.class, () -> jdbc.update("""
            INSERT INTO training_session(id,owner_id,scenario_id,scenario_version,ui_variant,status,started_at)
            VALUES (?,?,'missing-scenario',1,'standard','ACTIVE',now())
            """, UUID.randomUUID(), UUID.randomUUID()));
    }

    @Test void exportGeneratedOpenApi() throws Exception {
        var response = mvc.perform(get("/v3/api-docs")).andExpect(status().isOk()).andReturn().getResponse();
        ObjectNode spec = (ObjectNode) mapper.readTree(response.getContentAsString());
        assertTrue(spec.path("paths").has("/api/sessions"));
        assertTrue(spec.path("paths").has("/api/scenarios"));
        spec.remove("servers"); // Runtime address is environment-specific; retain relative server URL semantics.
        Path out = Path.of("target", "openapi.json");
        Files.createDirectories(out.getParent());
        Files.writeString(out, mapper.writerWithDefaultPrettyPrinter().writeValueAsString(sorted(spec)) + "\n");
    }

    private JsonNode sorted(JsonNode input) {
        if (input.isObject()) {
            ObjectNode out = mapper.createObjectNode();
            var names = new ArrayList<String>();
            input.fieldNames().forEachRemaining(names::add);
            names.sort(String::compareTo);
            for (String name : names) out.set(name, sorted(input.get(name)));
            return out;
        }
        if (input.isArray()) {
            var out = mapper.createArrayNode();
            input.forEach(item -> out.add(sorted(item)));
            return out;
        }
        return input;
    }
}
