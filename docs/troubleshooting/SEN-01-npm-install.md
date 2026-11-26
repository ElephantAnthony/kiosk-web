# SEN-01: npm dependency resolution error
Observed in [CI run 45769057010](https://github.com/ElephantAnthony/kiosk-web/actions/runs/45769057010), frontend and Docker build:
```
npm error Cannot read properties of null (reading 'edgesOut')
```
Both failed with exit 1. This is consistent with known npm Arborist peer-resolution crashes, including reports involving Vitest 4.1 and npm 10. See https://github.com/npm/cli/issues/9787 and https://github.com/solidjs/solid/issues/3321.
Root cause not experimentally confirmed in this repository. Candidate fix after security clearance: explicitly pin a compatible npm 11 version across CI, Docker and documented local environment, then regenerate the lockfile from a successful install. Do not mask peer conflicts using --force. Verify lint, typecheck, unit/build and browser tests. No fix applied yet.
