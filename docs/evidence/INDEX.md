# Evidence index

- [Hygiene tree comparison](runs/SEN-00-hygiene.md): verified removal of 10898 generated files.
- [Initial CI](runs/SEN-01-ci-45769057010.md): backend 3 tests and V1 reproduction 1 test PASS; initial frontend/Compose/history scan FAIL.
- [Security triage checkpoint](runs/SEN-01-FIX-triage.md): previous aggregate-only result.
- [Security source verification](runs/SEN-01-security-45770313225.md): four exact upstream library false positives.
- [Follow-up failure](runs/SEN-01-fix-45770554222.md): npm install and lint PASS, TypeScript type conflict and two documentation-quotation false positives.
- [Dependency alignment](runs/SEN-01-fix-45770748724.md): frontend all checks and history scan PASS, Compose startup and readiness PASS, browser installation FAIL on unsupported runner. Actual lockfile committed.
- [Latest checkpoint](runs/SEN-01-final-checkpoint.md): subsequently confirmed by final pass below.
- V2 session isolation, grading, event recovery, funnel, kiosk E2E, participant outcomes: NOT_RUN.

- [Foundation final pass](runs/SEN-01-pass-45771026505.md): all five jobs green, live DB health and Chromium/axe smoke passed.

- [SEN-02 bootstrap](runs/SEN-02-bootstrap-45771847340.md): Java unit and PostgreSQL integration passed; generated Ajv lock verified; OpenAPI review found missing response annotation, fixed pending verification.

- [SEN-02 domain verification](runs/SEN-02-domain-45772148779.md): 8 Java unit + 5 PostgreSQL IT + 8 Vitest passed; OpenAPI generated and committed; final strict CI pending.

- [SEN-02 strict CI](runs/SEN-02-strict-45772447666.md): OpenAPI diff, backend, frontend, legacy, scan pass; Compose/browser result pending at checkpoint.
