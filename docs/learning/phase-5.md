# Phase 5 learning

## Nontechnical explanation
The kiosk saves a small event record on the device before trying to send it.
A temporary internet interruption leaves unsent records in IndexedDB.
The server sends acknowledgment only after the database transaction succeeds.
Repeated transmission of the same event cannot create another stored row.
Client behavior records and server grading results are different kinds of evidence.

## Three code paths
- v2/frontend/src/analytics-sdk/outbox.ts: atomic sequence allocation and event persistence
- v2/frontend/src/analytics-sdk/sdk.ts: batch ACK validation, backoff and retry
- v2/backend/src/main/java/com/seniosk/event/EventService.java: owned session, validation and atomic ingestion

## Choices
IndexedDB instead of localStorage gives a transaction for sequence and event. One event UUID and a sequence uniqueness constraint distinguish exact replay from conflict. All-or-nothing batches avoid partial acknowledgment ambiguity; blocked invalid batches are retained, not silently deleted. Web Locks reduces parallel flushes but PostgreSQL is the final authority. Retry-After support does not imply the application has a rate limiter.

## Interview questions
1. What happens when PostgreSQL commits but the browser loses the response?
2. Why is the client event UUID generated before network transmission and never changed during retry?
3. Why does an ACK need to match the entire batch, and how is the server transaction protected?

Understanding not assessed. Actual verification results belong in the evidence index.
