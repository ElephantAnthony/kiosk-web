# Final learning and interview preparation

## Five plain-language points
A browser can lose a response even after a server commits data.
A database transaction and stable request identity make retries safe within tested boundaries.
Each learner must only see their own session, regardless of administrator login.
Behavioral events describe observations; server results establish grading outcomes.
A green test suite proves specific executed scenarios, not general production readiness.

## Study route

1. [Phase 1](phase-1.md): IoC/DI, MVC, Docker health, CI and lockfiles.
2. [Phase 2](phase-2.md): DTO/Repository/Service, JDBC, Flyway, JSON Schema, session ownership.
3. [Phase 3](phase-3.md): @Transactional, FOR UPDATE, normalized grade, unique result, conflict/replay.
4. [Phase 4](phase-4.md): XState guards, frozen retries, fixture-only extensibility, accessibility.
5. [Phase 5](phase-5.md): IndexedDB transaction, outbox, ACK, retry and idempotency.
6. [Phase 6](phase-6.md): Spring Security filter chain, CSRF, BCrypt, SQL CTE and aggregate denominators.

## Three demonstration locations
- GradingService.java: show transaction and row lock.
- analytics-sdk/sdk.ts: show persistence-before-send and exact ACK handling.
- FunnelRepository.java: show event rollup before result join.

## Practice questions
- Explain the original shared cart defect and reproduce it with two clients.
- What happens if the first submit succeeds but its response disappears?
- Why does event replay not create another database row?
- Why can server completion and funnel completion differ?
- How would you respond to health failure or a failed migration without deleting data?
- Which claims are not proven by the existing tests?

The user should run the service, trace code and reproduce failures themselves before describing personal implementation experience. AI-assisted source changes are not proof of individual understanding. No assessed answers or personal achievement claims are stored in this public repository.
