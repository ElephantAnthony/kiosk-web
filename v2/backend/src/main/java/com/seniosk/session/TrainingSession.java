package com.seniosk.session;

import java.time.Instant;
import java.util.UUID;

public record TrainingSession(UUID id, UUID ownerId, String scenarioId, int scenarioVersion,
                              String uiVariant, Status status, Instant startedAt) {
    public enum Status { ACTIVE, COMPLETED, CANCELLED }
}
