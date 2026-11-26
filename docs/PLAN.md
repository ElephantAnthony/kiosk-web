# SENIOSK V2 plan

## ROADMAP
| ID | Deliverable | State |
|---|---|---|
| EXECUTION 00 | Baseline, hygiene and harness | Verified |
| EXECUTION 01 | Spring and React foundation | PASS |
| EXECUTION 02 | Scenario contract and isolated sessions | PASS |
| EXECUTION 03 | Server grading and completion | PASS: all five jobs, 45773698103 |
| EXECUTION 04 | Kiosk UI, cancellation and fixture extension | Implemented; Java/frontend/spec/scan PASS; final browser pending |
| EXECUTION 05 | Durable event ingestion and SDK | TODO, gated on 04 |
| EXECUTION 06 | Admin funnel and accessibility completion | TODO |
| EXECUTION 07 | Release gate and portfolio evidence | TODO |

## ACTIVE
- Branch: portfolio/seniosk-v2. Main baseline 9477fe7ac6ebae0fbc2393d91dd7d1b0fc10756d unchanged.
- Latest application source: f4668ee64cfe573e6bc14b4661f7786f0b9914ec.
- Previous gate 45773698103 all five jobs passed, three Playwright tests. [Evidence](evidence/runs/SEN-03-pass-45773698103.md).
- Cancellation 78cef9f, renderer/machine 93f3d45, tests 4817627, actor type fix c64f7ef, generated API f3d4d9d, fixture-only f4668ee. Fixture diff: one JSON file, 101 additions, 0 renderer/machine changes.
- Latest CI 45774770229: secret-scan: success; legacy: success; frontend: success; backend: success; compose: in_progress. Java 20 unit + 18 PostgreSQL IT, Vitest 16, OpenAPI diff, V1 and history scan passed. See [evidence](evidence/runs/SEN-04-kiosk-45774770229.md).
- Next: inspect actual Compose/browser result, fix observed failures, verify both scenario UI success markers and screenshot export. Commit real screenshot bytes and link README only if source is verified. Do not advance to EXECUTION 05 until required verification passes.
- Next task: [event SDK and ingestion](prompts/SEN-05.md). Existing state machine and fixture must remain data-driven. No actual participant data or real payments, deployment, or bulk performance claims.
- Known limitations: orphan session if creation response lost, no browser reload recovery for cart yet, anonymous session expiry, approximate client active time. Event persistence and admin not implemented.
