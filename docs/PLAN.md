# SENIOSK V2 plan

## ROADMAP
| ID | Deliverable | State |
|---|---|---|
| SEN-00 | Branch, audit, hygiene, harness | Hygiene verified, V1 defect reproduced, security triage required |
| SEN-01 | Spring and React foundation | SOURCE WRITTEN; BLOCKED by security scan and npm |
| SEN-02 | Shared contract, database and grading | TODO, gated on SEN-01 |
| SEN-03 | Durable events | TODO |
| SEN-04 | Admin and accessibility | TODO |
| SEN-05 | E2E, evidence, README | TODO |

## ACTIVE
- Branch: portfolio/seniosk-v2
- Base main: 9477fe7ac6ebae0fbc2393d91dd7d1b0fc10756d
- Last implementation commit: ae7bfbe166e1dbb6ef1b9ba99ff68fab367764c2
- CI: https://github.com/ElephantAnthony/kiosk-web/actions/runs/45769057010
- DONE: Spring source (Maven verify success, 3 tests), React source, Compose, CI, README initial, V1 runtime reproduction (1 test).
- FAILED: npm install and frontend Docker image build; Gitleaks 4 findings across 192 commits, validity unknown.
- NOT VERIFIED: full DB health runtime, frontend lint/typecheck/tests/build, Playwright/axe, lockfile, production security/deployment.
- DECISION: no new feature implementation or remote code fixes pending security triage. Only non-sensitive documentation checkpoint records results.
- NEXT: EXECUTION 01-FIX. Owner privately review redacted findings; revoke/rotate genuine secrets and confirm authorization to continue. Do not rewrite history or publish values. After cleared, investigate npm Arborist edgesOut (npm 11 pinned candidate, see troubleshooting); rerun CI and commit genuine lockfile. Only advance to SEN-02 after required checks pass.
