# Training API (0.3.0)

Generated [OpenAPI 3.1](../../v2/contracts/openapi.json) is the machine-readable HTTP contract. Source is Springdoc and controller annotations. Maven PostgreSQL integration test exports a recursively key-sorted document, with environment-specific server URLs removed. CI compares it byte-for-byte with the committed file.

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | /healthz | 200 | 503 DB unavailable |
| GET | /api/scenarios | 200 | |
| GET | /api/scenarios/{scenarioId}/{version} | 200 | 404 |
| GET | /api/csrf | 200 | |
| POST | /api/sessions | 201 | 400, 403, 404 |
| GET | /api/sessions/{id} | 200 | 400, 404 |
| POST | /api/sessions/{id}/submit | 200 | 400, 403, 404, 409 |
| GET | /api/sessions/{id}/result | 200 | 400, 404 |
| POST | /api/sessions/{id}/cancel | 200 | 403, 404, 409 |

Example POST JSON:

```json
{"scenarioId":"boram-cafe","version":1,"uiVariant":"standard"}
```

First fetch /api/csrf with the same browser cookie jar; set its returned header for POST. CSRF is not authentication by itself. Session ownership is a server-created UUID inside HttpSession, separate from the database session UUID exposed to the browser. A read by an unrelated browser returns 404 without disclosing existence. The API returns mission instruction, not private owner identifier. The scenario is intentionally a public educational fixture with expected orders; server-side scoring relies on the persisted snapshot, never a client score.

Validation: Jakarta Bean Validation, strict JSON fields, JSON Schema Draft 2020-12, and server semantic validation. Unknown scenario or version returns 404. Malformed UUID or body returns 400. Administrator authentication and event ingestion are not implemented in this milestone.

Run locally at http://localhost:8080/swagger-ui.html after Compose starts. Use only synthetic practice sessions.

## Submit a simulated order

Use the same session cookie and a CSRF token for POST.

```json
{"order":[{"menuId":"americano","optionIds":["ice"],"packing":"TAKE_OUT","quantity":2}],"payment":"CARD","clientActiveMs":1000}
```

The response includes sessionId, matched, missing, extra, accuracy (0..1, six-decimal rounding), paymentMatched, correct, serverElapsedMs, clientActiveMs and completedAt. No client score is accepted. One result per session. The same normalized order, payment and active-time input returns the original result even when reordered or split. A different valid submission after completion is 409. The caller must freeze the input when retrying after connection uncertainty. Unknown or other-owner sessions and not-yet-available results return 404. The endpoint accepts an empty actual order for missing-item grading; future UI prevents empty checkout. The submitted data is synthetic practice data and contains no real payment details.

Cancel uses the same owner and CSRF checks and session row lock as submit. Replaying cancellation returns CANCELLED; completing first prevents cancellation (409). A cancelled session cannot be submitted. No new result row on cancellation.
