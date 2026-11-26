# SENIOSK 2.0 agent guide

## Purpose
Build a browser-based kiosk training system with reliable session isolation, deterministic grading and durable event collection.
The public portfolio prioritizes evidence over feature count.

## Scope and boundaries
- Work only on portfolio/seniosk-v2; preserve main and V1 application source.
- Java 21, Spring Boot, PostgreSQL, React, TypeScript, Vite, XState.
- Use fictional brands and original assets; no real payment or real participant data.
- No paid deployment, history rewriting, force pushes or credentials in Git.
- Do not claim user outcomes, test passes or individual understanding without evidence.
- New Korean documentation must not contain U+00B7.
- Keep career applications and personal histories outside the public repository.
- Read docs/index.md and docs/PLAN.md before every resumed task.
- Contracts are the source of truth; update tests when a contract changes.
- Prefer a modular monolith; do not add Kafka, Redis or Kubernetes without measured need.

## Work loop
1. Record task ID, scope and acceptance criteria in PLAN.
2. Inspect existing code and the relevant contract.
3. Reproduce the defect or write a focused failing test where possible.
4. Implement the smallest coherent change.
5. Run verification and record command, exit code and observed output.
6. Review privacy, concurrency, failure recovery, accessibility and regression risk.
7. Update evidence and learning notes; commit logically grouped files.
8. If tools cannot execute tests, explicitly mark NOT_RUN or BLOCKED. Do not mark release complete.
9. On interruption, update ACTIVE with next action and the last known commit.

## Verification
Run from v2: docker compose up --build -d
Run bash v2/scripts/verify from repository root (includes isolated PostgreSQL IT and generated OpenAPI diff).
Backend: mvn -f v2/backend/pom.xml test
Frontend: cd v2/frontend; npm ci; npm run lint; npm run typecheck; npm test; npm run build
Browser: npm run test:e2e after services start.
When changing an endpoint, generate OpenAPI with the PostgreSQL integration profile and commit the actual output; CI must diff it successfully. Shared scenario schema is under v2/contracts, consumed by networknt and Ajv. Never edit stored scenario definitions without bumping their version. Preserve existing scenario fixtures. Grade from the stored mission, normalize by menu/options/packing, and keep the original result on identical replay. Any mutation of completion status and result must share a database transaction; client timing is not server timing.
Kiosk changes must preserve the explicit XState guards and frozen retry payload. Cancellation is server-confirmed; never clear a pending order on an ambiguous error. New scenarios are versioned fixture-only changes; generic browser test must complete each catalog scenario. Do not create screenshots except from actual browser runs.
Check docs/evidence/INDEX.md for actual results; a configured CI workflow is not a passing run.

## Stop conditions
Stop remote mutation when write permissions fail, a real secret is identified, or a destructive change is required.
Escalate incompatible contract changes, unresolved safety issues or repeated failures.
When build tools are unavailable, record the blocker and keep implementation explicitly unverified.

## Evaluation
0 = no usable evidence; 50 = ordinary working project; 70 = strong verified project;
90 = exceptional externally validated work; 100 = ideal.
Do not award implementation or testing credit to a plan.
No percentile claims without population data.

## Resume
Use git log and docs/PLAN.md to locate the last checkpoint.
Do not overwrite work from other contributors.
