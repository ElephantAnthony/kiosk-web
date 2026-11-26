# Event endpoint contract drift
Run 45776976931: Maven verify passed all 42 Java tests. Strict diff failed because the new events endpoint and Batch/Ack DTOs were absent from the previous generated document. Do not disable diff or hand-edit the output. Recover the exact Springdoc output from CI, independently verify byte length and SHA-256, inspect endpoint and responses, commit the blob, re-run full verification. Browser suite already passed 9 tests in this source run, but final all-five-job result is required. No source changes required for the drift fix.

Resolved: 45777346496 regenerated identical bytes and SHA-256; mandatory diff PASS. Final browser rerun pending.
