CREATE TABLE mission_result (
    session_id UUID PRIMARY KEY REFERENCES training_session(id),
    actual_order JSONB NOT NULL CHECK (jsonb_typeof(actual_order) = 'array'),
    actual_payment VARCHAR(16) NOT NULL CHECK (actual_payment IN ('CARD', 'CASH')),
    matched INTEGER NOT NULL CHECK (matched >= 0),
    missing INTEGER NOT NULL CHECK (missing >= 0),
    extra INTEGER NOT NULL CHECK (extra >= 0),
    accuracy NUMERIC(7,6) NOT NULL CHECK (accuracy BETWEEN 0 AND 1),
    payment_matched BOOLEAN NOT NULL,
    correct BOOLEAN NOT NULL,
    server_elapsed_ms BIGINT NOT NULL CHECK (server_elapsed_ms >= 0),
    client_active_ms BIGINT NOT NULL CHECK (client_active_ms BETWEEN 0 AND 86400000),
    completed_at TIMESTAMPTZ NOT NULL,
    CHECK (matched + missing > 0),
    CHECK (accuracy = round(matched::numeric / NULLIF(matched + missing + extra, 0), 6)),
    CHECK (correct = (missing = 0 AND extra = 0 AND payment_matched))
);
