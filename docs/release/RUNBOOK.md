# Local execution and verification

Scope: localhost only, synthetic practice data. Docker Desktop (Windows) or Docker Engine + Compose v2. Use the portfolio/seniosk-v2 branch, not the legacy main branch.

```powershell
git clone -b portfolio/seniosk-v2 https://github.com/ElephantAnthony/kiosk-web.git
cd kiosk-web/v2
Copy-Item .env.example .env
notepad .env
docker compose config -q
docker compose up --build -d --wait
docker compose ps
```

Set a unique DB_PASSWORD; optionally ADMIN_USERNAME and ADMIN_PASSWORD (16+ characters, at most 72 UTF-8 bytes). No default admin. Use a unique password and do not commit or print the .env. Existing DB volume retains the initial database password; changing .env does not rotate the database password. Do not delete a valuable volume to resolve credentials.

Learner http://localhost:5173; admin http://localhost:5173/admin; health http://localhost:8080/healthz; Swagger UI http://localhost:8080/swagger-ui.html. Open browser, select a scenario, follow the mission and use mock payment. To see admin stats, log in with the local configured account.

Troubleshooting: docker compose ps, docker compose logs --tail=100 backend, docker compose logs --tail=100 db. Inspect logs privately; do not upload credentials or participant data. If port conflict, stop the unrelated process only with its owner's consent or adjust mapped ports. Health failure: check local .env, service health, schema migration logs. Admin disabled: check env settings, rebuild/recreate backend as needed. No public exposure.

Stop with docker compose down (preserves volume). docker compose down -v destroys local DB volume; only for intentional disposable data. CI uses disposable DB and volume.

## Full source verification

Java 21, Maven, Node 22.16, npm 11.21.2, Docker, openssl, Git Bash/WSL/Linux. Export ADMIN_USERNAME and ADMIN_PASSWORD matching local compose without putting values in command history. From repo root: bash v2/scripts/verify. This script creates a separate temporary PostgreSQL for integration tests, compares generated OpenAPI, runs frontend checks and local browser tests. It leaves the local demo running; stop separately. CI also runs V1 characterization and Gitleaks history scan. No local test execution is claimed by documentation alone.

If CI fails, check [troubleshooting](TROUBLESHOOTING.md) and [evidence](../evidence/INDEX.md), record exact source SHA and failed job. Do not bypass OpenAPI diff or secret scanning.
