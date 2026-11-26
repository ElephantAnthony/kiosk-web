# Phase 1 learning
## Nontechnical explanation
The website checks whether the server and database are available.
The server attempts a small database query rather than returning a fabricated success.
Docker describes the services and their startup order.
GitHub Actions independently compiles and tests code.
Failures are recorded, not hidden or counted as a successful release.

## Code locations
- v2/backend/src/main/java/com/seniosk/health/HealthController.java
- v2/frontend/src/api/health.ts
- .github/workflows/ci.yml

## Decision and alternatives
Use an explicit JDBC readiness query and a 503 failure rather than a constant OK response. Use a Vite development proxy and loopback-bound services rather than public deployment. Default-deny all routes except health and documentation until the auth milestone; do not disable CSRF.

## Interview questions
1. What is the difference between liveness and database readiness?
2. Why is a server returning HTTP 200 insufficient evidence of a connected database?
3. Why does a passing mocked controller test not demonstrate that Compose integration works?

Understanding: not assessed. CI proves backend build and unit tests, not complete runtime.
