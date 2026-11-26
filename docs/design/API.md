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
| POST | /api/sessions/{id}/events | 200 | 400, 403, 404, 409 |

Example POST JSON:

```json
{"scenarioId":"boram-cafe","version":1,"uiVariant":"standard"}
```

First fetch /api/csrf with the same browser cookie jar; set its returned header for POST. CSRF is not authentication by itself. Session ownership is a server-created UUID inside HttpSession, separate from the database session UUID exposed to the browser. A read by an unrelated browser returns 404 without disclosing existence. The API returns mission instruction, not private owner identifier. The scenario is intentionally a public educational fixture with expected orders; server-side scoring relies on the persisted snapshot, never a client score.

Validation: Jakarta Bean Validation, strict JSON fields, JSON Schema Draft 2020-12, and server semantic validation. Unknown scenario or version returns 404. Malformed UUID or body returns 400. Administrator authentication is not implemented. Event endpoint and shared schema implemented; actual generated OpenAPI committed, strict re-verification pending.

Run locally at http://localhost:8080/swagger-ui.html after Compose starts. Use only synthetic practice sessions.

## Submit a simulated order

Use the same session cookie and a CSRF token for POST.

```json
{"order":[{"menuId":"americano","optionIds":["ice"],"packing":"TAKE_OUT","quantity":2}],"payment":"CARD","clientActiveMs":1000}
```

The response includes sessionId, matched, missing, extra, accuracy (0..1, six-decimal rounding), paymentMatched, correct, serverElapsedMs, clientActiveMs and completedAt. No client score is accepted. One result per session. The same normalized order, payment and active-time input returns the original result even when reordered or split. A different valid submission after completion is 409. The caller must freeze the input when retrying after connection uncertainty. Unknown or other-owner sessions and not-yet-available results return 404. The endpoint accepts an empty actual order for missing-item grading; the UI prevents empty checkout. The submitted data is synthetic practice data and contains no real payment details.

Cancel uses the same owner and CSRF checks and session row lock as submit. Replaying cancellation returns CANCELLED; completing first prevents cancellation (409). A cancelled session cannot be submitted. No new result row on cancellation.

## Event ingestion

POST /api/sessions/{id}/events with the same owner cookie and CSRF header. Body has an events array with 1..20 objects conforming to the [shared event schema](../../v2/contracts/event.schema.json). All events must refer to the path session and its immutable scenario version and UI variant. The JSON Schema is the precise event contract; generated HTTP OpenAPI describes the envelope and ACK. Example synthetic body:

```json
{"events":[{"eventId":"00000000-0000-4000-8000-000000000001","sessionId":"00000000-0000-4000-8000-000000000002","sequence":1,"eventType":"SESSION_STARTED","scenarioId":"boram-cafe","scenarioVersion":1,"clientTimestamp":"2026-01-01T00:00:00.000Z","uiVariant":"standard","payload":{}}]}
```

The example session ID must be replaced with the caller's real synthetic training session. HTTP 200 returns {"acknowledgedIds":[event UUIDs]}; ACK order is not significant. A repeated ID with identical JSONB content is accepted; changed content or sequence collision returns 409 and rolls back the entire batch. Other owner returns 404. Invalid schema or scenario references return 400; missing CSRF returns 403. The client supports 429 Retry-After from infrastructure; the server does not yet implement a rate limiter. No partial success ACK. Late records for terminal sessions are allowed without changing status or result.
