# SENIOSK V2 plan

## ROADMAP
| ID | Deliverable | State |
|---|---|---|
| EXECUTION 00 | Baseline, hygiene and harness | Verified |
| EXECUTION 01 | Spring and React foundation | PASS |
| EXECUTION 02 | Scenario contract and isolated sessions | PASS |
| EXECUTION 03 | Server grading and completion | PASS |
| EXECUTION 04 | Kiosk UI, cancellation and fixture extension | PASS: 45775831858, both stores, seven browser tests, capture committed |
| EXECUTION 05 | Durable event ingestion and SDK | PASS: all five jobs, 45777346496 |
| EXECUTION 06 | Admin funnel and accessibility completion | ACTIVE: administrator authentication and cohort funnel |
| EXECUTION 07 | Release gate and portfolio evidence | TODO |

## ACTIVE
- Branch: portfolio/seniosk-v2; main baseline 9477fe7ac6ebae0fbc2393d91dd7d1b0fc10756d preserved.
- Latest application source 8e483d755f3f41e7d58416dc80a353d80a2a59f7. Server event source 4d18b8552610e4b94e55183f00696361e2451965.
- Previous kiosk gate [45775831858](evidence/runs/SEN-04-pass-45775831858.md): all five jobs success, both scenario success markers, seven Playwright tests; actual screenshot verified and committed 9b297be.
- Source CI 45776976931: Maven 42, Vitest 22, 9 Playwright, Compose, V1, scanner PASS; OpenAPI diff FAIL due to endpoint expansion. Actual generated spec bytes verified and committed. [Evidence](evidence/runs/SEN-05-event-45776976931.md).
- Acceptance: shared event schema, atomic IndexedDB persistence and per-session sequence, batch 20/5s, exact ACK, offline/reload, lost ACK, 429, owner/CSRF, atomic batch rollback, same ID replay, concurrent batch, actual PostgreSQL persistence, old kiosk regression and full CI. Source authored. Regenerate exact OpenAPI from CI and enforce existing diff (do not bypass it). Record failed checks and fix.
- Limitations: browser cart reload recovery not implemented, orphan sessions possible after lost start response, anonymous cookie expiry blocks old events, no protection against device storage eviction or user clearing data, pagehide best-effort, client event times not authoritative. No real participant data or admin feature.
- Strict CI [45777346496](evidence/runs/SEN-05-pass-45777346496.md): all five jobs green. Begin SEN-06.
- [Event design](design/EVENT_PIPELINE.md) / [ADR](adr/005-durable-event-outbox.md) / [Task](prompts/SEN-05.md) / [Evidence](evidence/INDEX.md).

SEN-06 acceptance: separate admin security context, env credentials, CSRF, login/logout and ownership regression; PostgreSQL cohort aggregates with explicit denominators, UTC dates, 30-minute inactivity policy, fixture counts and EXPLAIN; accessible dashboard, actual capture, generated OpenAPI diff and full CI.
