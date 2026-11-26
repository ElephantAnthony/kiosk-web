# Evidence index
- [Hygiene tree comparison](runs/SEN-00-hygiene.md): verified remote tree comparison, 10898 generated files removed.
- V1 static audit: VERIFIED.
- [SEN-01 CI run](runs/SEN-01-ci-45769057010.md): backend PASS (3 tests); V1 defect reproduction PASS (1 test); frontend installation FAIL; Compose FAIL; history scan FAIL (4 findings, validity unknown).
- V2 session isolation, grading, event recovery, funnel, full browser and axe: NOT_RUN.
- Actual participant outcomes: NOT_RUN.
Release and next implementation gate: BLOCKED. No secret values stored.

- [SEN-01-FIX triage checkpoint](runs/SEN-01-FIX-triage.md): previous CI results reconfirmed; no detailed security report available; owner action required. No new test run.

- [Security triage](runs/SEN-01-security-45770313225.md): four upstream-library false positives verified; exact fingerprint disposition; filtered re-scan pending.

- [Foundation follow-up](runs/SEN-01-fix-45770554222.md): installation and lint pass; typecheck and security still failed; precise fixes applied, re-run required.

- [Dependency alignment and lockfile](runs/SEN-01-fix-45770748724.md): frontend/backend/legacy and history scan PASS; lockfile verified and mandatory npm ci configured; final locked CI pending.
