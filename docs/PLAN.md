# SENIOSK V2 plan

## ROADMAP
| ID | Deliverable | State |
|---|---|---|
| SEN-00 | Branch, audit, hygiene, harness | Verified |
| SEN-01 | Spring and React foundation | PASS: all 5 CI jobs |
| SEN-02 | Shared scenario, PostgreSQL domain, session API, generated spec | Implemented; backend/frontend verified; final full strict CI pending |
| SEN-02B | Deterministic server grading, completion and idempotency | TODO after SEN-02 gate |
| SEN-03 | Durable events | TODO |
| SEN-04 | Admin and accessibility | TODO |
| SEN-05 | Kiosk E2E, evidence, final portfolio | TODO |

## ACTIVE
- Branch: portfolio/seniosk-v2. Main baseline 9477fe7ac6ebae0fbc2393d91dd7d1b0fc10756d unchanged.
- Source checkpoint: 5f43dda4f538a2e12e87da13184c18a0ed03224d.
- Foundation: [final green CI 45771026505](evidence/runs/SEN-01-pass-45771026505.md), 5 jobs PASS.
- Domain: [run 45772148779](evidence/runs/SEN-02-domain-45772148779.md), 8 Java unit, 5 PostgreSQL IT, 8 Vitest PASS. Real migration, concurrent isolation, immutable version, CSRF, input validation and FK verified. Gitleaks 0 unclassified findings. Ajv lock and generated OpenAPI independently digest-verified.
- Added mandatory generated OpenAPI diff and disposable local PostgreSQL verification. Final full CI including proxy E2E and axe must be confirmed before SEN-02B.
- Next: inspect latest CI; fix observed failures if any, then add grading and submit endpoint with server-owned snapshot, normalized order multiset and D5 formula. Include duplicate submission and concurrency tests. No actual user data, deployment or payment.
- Evidence: [index](evidence/INDEX.md). API: [design](design/API.md), [spec](../v2/contracts/openapi.json). ERD: [design](design/ERD.md).
