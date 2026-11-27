# M1 release gate

Based on [approved decisions](../decisions/REVIEW_DECISIONS_v1.1.md). PASS below refers to observed CI 45920332880 and earlier linked evidence, not unexecuted release changes. Final rerun 45922321237 pending.

| Gate | Evidence | Result before final rerun |
|---|---|---|
| Legacy shared cart characterization | SEN-01 foundation and latest legacy job | PASS |
| Hygiene and history scan | SEN-00 hygiene, 236 commits/0 unclassified in SEN-06 | PASS |
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
| Remaining six actual screen captures and extra axe | CI 45922321237 | PENDING |
| Final README, docs and release consistency | final tree review | PENDING |
| Latest application/test CI all five jobs | 45922321237 | PENDING |

Out of approved scope / NOT_RUN: real learner trial, operational deployment, bulk performance, independent manual WCAG audit, full vulnerability and penetration test. Pagehide termination independently NOT_RUN. Browser cart reload not implemented; telemetry durability is bounded.

See [evidence index](../evidence/INDEX.md) for actual logs and source SHAs. No M1 completion until final required checks and image provenance are verified.
