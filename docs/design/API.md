# Training API (0.2.0)

Generated [OpenAPI 3.1](../../v2/contracts/openapi.json) is the machine-readable HTTP contract. Source is Springdoc and controller annotations. Maven PostgreSQL integration test exports a recursively key-sorted document, with environment-specific server URLs removed. CI compares it byte-for-byte with the committed file.

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | /healthz | 200 | 503 DB unavailable |
| GET | /api/scenarios | 200 | |
| GET | /api/scenarios/{scenarioId}/{version} | 200 | 404 |
| GET | /api/csrf | 200 | |
| POST | /api/sessions | 201 | 400, 403, 404 |
| GET | /api/sessions/{id} | 200 | 400, 404 |

Example POST JSON:

```json
{"scenarioId":"boram-cafe","version":1,"uiVariant":"standard"}
```

First fetch /api/csrf with the same browser cookie jar; set its returned header for POST. CSRF is not authentication by itself. Session ownership is a server-created UUID inside HttpSession, separate from the database session UUID exposed to the browser. A read by an unrelated browser returns 404 without disclosing existence. The API returns mission instruction, not private owner identifier. The scenario is intentionally a public educational fixture with expected orders; server-side scoring will rely on the persisted snapshot, never a client score.

Validation: Jakarta Bean Validation, strict JSON fields, JSON Schema Draft 2020-12, and server semantic validation. Unknown scenario or version returns 404. Malformed UUID or body returns 400. Authentication for administrators, completion submission, scoring and event ingestion are not implemented in this milestone.

Run locally at http://localhost:8080/swagger-ui.html after Compose starts. Use only synthetic practice sessions.
