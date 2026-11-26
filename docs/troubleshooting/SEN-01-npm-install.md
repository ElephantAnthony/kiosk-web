# SEN-01: npm dependency resolution error
Observed in [CI run 45769057010](https://github.com/ElephantAnthony/kiosk-web/actions/runs/45769057010), frontend and Docker build:
```
npm error Cannot read properties of null (reading 'edgesOut')
```
Both failed with exit 1. This is consistent with known npm Arborist peer-resolution crashes, including reports involving Vitest 4.1 and npm 10. See https://github.com/npm/cli/issues/9787 and https://github.com/solidjs/solid/issues/3321.
Root cause not experimentally confirmed in this repository. Candidate fix after security clearance: explicitly pin a compatible npm 11 version across CI, Docker and documented local environment, then regenerate the lockfile from a successful install. Do not mask peer conflicts using --force. Verify lint, typecheck, unit/build and browser tests. No fix applied yet.

## Fix attempt
Pin npm 11.21.2 in the frontend manifest, Docker, CI and local verification command; Node remains 22.16.0. Known npm issue #9787 documents Arborist optional peer handling with Vitest 4.1. No --force or --legacy-peer-deps. The actual result is pending. The temporary public-registry-only lock export and standard CI artifact will allow a generated lockfile to be committed without fabricating it. Once committed, remove the temporary export and require npm ci.
