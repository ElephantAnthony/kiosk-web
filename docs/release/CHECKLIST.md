# M1 release gate

Based on [approved decisions](../decisions/REVIEW_DECISIONS_v1.1.md). PASS below refers to observed final CI 45922321237 and earlier linked evidence.

| Gate | Evidence | Result |
|---|---|---|
| Legacy shared cart characterization | SEN-01 foundation and latest legacy job | PASS |
| Hygiene and history scan | SEN-00 hygiene, 239 commits/0 unclassified in SEN-07 | PASS |
| Compose DB and frontend/backend health | SEN-06 strict CI | PASS |
| Flyway V1-V4 | SEN-06 PostgreSQL evidence | PASS |
| Shared scenario and event contracts | Java/Vitest and actual APIs | PASS |
| Two scenarios, fixture-only extension | SEN-04 and SEN-06 browser | PASS |
| Deterministic grading, ownership, concurrency, rollback | GradingApiIT and unit tests | PASS |
| Idempotent submission, cancel protection | GradingApiIT and kiosk E2E | PASS |
| Offline/reload, lost ACK, replay/conflict, 429 | SEN-05 evidence and SEN-06 browser | PASS |
| Admin auth, CSRF, role/owner separation, logout | AdminApiIT and admin E2E | PASS |
| Cohort fixture counts, empty denominator, EXPLAIN | SEN-06 backend | PASS |
| Selected screen axe, keyboard, high contrast, target sizes | SEN-06 browser | PASS |
| Generated OpenAPI strict diff | SEN-06 strict backend | PASS |
| Actual menu/admin image bytes and digests | SEN-04 and SEN-06 gate evidence | PASS |
| Remaining six actual screen captures and extra axe | CI 45922321237 | PASS |
| Final README, docs and release consistency | final tree review | PASS |
| Latest application/test CI all five jobs | 45922321237 | PASS |

Out of approved scope / NOT_RUN: real learner trial, operational deployment, bulk performance, independent manual WCAG audit, full vulnerability and penetration test. Pagehide termination independently NOT_RUN. Browser cart reload not implemented; telemetry durability is bounded.

See [evidence index](../evidence/INDEX.md) for actual logs and source SHAs. M1 local-demo release gate PASS; actual verification and eight captures documented in [SEN-07 final evidence](../evidence/runs/SEN-07-pass-45922321237.md). Not a production-readiness certification.
