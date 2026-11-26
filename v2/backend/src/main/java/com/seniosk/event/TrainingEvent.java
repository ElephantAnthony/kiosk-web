package com.seniosk.event;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import java.util.UUID;

public record TrainingEvent(UUID eventId, UUID sessionId, int sequence, String eventType,
                            String scenarioId, int scenarioVersion, String uiVariant,
                            Instant clientTimestamp, JsonNode body) {
    static TrainingEvent from(JsonNode n) {
        return new TrainingEvent(UUID.fromString(n.get("eventId").asText()), UUID.fromString(n.get("sessionId").asText()),
            n.get("sequence").asInt(), n.get("eventType").asText(), n.get("scenarioId").asText(),
            n.get("scenarioVersion").asInt(), n.get("uiVariant").asText(), Instant.parse(n.get("clientTimestamp").asText()), n);
    }
}
