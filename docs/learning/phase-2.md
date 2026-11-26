# Phase 2 learning

## Nontechnical explanation

The cafe menu and mission are described by a shared data contract, not a separate screen for every cafe.
Each practice session has its own database record and one mission.
A browser cannot read another browser's session just by knowing its identifier.
The server checks that a saved menu version cannot be silently changed.
Automatic tests create real PostgreSQL data, then check rules and isolation without using actual learners.

## Three code paths to study

- v2/backend/src/main/java/com/seniosk/scenario/ScenarioCatalog.java: structural and semantic validation
- v2/backend/src/main/java/com/seniosk/session/SessionService.java: transaction and mission snapshot
- v2/backend/src/main/java/com/seniosk/session/SessionRepository.java: owner-scoped query

## Decisions and alternatives

JDBC and JSONB keep version constraints and ownership SQL visible. A shared JSON Schema replaces independent language-specific structural rules, though cross-reference checks remain server logic. One browser-owned anonymous session is simpler than registration or external identity. Springdoc generates the API contract; a manual spec can drift.

## Interview questions

1. Why do training session and mission inserts belong in one transaction?
2. Why is a UUID alone insufficient to prevent another user's data access?
3. How do shared JSON Schema, semantic validation and generated OpenAPI differ?

Understanding not assessed. Grading, event retry and kiosk UI not implemented yet.
