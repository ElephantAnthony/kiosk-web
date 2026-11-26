# SENIOSK V2 plan

## ROADMAP
| ID | Deliverable | State |
|---|---|---|
| SEN-00 | Branch, audit, hygiene, harness | ACTIVE |
| SEN-01 | Spring and React foundation | TODO |
| SEN-02 | Shared scenario contract, state machine, server grading | TODO |
| SEN-03 | Durable event queue and idempotent ingest | TODO |
| SEN-04 | Admin funnel and accessibility | TODO |
| SEN-05 | E2E, evidence, portfolio README | TODO |

## ACTIVE
- Branch: portfolio/seniosk-v2
- Base: 9477fe7ac6ebae0fbc2393d91dd7d1b0fc10756d
- Branch creation: confirmed through GitHub branch list.
- Current action: generated-file cleanup; next V1 reproduction test and CI verification.
- Environment: Java 21 and Node 22 available in isolated container; Maven, Docker and gitleaks not found; direct GitHub DNS fails. GitHub API writes now succeed.
- No local repository checkout available. Remote changes use GitHub Git object API.
- Full secret history scan and V1 runtime reproduction remain release blockers.
- Next: add V1 reproduction test, then foundation. Full history scan remains BLOCKED locally.
