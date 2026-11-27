# Event pipeline

```mermaid
sequenceDiagram
    participant X as XState observer
    participant O as IndexedDB outbox
    participant F as Batch flusher
    participant S as Spring event API
    participant P as PostgreSQL
    X->>O: UUID + session metadata, allocate sequence atomically
    O-->>X: transaction committed
    F->>O: read up to 20 for one session
    F->>S: POST with session cookie and CSRF
    S->>P: lock owned session, validate, insert or compare
    P-->>S: COMMIT
    alt ACK received and matches sent IDs
        S-->>F: acknowledgedIds
        F->>O: delete exact ACKed rows
    else response lost or 429
        F->>O: retain immutable rows
        F->>S: identical retry after backoff
        S->>P: same identity comparison
        S-->>F: ACK existing rows
    else conflict
        S-->>F: 409; batch rolled back
        F->>O: keep blocked records
    end
```

The SDK records session start, mission confirmation, category and menu choice, option, quantity, cart add/edit/remove, back, help, payment attempt, terminal result/cancel and state transitions. It does not record typed text or actual payment values. For analytics, treat sequence as per-session ordering and received_at as server arrival. Late events and duplicate deliveries are expected; counts must be by persisted distinct session or event ID, not HTTP requests. See [event schema](../../v2/contracts/event.schema.json) and [ADR](../adr/005-durable-event-outbox.md).

Verification scope: synthetic session, same browser origin and live owner cookie, controlled offline and response-loss cases. Browser reload restores pending events, not the order cart. Pagehide is best-effort. No measured throughput or participant behavior claim.
