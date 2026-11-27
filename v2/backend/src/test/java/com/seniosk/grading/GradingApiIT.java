package com.seniosk.grading;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.support.TransactionTemplate;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class GradingApiIT {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate jdbc;
    @Autowired GradingService grading;
    @Autowired TransactionTemplate transaction;

    private record Browser(MockHttpSession session, String header, String token) {}
    private Browser browser() throws Exception {
        var r = mvc.perform(get("/api/csrf")).andExpect(status().isOk()).andReturn();
        var json = mapper.readTree(r.getResponse().getContentAsString());
        return new Browser((MockHttpSession)r.getRequest().getSession(false),json.get("headerName").asText(),json.get("token").asText());
    }
    private UUID start(Browser b) throws Exception {
        var response = mvc.perform(post("/api/sessions").session(b.session()).header(b.header(),b.token())
            .contentType("application/json").content("""
                {"scenarioId":"boram-cafe","version":1,"uiVariant":"standard"}
                """)).andExpect(status().isCreated()).andReturn().getResponse();
        return UUID.fromString(mapper.readTree(response.getContentAsString()).get("id").asText());
    }
    private SubmissionRequest request(int count, String payment) {
        return new SubmissionRequest(List.of(new SubmissionRequest.Line("americano",List.of("ice"),"TAKE_OUT",count)),payment,1000L);
    }
    private ResultActions submit(Browser b, UUID id, SubmissionRequest req) throws Exception {
        return raw(b,id,mapper.writeValueAsString(req));
    }
    private ResultActions raw(Browser b, UUID id, String json) throws Exception {
        return mvc.perform(post("/api/sessions/"+id+"/submit").session(b.session()).header(b.header(),b.token())
            .contentType("application/json").content(json));
    }
    private String state(UUID id) {
        return jdbc.queryForObject("SELECT status FROM training_session WHERE id=?",String.class,id);
    }
    private int count(UUID id) {
        return jdbc.queryForObject("SELECT count(*) FROM mission_result WHERE session_id=?",Integer.class,id);
    }

    @Test void storesCorrectResultAndSeparateTimes() throws Exception {
        var b=browser(); var id=start(b);
        mvc.perform(get("/api/sessions/"+id+"/result").session(b.session())).andExpect(status().isNotFound());
        var first=submit(b,id,request(2,"CARD")).andExpect(status().isOk())
            .andExpect(jsonPath("$.accuracy").value(1.0)).andExpect(jsonPath("$.matched").value(2))
            .andExpect(jsonPath("$.correct").value(true)).andExpect(jsonPath("$.clientActiveMs").value(1000))
            .andReturn().getResponse().getContentAsString();
        assertEquals(1,count(id)); assertEquals("COMPLETED",state(id));
        assertTrue(mapper.readTree(first).get("serverElapsedMs").asLong()>=0);
        mvc.perform(get("/api/sessions/"+id+"/result").session(b.session())).andExpect(status().isOk())
            .andExpect(content().json(first));
        mvc.perform(get("/api/sessions/"+id).session(b.session())).andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test void normalizedReplayReturnsOriginalAndConflictDoesNotOverwrite() throws Exception {
        var b=browser(); var id=start(b);
        var first=submit(b,id,request(2,"CARD")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        var split=new SubmissionRequest(List.of(request(1,"CARD").order().getFirst(),request(1,"CARD").order().getFirst()),"CARD",1000L);
        submit(b,id,split).andExpect(status().isOk()).andExpect(content().json(first));
        submit(b,id,request(3,"CARD")).andExpect(status().isConflict());
        submit(b,id,new SubmissionRequest(request(2,"CARD").order(),"CARD",1001L)).andExpect(status().isConflict());
        assertEquals(1,count(id)); assertEquals("COMPLETED",state(id));
    }

    @Test void concurrentIdenticalSubmissionsPersistOneResult() throws Exception {
        var b=browser(); var id=start(b); var barrier=new CyclicBarrier(2);
        try(var exec=Executors.newVirtualThreadPerTaskExecutor()) {
            var a=exec.submit(()->{barrier.await(10,TimeUnit.SECONDS); return submit(b,id,request(2,"CARD")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();});
            var c=exec.submit(()->{barrier.await(10,TimeUnit.SECONDS); return submit(b,id,request(2,"CARD")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();});
            assertEquals(mapper.readTree(a.get(20,TimeUnit.SECONDS)),mapper.readTree(c.get(20,TimeUnit.SECONDS)));
        }
        assertEquals(1,count(id)); assertEquals("COMPLETED",state(id));
    }

    @Test void concurrentConflictingSubmissionsHaveOneWinner() throws Exception {
        var b=browser(); var id=start(b); var barrier=new CyclicBarrier(2);
        try(var exec=Executors.newVirtualThreadPerTaskExecutor()) {
            var a=exec.submit(()->{barrier.await(10,TimeUnit.SECONDS); return submit(b,id,request(2,"CARD")).andReturn().getResponse().getStatus();});
            var c=exec.submit(()->{barrier.await(10,TimeUnit.SECONDS); return submit(b,id,request(3,"CARD")).andReturn().getResponse().getStatus();});
            assertEquals(List.of(200,409),List.of(a.get(20,TimeUnit.SECONDS),c.get(20,TimeUnit.SECONDS)).stream().sorted().toList());
        }
        assertEquals(1,count(id)); assertEquals("COMPLETED",state(id));
    }

    @Test void blocksOtherOwnersAndMissingCsrf() throws Exception {
        var a=browser(); var id=start(a); var b=browser(); start(b);
        submit(b,id,request(2,"CARD")).andExpect(status().isNotFound());
        mvc.perform(post("/api/sessions/"+id+"/submit").session(a.session()).contentType("application/json")
            .content(mapper.writeValueAsString(request(2,"CARD")))).andExpect(status().isForbidden());
        assertEquals("ACTIVE",state(id)); assertEquals(0,count(id));
        submit(a,id,request(2,"CARD")).andExpect(status().isOk());
        mvc.perform(get("/api/sessions/"+id+"/result").session(b.session())).andExpect(status().isNotFound());
        mvc.perform(get("/api/sessions/"+id+"/result")).andExpect(status().isNotFound());
    }

    @Test void invalidPayloadCannotFinalizeSession() throws Exception {
        var b=browser(); var id=start(b);
        String valid=mapper.writeValueAsString(request(2,"CARD"));
        raw(b,id,valid.replace("americano","unknown")).andExpect(status().isBadRequest());
        raw(b,id,valid.replace("\"ice\"","\"ice\",\"ice\"")).andExpect(status().isBadRequest());
        raw(b,id,valid.replace("\"ice\"","\"unknown\"")).andExpect(status().isBadRequest());
        raw(b,id,valid.replace("\"quantity\":2","\"quantity\":0")).andExpect(status().isBadRequest());
        raw(b,id,valid.replace("\"quantity\":2","\"quantity\":1.5")).andExpect(status().isBadRequest());
        raw(b,id,valid.replace("\"clientActiveMs\":1000","\"clientActiveMs\":-1")).andExpect(status().isBadRequest());
        raw(b,id,valid.replace("\"payment\":\"CARD\"","\"payment\":\"REAL_PAYMENT\"")).andExpect(status().isBadRequest());
        raw(b,id,valid.substring(0,valid.length()-1)+",\"accuracy\":1}").andExpect(status().isBadRequest());
        assertEquals("ACTIVE",state(id)); assertEquals(0,count(id));
    }

    @Test void emptyAndWrongPaymentAreGradedNotInvented() throws Exception {
        var b=browser(); var empty=start(b); var wrong=start(b);
        submit(b,empty,new SubmissionRequest(List.of(),"CARD",0L)).andExpect(status().isOk())
            .andExpect(jsonPath("$.missing").value(2)).andExpect(jsonPath("$.accuracy").value(0.0))
            .andExpect(jsonPath("$.correct").value(false));
        submit(b,wrong,request(2,"CASH")).andExpect(status().isOk())
            .andExpect(jsonPath("$.accuracy").value(1.0)).andExpect(jsonPath("$.paymentMatched").value(false))
            .andExpect(jsonPath("$.correct").value(false));
    }

    @Test void cancelledSessionCannotBeCompleted() throws Exception {
        var b=browser(); var id=start(b);
        mvc.perform(post("/api/sessions/"+id+"/cancel").session(b.session()).header(b.header(),b.token()))
            .andExpect(status().isOk());
        submit(b,id,request(2,"CARD")).andExpect(status().isConflict());
        assertEquals("CANCELLED",state(id)); assertEquals(0,count(id));
    }

    @Test void cancellationAndSubmissionSerializeOnSameRow() throws Exception {
        var b=browser(); var id=start(b); var barrier=new CyclicBarrier(2);
        try(var exec=Executors.newVirtualThreadPerTaskExecutor()) {
            var a=exec.submit(()->{barrier.await(10,TimeUnit.SECONDS); return submit(b,id,request(2,"CARD")).andReturn().getResponse().getStatus();});
            var c=exec.submit(()->{barrier.await(10,TimeUnit.SECONDS); return mvc.perform(post("/api/sessions/"+id+"/cancel")
                .session(b.session()).header(b.header(),b.token())).andReturn().getResponse().getStatus();});
            int submitted=a.get(20,TimeUnit.SECONDS), cancelled=c.get(20,TimeUnit.SECONDS);
            assertEquals(List.of(200,409),List.of(submitted,cancelled).stream().sorted().toList());
            assertEquals(submitted==200?"COMPLETED":"CANCELLED",state(id));
            assertEquals(submitted==200?1:0,count(id));
        }
    }

    @Test void completedSessionCannotBeCancelled() throws Exception {
        var b=browser(); var id=start(b);
        submit(b,id,request(2,"CARD")).andExpect(status().isOk());
        mvc.perform(post("/api/sessions/"+id+"/cancel").session(b.session()).header(b.header(),b.token()))
            .andExpect(status().isConflict());
        assertEquals("COMPLETED",state(id)); assertEquals(1,count(id));
    }

    @Test void outerRollbackRevertsBothCompletionAndResult() throws Exception {
        var b=browser(); var id=start(b);
        UUID owner=jdbc.queryForObject("SELECT owner_id FROM training_session WHERE id=?",UUID.class,id);
        assertThrows(IllegalStateException.class,()->transaction.executeWithoutResult(status->{
            grading.submit(owner,id,request(2,"CARD"));
            assertEquals("COMPLETED",state(id)); assertEquals(1,count(id));
            throw new IllegalStateException("synthetic transaction rollback");
        }));
        assertEquals("ACTIVE",state(id)); assertEquals(0,count(id));
        submit(b,id,request(2,"CARD")).andExpect(status().isOk());
    }

    @Test void gradingUsesPersistedMissionSnapshot() throws Exception {
        var b=browser(); var id=start(b);
        jdbc.update("""
            UPDATE mission SET expected_order=CAST(? AS jsonb) WHERE session_id=?
            ""","""
            [{"menuId":"cookie","optionIds":[],"packing":"TAKE_OUT","quantity":1}]
            """,id);
        submit(b,id,request(2,"CARD")).andExpect(status().isOk())
            .andExpect(jsonPath("$.matched").value(0)).andExpect(jsonPath("$.missing").value(1))
            .andExpect(jsonPath("$.extra").value(2)).andExpect(jsonPath("$.correct").value(false));
    }
}
