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
| EXECUTION 06 | Admin funnel and accessibility completion | 48 Java and 23 Vitest PASS; generated OpenAPI drift and browser gate pending |
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

- SEN-06 source commits 3e0b8f212b4133a967c0acafe42d84c9d8b72331 and e1e0af60e5e8ebfa15a495b47166f466c4b83739. CI [45919739819](https://github.com/ElephantAnthony/kiosk-web/actions/runs/45919739819). Authentication, report SQL, V4 index, dashboard and synthetic tests authored. Verify all tests, capture exact generated OpenAPI and screenshot, strict diff and full CI. No pass claimed until observed. [Metric definitions](design/FUNNEL.md) / [ADR](adr/006-admin-and-funnel.md).

- Initial source CI 45919739819: 20 unit, 25 of 26 PostgreSQL IT, 23 Vitest, V1 and scanner PASS. Actual synthetic response matched expected cohort counts; wildcard JSONPath assertion FAIL. EXPLAIN and generated OpenAPI not verified. [Evidence](evidence/runs/SEN-06-initial-45919739819.md). Necessary repair 2078900bf64ca45968dc73d4ef991a719e41f53b, new CI 45919907679. Inspect final backend and browser results, regenerate exact OpenAPI, verify screenshot digest and commit both, strict re-run. No new features until green.

- Repair CI 45919907679: Maven 22 unit + 26 PostgreSQL IT all PASS, V4 applied, exact fixture and EXPLAIN verified; frontend/V1/scanner PASS, 232 commits scanned with zero unclassified findings. OpenAPI diff FAIL due new endpoint; actual output SHA-256 verified, blob f2000f5bb9e3fe201bed5fa63017ea5e01a7c7a1. Browser pending. [Evidence](evidence/runs/SEN-06-backend-45919907679.md).

- CI 45919907679: browser 9 PASS, 1 FAIL at admin scenario exact label after real login and cohort API succeeded. Fix explicit filter labels and role locator, publish verified OpenAPI bytes together, rerun all checks and capture actual screenshot. No app or source regression results fabricated.
