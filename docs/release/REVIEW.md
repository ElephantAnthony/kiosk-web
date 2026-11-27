# M1 source review and release boundary

Reviewed existing GradingService, EventService, learner session ownership, AdminSecurity, admin UI, telemetry hooks, API client, Compose and CI. Single agent source review, not independent audit.

- Grading and event ingestion obtain owner-scoped row lock; transaction protects final state/result or entire batch. Replayed order and event IDs have explicit conflict handling. Existing integration and browser tests provide evidence.
- Admin chain separate from learner context; credentials absent disables auth; CSRF enabled, session rotation, no default password. Reports no owner IDs or raw event body. Local-only ports; no TLS in local Compose, no rate limiter, no MFA, no production authorization lifecycle.
- Client timing and events cannot establish real user outcomes. Outbox retains rejected records, storage eviction and expired owner cookie remain limitations. No cart reload recovery. Pagehide best effort, not an independently executed termination test.
- Admin report 401 path previously left loading true until a new request. Clear report and loading on unauthorized response before returning to login. Verify regression in full CI; no separate targeted expiry test yet.
- Additional capture of start, mission, option, cart, payment and result in existing real cafe flow, each with axe serious/critical check. Existing tests cover keyboard interaction, high contrast and button sizing on selected screens, not a complete manual WCAG conformance audit.
- No additional runtime libraries, external participant data, bulk benchmark or deployment. Gitleaks is secret scanning, not dependency vulnerability scanning or penetration testing.

Release decision requires all M1 checks, actual screenshots and documentation; pending next CI.
