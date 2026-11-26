# Phase 4 learning

## Nontechnical explanation
A learner selects a fictional store and receives a mission from the server.
The same interface displays different menus using JSON data, not store-specific screens.
The state machine blocks checkout with an empty cart or incomplete options.
A lost order response can be retried without altering the original submission.
Cancellation waits for server confirmation; result and cancel cannot both win.

## Core code locations
- v2/frontend/src/kiosk/machine.ts: states, guards, actors and frozen payload
- v2/frontend/src/App.tsx: accessible data-driven rendering
- v2/backend/src/main/java/com/seniosk/session/SessionService.java: cancellation under the same row lock as grading

## Tradeoffs
XState makes permitted transitions explicit instead of distributing boolean flags across UI components. Promise actors centralize network state. A frozen payload is essential because the backend compares normalized order, payment and active time. The second store is a data fixture with no new renderer. Visible interaction time is approximate; neither keyboard tests nor axe constitute complete WCAG certification.

## Interview questions
1. Why is an identical payload required when retrying a response that might have been lost after commit?
2. How does the same state machine render a new store without a new component?
3. What makes cancellation and completion mutually exclusive in PostgreSQL?

Understanding not assessed. Full browser result must be checked against the evidence log.
