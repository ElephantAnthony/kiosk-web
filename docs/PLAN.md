# SENIOSK V2 plan

## ROADMAP
| ID | Deliverable | State |
|---|---|---|
| EXECUTION 00 | Baseline, hygiene and harness | Verified |
| EXECUTION 01 | Spring and React foundation | PASS: all five CI jobs |
| EXECUTION 02 | Scenario contract and isolated sessions | PASS: all five CI jobs after JSON import fix |
| EXECUTION 03 (SEN-02B) | Server grading and completion | PASS: all five CI jobs |
| EXECUTION 04 | Schema-driven kiosk XState UI and fixture extension | ACTIVE: cancellation and schema-driven UI |
| EXECUTION 05 | Durable event ingestion and SDK | TODO |
| EXECUTION 06 | Admin funnel and accessibility completion | TODO |
| EXECUTION 07 | Release gate and portfolio evidence | TODO |

## ACTIVE
- Branch: portfolio/seniosk-v2. Main baseline 9477fe7ac6ebae0fbc2393d91dd7d1b0fc10756d unchanged.
- Latest source checkpoint: aa33c9b1890b6af6ffabdc0836192e07c33b2996.
- Previous final domain CI 45773007930: five jobs passed, two Playwright tests. JSON import attribute fixed; see [evidence](evidence/runs/SEN-02-pass-45773007930.md).
- Grading source: 8fc6dd20a42458f31e7e045b15bd61fcd72e25b7. Initial run 45773475536: Maven 19 unit + 15 PostgreSQL IT passed; mandatory API drift diff failed. Actual new spec recovered and committed, not manually fabricated.
- Latest strict run 45773698103: frontend: success; secret-scan: success; compose: in_progress; backend: success; legacy: success.
- Confirmed: Java 34 tests, Vitest 12, V1 characterization, Gitleaks zero unclassified, generated OpenAPI diff PASS. Flyway V2 applied. See [strict verification](evidence/runs/SEN-03-strict-45773698103.md).
- Next: inspect Compose/browser final result. Repair actual failure if any, rerun and record. If full CI green, proceed to EXECUTION 04.
- EXECUTION 04: XState START/MISSION/MENU/OPTION/CART/PAYMENT/COMPLETE; BACK/CANCEL/HELP, empty cart guard, one frozen submission on retry, server result display, large controls, keyboard/focus, high contrast. Add fictional fast-food fixture separately and prove renderer/machine unchanged. No event collection or admin until subsequent steps. Preserve all versioned contracts and source, regenerate actual OpenAPI only if API changes.
- Real user outcomes, operational deployment, performance load and final M1 gate remain unverified. No real participant data or external paid resource.
- [Evidence index](evidence/INDEX.md), [ERD](design/ERD.md), [API](design/API.md), [grading ADR](adr/003-grading-and-idempotency.md), [next task](prompts/SEN-04.md).

Execution 03 final CI 45773698103 all five jobs passed, three browser tests. Execution 04 starts with transactional cancellation sharing the grading row lock. Strict generated contract must be regenerated and verified. Acceptance: accessible full kiosk path, frozen retry, no empty checkout, second fixture only, real browser evidence.

Kiosk machine and renderer authored. Added state-transition and real-browser order, error, cancellation, keyboard and axe tests. Generic browser test iterates catalog; next add separate fixture without touching renderer or machine. Actual screenshot export is from Playwright only. Verification pending.
