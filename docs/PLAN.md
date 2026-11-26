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

### SEN-01-FIX checkpoint
- Re-read repository files, branch refs, CI jobs, scanner log and artifacts at 6ef79cdcb136f8b5e8c8c65f72ee26035eae31e9.
- No detailed per-finding report was available; only 4 findings across 192 commits confirmed.
- No code changes or new CI run; previous results remain valid only for their tested commit.
- Owner action: [private security triage](troubleshooting/SEN-01-security-triage.md).
- [Checkpoint evidence](evidence/runs/SEN-01-FIX-triage.md). Continue SEN-01-FIX, not SEN-02.

### Security triage resolution
- Run 45770313225: 4 findings, all exact upstream setuptools function aliases. Evidence: [security triage](evidence/runs/SEN-01-security-45770313225.md).
- No genuine credential among these findings; no issuance needed. Four precise fingerprints added, scanner remains enforced. Re-scan pending.
- Next: fix npm resolution, generate lockfile, rerun all foundation gates. Do not advance to SEN-02 until verified.

### Foundation follow-up
- Run 45770554222: npm pin/install, ESLint, Maven and V1 pass; TS2740 failure due to mismatched Playwright core versions. Two documented quotations detected as false positives; checked exact lines and extended fingerprint list only for those lines. No secret rotation needed.
- Next attempt: align playwright-core, regenerate actual lockfile, validate security and integration. Source commit before fix: 8b0a04a9f0046266a2500695728f1c8291f07564.

### Lockfile checkpoint
- CI 45770748724: backend, legacy, frontend and filtered history scan passed; 198 commits, zero unclassified findings. Compose at checkpoint: pending.
- Generated package-lock.json recovered from actual CI output and verified against digest, length and manifest. Switch to mandatory npm ci; remove bootstrap export.
- Next: inspect final locked CI and capture real browser evidence. Do not advance until all required checks are confirmed.

### Runner compatibility checkpoint
- Run 45770748724 completed: Compose startup and both database-backed HTTP checks PASS. Browser installation FAIL (unsupported Ubuntu 26.04).
- Lockfile committed in d922e8663c1febc3b674ecaf4aa2f49d8254070d; CI and Docker require npm ci. Pin runner Ubuntu 24.04, preserving all tests. Re-run and check final result before SEN-02.
