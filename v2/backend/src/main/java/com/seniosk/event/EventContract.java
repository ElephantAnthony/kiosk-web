package com.seniosk.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.SpecVersion;
import com.seniosk.scenario.Scenario;
import java.io.IOException;
import java.time.DateTimeException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class EventContract {
    private final JsonSchema schema;
    public EventContract(ObjectMapper mapper) {
        try (var in = new ClassPathResource("contracts/event.schema.json").getInputStream()) {
            schema = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V202012).getSchema(mapper.readTree(in));
        } catch (IOException ex) { throw new IllegalStateException("Invalid event contract", ex); }
    }

    TrainingEvent validate(JsonNode body, Scenario scenario) {
        if (body == null || !schema.validate(body).isEmpty()) throw invalid();
        TrainingEvent e;
        try { e = TrainingEvent.from(body); }
        catch (IllegalArgumentException | DateTimeException ex) { throw invalid(); }
        var payload = body.get("payload");
        if (payload.has("categoryId") && scenario.categories().stream().noneMatch(c -> c.id().equals(payload.get("categoryId").asText()))) throw invalid();
        if (payload.has("menuId")) {
            var menu = scenario.menus().stream().filter(m -> m.id().equals(payload.get("menuId").asText())).findFirst().orElseThrow(EventContract::invalid);
            if (payload.has("groupId")) {
                var group = menu.optionGroups().stream().filter(g -> g.id().equals(payload.get("groupId").asText())).findFirst().orElseThrow(EventContract::invalid);
                var option = payload.get("optionId");
                if (option.isNull() ? group.required() : group.options().stream().noneMatch(o -> o.id().equals(option.asText()))) throw invalid();
            }
        }
        return e;
    }
    static ResponseStatusException invalid() { return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid training event"); }
}
