# SENIOSK V2 plan

## ROADMAP
| ID | Deliverable | State |
|---|---|---|
| SEN-00 | Branch, audit, hygiene, harness | Hygiene verified, V1 defect reproduced, security triage complete |
| SEN-01 | Spring and React foundation | PASS: all five foundation CI jobs |
| SEN-02 | Shared contract, database and grading | ACTIVE: schema, persistence, session API and tests |
| SEN-03 | Durable events | TODO |
| SEN-04 | Admin and accessibility | TODO |
| SEN-05 | E2E, evidence, README | TODO |

## ACTIVE
- Branch: portfolio/seniosk-v2
- Base main: 9477fe7ac6ebae0fbc2393d91dd7d1b0fc10756d
- Last implementation/CI change: ee6d55e1767fad76fe4813a83658c7b60380f6e2
- Active CI: https://github.com/ElephantAnthony/kiosk-web/actions/runs/45771026505
- DONE: all four original scanner findings plus two later documentation quotations verified as false positives. Exact historical fingerprints only; no credential rotation required. History scan passed with zero unclassified findings in run 45770748724.
- DONE: npm 11.21.2 pin, Playwright/core 1.56.1 alignment, actual lockfile with verified SHA-256, mandatory npm ci. Frontend lint/typecheck/4 tests/build, Maven and V1 reproduction passed.
- DONE: Compose services started and direct/proxied health returned UP in run 45770748724. Browser installation failed on unsupported Ubuntu 26.04. Runner changed to Ubuntu 24.04.
- OBSERVED: run 45770967159 frontend npm ci and all subsequent checks passed; remaining jobs canceled by newer runner fix.
- Latest run at checkpoint: compose: in_progress; backend: success; secret-scan: success; legacy: success; frontend: success.
- NOT VERIFIED: final locked full CI and browser screenshot/axe until successful results observed. No claim that M1 or foundation is fully complete.
- NEXT: inspect run 45771026505. If failure, repair only observed causes, rerun, and record. If all jobs pass, update README and evidence, link actual browser report and proceed with SEN-02 schema/data model/API. Preserve main, no deployment or paid services, no real participant data.
- Evidence: [initial run](evidence/runs/SEN-01-ci-45769057010.md), [security source comparison](evidence/runs/SEN-01-security-45770313225.md), [npm/Playwright fix](evidence/runs/SEN-01-fix-45770554222.md), [lockfile and integration](evidence/runs/SEN-01-fix-45770748724.md), [latest checkpoint](evidence/runs/SEN-01-final-checkpoint.md).

### SEN-02 acceptance
Foundation final run 45771026505 completed: all five jobs passed including Chromium and axe. Evidence: [final pass](evidence/runs/SEN-01-pass-45771026505.md).
SEN-02: shared scenario schema and fictional cafe, immutable scenario version, atomic training session plus mission persistence, CSRF-protected session API, owner isolation, PostgreSQL integration tests and generated OpenAPI. No grading submission, events, admin or real user study yet.
Verification: Maven unit and PostgreSQL integration, schema validation on both runtimes, locked frontend build, generated API contract diff, regression CI. Record any incomplete check; do not advance until required tests pass.

SEN-02 backend source authored: scenario schema + fixture, Flyway V1, catalog, transaction, ownership and API, unit/integration tests. Next: configure PostgreSQL integration CI and generate Ajv lock + OpenAPI. Verification pending.
