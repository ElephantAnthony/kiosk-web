# Evidence index

- [Hygiene tree comparison](runs/SEN-00-hygiene.md): verified removal of 10898 generated files.
- [Initial CI](runs/SEN-01-ci-45769057010.md): backend 3 tests and V1 reproduction 1 test PASS; initial frontend/Compose/history scan FAIL.
- [Security triage checkpoint](runs/SEN-01-FIX-triage.md): previous aggregate-only result.
- [Security source verification](runs/SEN-01-security-45770313225.md): four exact upstream library false positives.
- [Follow-up failure](runs/SEN-01-fix-45770554222.md): npm install and lint PASS, TypeScript type conflict and two documentation-quotation false positives.
- [Dependency alignment](runs/SEN-01-fix-45770748724.md): frontend all checks and history scan PASS, Compose startup and readiness PASS, browser installation FAIL on unsupported runner. Actual lockfile committed.
- [Latest checkpoint](runs/SEN-01-final-checkpoint.md): subsequently confirmed by final pass below.
- Full kiosk E2E verified below. Event recovery verified in source CI below; final strict CI, funnel and participant outcomes await verification. Session isolation and grading have verified integration evidence below.

- [Foundation final pass](runs/SEN-01-pass-45771026505.md): all five jobs green, live DB health and Chromium/axe smoke passed.

- [SEN-02 bootstrap](runs/SEN-02-bootstrap-45771847340.md): Java unit and PostgreSQL integration passed; generated Ajv lock verified; OpenAPI review found missing response annotation, fixed pending verification.

- [SEN-02 domain verification](runs/SEN-02-domain-45772148779.md): 8 Java unit + 5 PostgreSQL IT + 8 Vitest passed; OpenAPI generated and committed; final strict CI pending.

- [SEN-02 strict CI](runs/SEN-02-strict-45772447666.md): OpenAPI diff, backend, frontend, legacy, scan pass; Compose/browser result pending at checkpoint.

- [SEN-02 gate repair](runs/SEN-02-pass-45773007930.md): previous Compose/browser failure resolved; all five jobs success.

- [SEN-03 grading verification](runs/SEN-03-grading-45773475536.md): Maven 19 unit + 15 real PostgreSQL IT passed; strict spec drift detected; generated file committed for re-run.

- [SEN-03 strict verification](runs/SEN-03-strict-45773698103.md): 34 Java, 12 Vitest, strict generated OpenAPI diff, legacy, history scan PASS; final Compose/browser pending at checkpoint.

- [SEN-03 final gate](runs/SEN-03-pass-45773698103.md): all five jobs passed including three Playwright tests.

- [Cancellation CI](runs/SEN-04-cancel-45774326789.md): PostgreSQL tests passed, generated contract drift resolved.
- [Kiosk verification](runs/SEN-04-kiosk-45774770229.md): Java 38, Vitest 16, OpenAPI diff, V1, history scan PASS; final browser pending at checkpoint.

- [Kiosk locator repair](troubleshooting/SEN-04-category-locator.md): run 45775017053, six browser tests passed; one failed due to ambiguous category selector; retry required.

- [Browser run 45775017053](runs/SEN-04-browser-45775017053.md): 6 browser passes, 1 locator failure, cafe success; repair 444830a and retry 45775831858. Event work gated.

- [SEN-04 final gate](runs/SEN-04-pass-45775831858.md): both scenario flows, seven browser tests, all five jobs and actual capture verified.

- SEN-05 source 8e483d7: [CI 45776976931](https://github.com/ElephantAnthony/kiosk-web/actions/runs/45776976931), Vitest 22, frontend build/typecheck/lint PASS. Backend and full browser result pending.

- [SEN-05 source verification](runs/SEN-05-event-45776976931.md): 42 Java, 22 Vitest, 9 browser PASS, eight offline/reloaded events, 429, scan, V1; contract drift detected and actual output recovered.

- [SEN-05 strict verification](runs/SEN-05-strict-45777346496.md): generated API diff PASS, Java/frontend/V1/scan PASS; final browser pending at checkpoint.

- [SEN-05 final gate](runs/SEN-05-pass-45777346496.md): all five jobs success, nine browser tests, eight persisted events recovered.

- SEN-06 source CI [45919739819](https://github.com/ElephantAnthony/kiosk-web/actions/runs/45919739819): auth, cohort and dashboard tests authored; results pending.

- [SEN-06 initial verification](runs/SEN-06-initial-45919739819.md): 23 Vitest, 20 Java unit, 25/26 PostgreSQL IT; actual expected response, failed wildcard assertion; repair and full verification required.

- [SEN-06 repaired backend and EXPLAIN](runs/SEN-06-backend-45919907679.md): 48 Java, frontend/V1/scan pass; exact synthetic counts; actual generated contract recovered; browser and strict gate pending.

- [Admin filter accessibility repair](../troubleshooting/SEN-06-admin-filter-label.md): nine browser passes; admin test failed at exact scenario label, explicit labels required. Strict spec bytes recovered.

- [SEN-06 browser repair and strict checkpoint](runs/SEN-06-browser-45919907679.md): 9 prior browser tests passed; admin label timeout repaired, actual OpenAPI committed, strict CI 45920332880 pending final outcome.

- [SEN-06 final gate](runs/SEN-06-pass-45920332880.md): all five jobs pass, 48 Java, 23 Vitest, 10 Chromium; actual admin JPEG verified.

- [SEN-07 final M1 release](runs/SEN-07-pass-45922321237.md): all five jobs green, 82 tests, six additional actual captures with verified digests, total eight images. Final evidence supersedes older pending checkpoints.
