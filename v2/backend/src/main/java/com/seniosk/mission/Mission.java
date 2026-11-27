package com.seniosk.mission;

import com.seniosk.scenario.Scenario;
import java.util.List;
import java.util.UUID;

public record Mission(UUID id, UUID sessionId, String templateId, String instruction,
                      List<Scenario.OrderLine> expected, String expectedPayment) {}
