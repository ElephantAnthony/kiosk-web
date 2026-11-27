# XState actor output type
Run 45774509024: lint passed; typecheck failed TS2322 at the catalog load onDone assignment because inferred actor output was unknown. Add explicit Scenario[] output generic to fromPromise. Keep the catalog type and validation intact; no cast to any. Re-run typecheck and tests.

Resolved: run 45774770229 typecheck and 16 Vitest tests PASS. No unsafe cast or disabled checks.
