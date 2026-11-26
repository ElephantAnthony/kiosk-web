# Data model: training domain

```mermaid
erDiagram
    SCENARIO_VERSION ||--o{ TRAINING_SESSION : references
    TRAINING_SESSION ||--|| MISSION : has
    TRAINING_SESSION ||--o| MISSION_RESULT : yields
    SCENARIO_VERSION {
        varchar scenario_id PK
        integer version PK
        jsonb definition
    }
    TRAINING_SESSION {
        uuid id PK
        uuid owner_id
        varchar scenario_id FK
        integer scenario_version FK
        varchar ui_variant
        varchar status
        timestamptz started_at
    }
    MISSION {
        uuid id PK
        uuid session_id FK,UK
        varchar template_id
        varchar instruction
        jsonb expected_order
        varchar expected_payment
    }
    MISSION_RESULT {
        uuid session_id PK,FK
        jsonb actual_order
        varchar actual_payment
        integer matched
        integer missing
        integer extra
        numeric accuracy
        boolean payment_matched
        boolean correct
        bigint server_elapsed_ms
        bigint client_active_ms
        timestamptz completed_at
    }
```

The composite FK pins the catalog version. Mission session_id is unique. Application transaction guarantees a mission accompanies a new session. Owner ID is server-side and unrelated to names, age or contact details. The owner index supports future session lookup. Flyway V2 adds mission_result, with session_id as its primary and foreign key. A session can have zero results while active or cancelled, and exactly one after successful completion through the service. CHECK constraints enforce accuracy, counts and correctness. Status and result change in one transaction. Event table remains future work. PostgreSQL integration verified in CI 45772148779: migration, foreign key, concurrent isolated sessions, and immutable stored scenario version passed. Each bundled scenario is also seeded and checked during startup; keep old version fixtures available.

V2 migration and grading transaction tests passed on real PostgreSQL in run 45773475536. An intentional contract drift failure was observed after adding endpoints; the generated spec is now committed and must pass strict re-verification.

EXECUTION 04 uses existing status field for ACTIVE -> CANCELLED; no new database migration is required. Cancel uses the same FOR UPDATE lock as grading. PostgreSQL race test verifies exactly one terminal transition, with one mission_result only when completion wins. No event table yet.
