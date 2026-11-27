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
| 07 | Final release audit / screenshots / documentation | PASS: CI 45922321237, verified captures and release docs |

## FINAL CHECKPOINT
- Branch portfolio/seniosk-v2; main baseline 9477fe7ac6ebae0fbc2393d91dd7d1b0fc10756d preserved.
- Application/test source 09ff9d7af30907c4d9e713524b6d040eb9beea04. Admin gate source 83d4f80 and capture commit 64c4e16694f916dcb07ccfaaba82a31b90ab2028.
- Admin final CI 45920332880 all 5 jobs PASS, Java 48, Vitest 23, Chromium 10, V1 1; actual admin JPEG verified. Final capture/axe change passed CI 45922321237. 
- Final CI 45922321237: all five jobs PASS, 82 tests, six additional verified images. M1 application/test scope complete; evidence and README linked. Future work requires new scope and independent verification.
- [Checklist](release/CHECKLIST.md) / [review](release/REVIEW.md) / [evidence](evidence/INDEX.md) / [prompt](prompts/SEN-07.md).
- Out of scope: operational deployment, real participant experiments, bulk performance. Existing limitations in [security](release/SECURITY.md). Historical checkpoints and failures preserved in evidence and Git history.

- [Final release evidence](evidence/runs/SEN-07-pass-45922321237.md). Main unchanged; final documentation commit has the same application/test tree as tested source.

## SEN-08 / ACTIVE - yellow cafe visual prototype
- Scope: add a separate fictional cafe inspired by the approved yellow kiosk layout, original vector product art, paginated catalog, cart summary and simulated countdown display. Preserve M1 fixtures, machine, server contracts and grading.
- Acceptance: catalog exposes the new fixture, menu/category/page navigation works, generic mission completes with 100% server grade, existing scenarios still pass and keyboard/contrast remain usable.
- Initial implementation uses illustrative prices and fictional branding; no real brand assets. Packing remains per line, existing option/cart/payment workflow retained; countdown is informational and starts from existing active session time. Full reference fidelity and brand authorization are not verified.
- Verification: NOT_RUN locally (GitHub DNS unavailable in execution container). CI and browser verification required before release. M1 historical checkpoint remains unchanged.

### SEN-08 visual refinement
- Previous CI 45944926832: frontend/backend/legacy/secret scan passed; compose failed generic catalog browser test because a literal menu label containing parentheses was treated as regex. Dedicated yellow navigation passed.
- Refine dedicated kiosk surface, product SVG shading and toppings, cart table and yellow action styling. Preserve accessibility controls, machine and server contracts. Change generic menu locator to literal matching and capture actual yellow browser menu in CI.
- Verification: NOT_RUN in current editing environment; next action inspect new CI, screenshot and full mission completion before release.

### SEN-08 full checkout visual implementation
- Previous CI 45945648427 completed successfully. New scope: independent option, cart, payment selection, simulated terminal and completion receipt; separate learning result; direct cart quantity with guarded machine event and existing CART_EDITED telemetry. Preserve server payload and grading.
- Product photo paths support original generated WebP assets with vector fallback; binary assets are supplied separately because current GitHub connector accepts blob text/base64 but cannot ingest container file references directly. No actual coupon functionality or real payment. Prices remain illustrative. Full screenshot comparison pending.
- Verification: NOT_RUN locally. Added browser journey with server grade and stage screenshots; CI required.
