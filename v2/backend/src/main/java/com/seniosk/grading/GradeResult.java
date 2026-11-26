package com.seniosk.grading;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record GradeResult(UUID sessionId, int matched, int missing, int extra, BigDecimal accuracy,
                          boolean paymentMatched, boolean correct, long serverElapsedMs,
                          long clientActiveMs, Instant completedAt) {}
