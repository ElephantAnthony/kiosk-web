CREATE TABLE training_event (
    event_id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES training_session(id),
    sequence INTEGER NOT NULL CHECK (sequence > 0),
    event_type VARCHAR(32) NOT NULL,
    scenario_id VARCHAR(64) NOT NULL,
    scenario_version INTEGER NOT NULL,
    ui_variant VARCHAR(32) NOT NULL CHECK (ui_variant = 'standard'),
    client_timestamp TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    body JSONB NOT NULL CHECK (jsonb_typeof(body) = 'object'),
    UNIQUE (session_id, sequence),
    FOREIGN KEY (scenario_id, scenario_version) REFERENCES scenario_version(scenario_id, version)
);
CREATE INDEX ix_training_event_type ON training_event(event_type, session_id);
