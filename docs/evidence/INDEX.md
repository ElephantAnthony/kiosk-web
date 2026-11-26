# Evidence index

- [Hygiene tree comparison](runs/SEN-00-hygiene.md): verified removal of 10898 generated files.
- [Initial CI](runs/SEN-01-ci-45769057010.md): backend 3 tests and V1 reproduction 1 test PASS; initial frontend/Compose/history scan FAIL.
- [Security triage checkpoint](runs/SEN-01-FIX-triage.md): previous aggregate-only result.
- [Security source verification](runs/SEN-01-security-45770313225.md): four exact upstream library false positives.
- [Follow-up failure](runs/SEN-01-fix-45770554222.md): npm install and lint PASS, TypeScript type conflict and two documentation-quotation false positives.
- [Dependency alignment](runs/SEN-01-fix-45770748724.md): frontend all checks and history scan PASS, Compose startup and readiness PASS, browser installation FAIL on unsupported runner. Actual lockfile committed.
- [Latest checkpoint](runs/SEN-01-final-checkpoint.md): final locked browser CI pending confirmation.
- V2 session isolation, grading, event recovery, funnel, kiosk E2E, participant outcomes: NOT_RUN.
