package com.seniosk.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class AdminApiIT {
    private static final String USER="fixture-admin";
    private static final String PASS=UUID.randomUUID().toString();
    @DynamicPropertySource static void credentials(DynamicPropertyRegistry r){
        r.add("ADMIN_USERNAME",()->USER);r.add("ADMIN_PASSWORD",()->PASS);
    }
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate jdbc;
    @Autowired FunnelRepository repository;

    record Browser(MockHttpSession session,String token) {}
    Browser csrf(MockHttpSession existing)throws Exception{
        var req=get("/api/csrf");if(existing!=null)req.session(existing);
        var result=mvc.perform(req).andExpect(status().isOk()).andReturn();
        return new Browser((MockHttpSession)result.getRequest().getSession(false),mapper.readTree(result.getResponse().getContentAsString()).get("token").asText());
    }
    MockHttpSession login(Browser b)throws Exception{
        var result=mvc.perform(post("/api/admin/login").session(b.session()).header("X-CSRF-TOKEN",b.token())
            .contentType("application/json").content(mapper.writeValueAsString(Map.of("username",USER,"password",PASS))))
            .andExpect(status().isOk()).andExpect(jsonPath("$.authenticated").value(true)).andReturn();
        return (MockHttpSession)result.getRequest().getSession(false);
    }
    @Test void authenticationCsrfLogoutAndLearnerIsolation()throws Exception{
        var b=csrf(null);var other=csrf(null);
        mvc.perform(get("/api/admin/funnel").session(b.session())).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/admin/login").session(b.session()).contentType("application/json").content("{}")).andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/login").session(b.session()).header("X-CSRF-TOKEN",b.token())
            .contentType("application/json").content(mapper.writeValueAsString(Map.of("username",USER,"password",UUID.randomUUID().toString()))))
            .andExpect(status().isUnauthorized());
        var started=mvc.perform(post("/api/sessions").session(b.session()).header("X-CSRF-TOKEN",b.token()).contentType("application/json")
            .content("{\"scenarioId\":\"boram-cafe\",\"version\":1,\"uiVariant\":\"standard\"}"))
            .andExpect(status().isCreated()).andReturn();
        String owned=mapper.readTree(started.getResponse().getContentAsString()).get("id").asText();
        String before=b.session().getId();
        var admin=login(b);
        assertNotEquals(before,admin.getId());
        mvc.perform(get("/api/admin/me").session(admin)).andExpect(status().isOk());
        mvc.perform(get("/api/admin/funnel").session(other.session())).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/sessions/"+owned).session(admin)).andExpect(status().isOk());
        mvc.perform(get("/api/sessions/"+owned).session(other.session())).andExpect(status().isNotFound());
        mvc.perform(post("/api/admin/logout").session(admin).header("X-CSRF-TOKEN",b.token())).andExpect(status().isForbidden());
        var fresh=csrf(admin);
        mvc.perform(post("/api/admin/logout").session(admin).header("X-CSRF-TOKEN",fresh.token())).andExpect(status().isNoContent());
        mvc.perform(get("/api/admin/funnel").session(admin)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/sessions/"+owned).session(admin)).andExpect(status().isOk());
    }
    @Test void nonAdminRoleIsForbidden()throws Exception{
        var b=csrf(null);
        b.session().setAttribute(AdminSecurity.CONTEXT_KEY,new SecurityContextImpl(
            UsernamePasswordAuthenticationToken.authenticated("learner",null,List.of(new SimpleGrantedAuthority("ROLE_LEARNER")))));
        mvc.perform(get("/api/admin/funnel").session(b.session())).andExpect(status().isForbidden());
    }
    private UUID seed(String scenario,String state,OffsetDateTime start){
        UUID id=UUID.randomUUID();
        jdbc.update("INSERT INTO training_session(id,owner_id,scenario_id,scenario_version,ui_variant,status,started_at) VALUES (?,?,?,1,'standard',?,?)",
            id,UUID.randomUUID(),scenario,state,start);
        jdbc.update("INSERT INTO mission(id,session_id,template_id,instruction,expected_order,expected_payment) VALUES (?,?,'fixture','Synthetic fixture',CAST(? AS jsonb),'CARD')",
            UUID.randomUUID(),id,"[{\"menuId\":\"americano\",\"optionIds\":[\"ice\"],\"packing\":\"TAKE_OUT\",\"quantity\":2}]");
        return id;
    }
    private void result(UUID id,boolean correct,OffsetDateTime time){
        jdbc.update("""
          INSERT INTO mission_result(session_id,actual_order,actual_payment,matched,missing,extra,accuracy,payment_matched,correct,server_elapsed_ms,client_active_ms,completed_at)
          VALUES (?,CAST('[]' AS jsonb),'CARD',?,?,0,?,true,?,?,0,?)
          """,id,correct?2:1,correct?0:1,correct?1.0:0.5,correct,correct?1000:3000,time);
    }
    private void event(UUID session,int seq,String type,String payload,OffsetDateTime received){
        jdbc.update("""
            INSERT INTO training_event(event_id,session_id,sequence,event_type,scenario_id,scenario_version,ui_variant,client_timestamp,received_at,body)
            VALUES (?,?,?,?,'boram-cafe',1,'standard',?,?,CAST(? AS jsonb))
            """,UUID.randomUUID(),session,seq,type,received.minusMinutes(5),received,payload);
    }
    private void stages(UUID id,OffsetDateTime received,String... stages){
        for(int i=stages.length-1;i>=0;i--)
            event(id,i+1,"STATE_TRANSITION","{\"payload\":{\"to\":\""+stages[i]+"\"}}",received);
    }
    @Test @Transactional void exactCohortFunnelLateEventsAndExplain()throws Exception{
        var date=LocalDate.of(2024,3,1);var start=date.atStartOfDay().atOffset(ZoneOffset.UTC);
        var next=start.plusDays(1);var now=OffsetDateTime.now(ZoneOffset.UTC);
        UUID good=seed("boram-cafe","COMPLETED",start),wrong=seed("boram-cafe","COMPLETED",start),
            cancelled=seed("boram-cafe","CANCELLED",start),stale=seed("boram-cafe","ACTIVE",start),late=seed("boram-cafe","ACTIVE",start);
        result(good,true,start.plusMinutes(1));result(wrong,false,start.plusMinutes(1));
        stages(good,start,"MISSION","MENU","CART","PAYMENT");
        // duplicate stage event, distinct ID, must not multiply session counts.
        event(good,5,"STATE_TRANSITION","{\"payload\":{\"to\":\"MENU\"}}",start);
        event(good,6,"HELP","{\"payload\":{\"open\":true}}",start);
        event(good,7,"HELP","{\"payload\":{\"open\":true}}",start);
        stages(wrong,start,"MISSION","MENU");stages(cancelled,start,"MISSION");
        stages(stale,start,"MISSION","MENU","CART");
        // Late received event makes an otherwise stale active session recent.
        stages(late,now,"MISSION","MENU");
        seed("doran-burger","ACTIVE",start);seed("boram-cafe","ACTIVE",next);
        var admin=login(csrf(null));String url="/api/admin/funnel?from=2024-03-01&to=2024-03-02";
        mvc.perform(get(url+"&scenarioId=boram-cafe&version=1").session(admin)).andExpect(status().isOk())
            .andExpect(jsonPath("$.metrics.total").value(5)).andExpect(jsonPath("$.metrics.completed").value(2))
            .andExpect(jsonPath("$.metrics.cancelled").value(1)).andExpect(jsonPath("$.metrics.active").value(1))
            .andExpect(jsonPath("$.metrics.abandoned").value(1)).andExpect(jsonPath("$.metrics.successful").value(1))
            .andExpect(jsonPath("$.metrics.graded").value(2)).andExpect(jsonPath("$.metrics.successRate").value(0.5))
            .andExpect(jsonPath("$.metrics.averageAccuracy").value(0.75)).andExpect(jsonPath("$.metrics.averageElapsedMs").value(2000.0))
            .andExpect(jsonPath("$.metrics.helped").value(1))
            .andExpect(jsonPath("$.funnel[*].reached").value(List.of(5,5,4,2,1,1)))
            .andExpect(jsonPath("$.funnel[2].notReachedNext").value(2))
            .andExpect(jsonPath("$.scenarios.length()").value(1));
        mvc.perform(get(url).session(admin)).andExpect(status().isOk()).andExpect(jsonPath("$.metrics.total").value(6))
            .andExpect(jsonPath("$.scenarios.length()").value(2));
        var plan=repository.explain(start,next,now.minusMinutes(30));
        assertTrue(plan.stream().anyMatch(line->line.contains("training_session")));
        assertTrue(plan.stream().anyMatch(line->line.contains("training_event")));
        System.out.println("FUNNEL_EXPLAIN_BEGIN");plan.forEach(System.out::println);System.out.println("FUNNEL_EXPLAIN_END");
    }
    @Test void zeroDenominatorsAndInvalidFilters()throws Exception{
        var admin=login(csrf(null));
        mvc.perform(get("/api/admin/funnel?from=2001-01-01&to=2001-01-02").session(admin)).andExpect(status().isOk())
            .andExpect(jsonPath("$.metrics.total").value(0)).andExpect(jsonPath("$.metrics.successRate").isEmpty())
            .andExpect(jsonPath("$.metrics.averageAccuracy").isEmpty()).andExpect(jsonPath("$.funnel[1].conversionFromPrevious").isEmpty());
        mvc.perform(get("/api/admin/funnel?from=2024-01-01&to=2024-01-01").session(admin)).andExpect(status().isBadRequest());
        mvc.perform(get("/api/admin/funnel?version=1").session(admin)).andExpect(status().isBadRequest());
    }
}
