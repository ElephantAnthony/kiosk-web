# SEN-01 execution task
Start from 3c62eef; preserve main and V1.
Implement Spring Boot Java 21, React TypeScript Vite, PostgreSQL Compose, CI and health checks. Add tests first in the same change set where local execution is unavailable. Record evidence, do not claim green CI without an observed run. Initialize Korean README and keep it consistent with actual functionality. No domain API, kiosk machine or participant data yet.
Acceptance: compile, lint, typecheck, unit tests, Compose startup with database-backed health, V1 reproduction, history scan. Fix failing checks before advancing.
