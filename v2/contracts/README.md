# Shared contracts

The JSON Schema Draft 2020-12 file scenario.schema.json is the structural source of truth. The fictional cafe fixture is immutable by (scenarioId, version). Spring validates with networknt 1.5.9; frontend Ajv validation is the next sub-step of SEN-02. Server semantic validation additionally checks unique IDs, category references, option group cardinality and mission references. No actual brand assets or payment data. The event schema is intentionally deferred to the event milestone; no event ingest is implemented here.
