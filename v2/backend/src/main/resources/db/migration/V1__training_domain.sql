-- Immutable scenario version and per-browser training session.
CREATE TABLE scenario_version (
    scenario_id VARCHAR(64) NOT NULL,
    version INTEGER NOT NULL CHECK (version > 0),
    definition JSONB NOT NULL CHECK (jsonb_typeof(definition) = 'object'),
    PRIMARY KEY (scenario_id, version)
);

CREATE TABLE training_session (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL,
    scenario_id VARCHAR(64) NOT NULL,
    scenario_version INTEGER NOT NULL,
    ui_variant VARCHAR(32) NOT NULL CHECK (ui_variant = 'standard'),
    status VARCHAR(16) NOT NULL CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    started_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_training_scenario FOREIGN KEY (scenario_id, scenario_version)
        REFERENCES scenario_version (scenario_id, version)
);
CREATE INDEX ix_training_owner ON training_session (owner_id, started_at);

CREATE TABLE mission (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL UNIQUE REFERENCES training_session(id),
    template_id VARCHAR(64) NOT NULL,
    instruction VARCHAR(500) NOT NULL,
    expected_order JSONB NOT NULL CHECK (jsonb_typeof(expected_order) = 'array' AND jsonb_array_length(expected_order) > 0),
    expected_payment VARCHAR(16) NOT NULL CHECK (expected_payment IN ('CARD', 'CASH'))
);
