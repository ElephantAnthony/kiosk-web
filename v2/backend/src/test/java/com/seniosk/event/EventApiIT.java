package com.seniosk.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class EventApiIT {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate jdbc;
    record Browser(MockHttpSession session,String header,String token,UUID id) {}
    Browser start() throws Exception {
        var csrf=mvc.perform(get("/api/csrf")).andExpect(status().isOk()).andReturn();
        var token=mapper.readTree(csrf.getResponse().getContentAsString());
        var session=(MockHttpSession)csrf.getRequest().getSession(false);
        String header=token.get("headerName").asText(), value=token.get("token").asText();
        var result=mvc.perform(post("/api/sessions").session(session).header(header,value).contentType("application/json")
            .content("{\"scenarioId\":\"boram-cafe\",\"version\":1,\"uiVariant\":\"standard\"}"))
            .andExpect(status().isCreated()).andReturn();
        return new Browser(session,header,value,UUID.fromString(mapper.readTree(result.getResponse().getContentAsString()).get("id").asText()));
    }
    ObjectNode event(Browser b,int sequence) {
        ObjectNode n=mapper.createObjectNode();
        n.put("eventId",UUID.randomUUID().toString());n.put("sessionId",b.id().toString());n.put("sequence",sequence);
        n.put("eventType","SESSION_STARTED");n.put("scenarioId","boram-cafe");n.put("scenarioVersion",1);
        n.put("uiVariant","standard");n.put("clientTimestamp","2026-01-01T00:00:00.000Z");n.putObject("payload");return n;
    }
    ResultActions send(Browser b,UUID id,ObjectNode... events) throws Exception {
        return mvc.perform(post("/api/sessions/"+id+"/events").session(b.session()).header(b.header(),b.token())
            .contentType("application/json").content(mapper.writeValueAsString(Map.of("events",List.of(events)))));
    }
    int count(Browser b) { return jdbc.queryForObject("SELECT count(*) FROM training_event WHERE session_id=?",Integer.class,b.id()); }
    @Test void replayAndOutOfOrderPersistOnlyUniqueEvents() throws Exception {
        var b=start();var first=event(b,1);var second=event(b,2);
        send(b,b.id(),second).andExpect(status().isOk());send(b,b.id(),first,second).andExpect(status().isOk()).andExpect(jsonPath("$.acknowledgedIds.length()").value(2));
        assertEquals(2,count(b));
    }
    @Test void conflictRollsBackWholeBatchAndProtectsStoredPayload() throws Exception {
        var b=start();var prior=event(b,1);send(b,b.id(),prior).andExpect(status().isOk());
        var change=prior.deepCopy();change.put("eventType","MISSION_CONFIRMED");
        send(b,b.id(),event(b,2),change).andExpect(status().isConflict());assertEquals(1,count(b));
        assertEquals("SESSION_STARTED",jdbc.queryForObject("SELECT event_type FROM training_event WHERE session_id=?",String.class,b.id()));
        send(b,b.id(),event(b,1)).andExpect(status().isConflict());assertEquals(1,count(b));
    }
    @Test void ownershipCsrfAndInvalidPayloads() throws Exception {
        var b=start();var other=start();var e=event(b,1);
        send(other,b.id(),e).andExpect(status().isNotFound());
        mvc.perform(post("/api/sessions/"+b.id()+"/events").session(b.session()).contentType("application/json").content("{}")).andExpect(status().isForbidden());
        var bad=e.deepCopy();bad.withObject("/payload").put("freeText","not allowed");
        send(b,b.id(),bad).andExpect(status().isBadRequest());
        bad=e.deepCopy();bad.put("eventType","MENU_SELECTED");bad.withObject("/payload").put("menuId","unknown");
        send(b,b.id(),bad).andExpect(status().isBadRequest());
        bad=e.deepCopy();bad.put("scenarioVersion",2);send(b,b.id(),bad).andExpect(status().isBadRequest());
        send(b,b.id()).andExpect(status().isBadRequest());
        ObjectNode[] tooMany=new ObjectNode[21];for(int i=0;i<21;i++)tooMany[i]=event(b,i+1);
        send(b,b.id(),tooMany).andExpect(status().isBadRequest());assertEquals(0,count(b));
    }
    @Test void concurrentReplayAndLateEventsAfterCancellation() throws Exception {
        var b=start();var e=event(b,1);
        try(var exec=Executors.newVirtualThreadPerTaskExecutor()){
            var a=exec.submit(()->send(b,b.id(),e).andReturn().getResponse().getStatus());
            var c=exec.submit(()->send(b,b.id(),e).andReturn().getResponse().getStatus());
            assertEquals(200,a.get());assertEquals(200,c.get());
        }
        assertEquals(1,count(b));
        mvc.perform(post("/api/sessions/"+b.id()+"/cancel").session(b.session()).header(b.header(),b.token())).andExpect(status().isOk());
        var late=event(b,2);late.put("eventType","SESSION_CANCELLED");
        send(b,b.id(),late).andExpect(status().isOk());assertEquals(2,count(b));
    }
}
