# SENIOSK V2 plan

| Execution | Deliverable | State |
|---|---|---|
| 00 | Baseline, hygiene and harness | PASS |
| 01 | Spring / React foundation | PASS |
| 02 | Scenario contract / isolated sessions | PASS |
| 03 | Server grading / completion | PASS |
| 04 | Kiosk UI / fixture extension | PASS |
| 05 | Durable event ingestion / SDK | PASS: 45777346496 |
| 06 | Administrator / cohort funnel | PASS: 45920332880 and verified capture |
| 07 | Final release audit / screenshots / documentation | ACTIVE: CI 45922321237 |

## ACTIVE
- Branch portfolio/seniosk-v2; main baseline 9477fe7ac6ebae0fbc2393d91dd7d1b0fc10756d preserved.
- Application/test source 09ff9d7af30907c4d9e713524b6d040eb9beea04. Admin gate source 83d4f80 and capture commit 64c4e16694f916dcb07ccfaaba82a31b90ab2028.
- Admin final CI 45920332880 all 5 jobs PASS, Java 48, Vitest 23, Chromium 10, V1 1; actual admin JPEG verified. Final capture/axe change triggers CI 45922321237. 
- Next: observe all jobs, inspect actual RELEASE_IMAGE output, verify JPEG bytes and digests, commit images and insert README gallery. Update final evidence/checklist and check relative Markdown links, main/V1 preservation, new Korean U+00B7 absence. Do not claim completion before required checks.
- [Checklist](release/CHECKLIST.md) / [review](release/REVIEW.md) / [evidence](evidence/INDEX.md) / [prompt](prompts/SEN-07.md).
- Out of scope: operational deployment, real participant experiments, bulk performance. Existing limitations in [security](release/SECURITY.md). Historical checkpoints and failures preserved in evidence and Git history.
