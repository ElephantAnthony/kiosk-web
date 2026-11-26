# ADR-002: versioned scenario and isolated session

Status: implemented; backend and frontend tests passed; full regression CI pending.

One JSON Schema Draft 2020-12 defines structural constraints. The server also enforces semantic references that JSON Schema cannot express. Both consumers use the same source directory. Maven packages it as a resource; Docker builds with the v2 context rather than copying a second schema. Pin networknt 1.5.9 for Jackson 2 compatibility (https://central.sonatype.com/artifact/com.networknt/json-schema-validator/1.5.9). Frontend Ajv 8.17.1 uses the same source file.

The scenario is immutable by (scenario_id, version). At startup and on session creation, SQL inserts the version if absent and checks equality if already stored; changing a definition requires a version bump. A transaction inserts one training_session and one mission. The mission snapshots expected order and payment; grading is a later milestone. No client-supplied score is accepted. Server records its own start timestamp. Session owner is a random UUID stored in HttpSession, never returned in the public DTO; ownership is part of the read query. A cookie-bound CSRF token is required for POST. Unauthorized and absent session IDs both return 404. This is anonymous learning isolation, not user registration or durable cross-device identity. One JVM/session lifetime is the M1 boundary; browser session expiry loses access to old training sessions. No external authentication provider.

Alternative: process-global cart/mission maps violate isolation. Storing only mutable scenario references would allow changed scoring rules to alter old attempts. JPA adds mapping abstraction but explicit SQL and JSONB are useful for future atomic event handling. No real data, no payment processing, no experiment module.

Integration tests run against PostgreSQL, not an in-memory approximation. Generate canonical OpenAPI from Springdoc; compare committed spec after bootstrapping. Frontend state machine and scoring completion endpoint are outside this sub-step.
