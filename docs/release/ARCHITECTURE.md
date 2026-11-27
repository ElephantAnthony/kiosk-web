# Final architecture reference

One Spring Boot modular monolith with a React frontend and PostgreSQL. Local Compose orchestrates database readiness, backend health and frontend readiness. React consumes same-origin Vite proxy API. Shared JSON schemas are included as build resources for Java and imported by TypeScript. No broker, external AI or real payment.

| Module | Responsibility | Key boundary |
|---|---|---|
| scenario | Immutable versioned definitions and validation | JSON Schema and semantic references |
| session/mission | Owned session, mission snapshot and cancellation | Owner UUID, transaction |
| grading | Normalization and deterministic comparison | Row lock, one result per session |
| event | Validate and store atomic batch | UUID and sequence uniqueness, exact ACK |
| admin | Authentication and aggregate reporting | Separate context and role |
| common/config/health | API errors, filter chains, readiness | No stack details in public error responses |
| frontend kiosk | Generic XState flow and rendering | Guarded transitions and frozen retry |
| analytics-sdk | IndexedDB outbox, transport and backoff | Delete only on exact ACK |
| frontend admin | Authenticated filters and metrics | Native tables, no fabricated results |

Design links: [ERD](../design/ERD.md), [API](../design/API.md), [state machine](../design/KIOSK_FLOW.md), [event pipeline](../design/EVENT_PIPELINE.md), [funnel](../design/FUNNEL.md). [ADR-001](../adr/001-spring-modular-monolith.md) records the initial Spring JDBC selection; ADR-002 through ADR-006 record later tradeoffs.

System is not a production multi-tenant SaaS. Local HTTP, single process session management, no real data. See [security](SECURITY.md) and [release review](REVIEW.md).
