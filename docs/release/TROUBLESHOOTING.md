# Troubleshooting index

| Problem | Observed resolution and evidence |
|---|---|
| npm Arborist edgesOut | [npm alignment](../troubleshooting/SEN-01-npm-install.md) |
| Historic scanner findings | [exact fingerprint triage](../troubleshooting/SEN-01-security-triage.md) |
| Unsupported browser runner | [runner compatibility](../troubleshooting/SEN-01-browser-runner.md) |
| JSON import in live browser | [import repair](../troubleshooting/SEN-02-json-import.md) |
| Generated schema drift | [domain](../troubleshooting/SEN-02-openapi.md), [grading](../troubleshooting/SEN-03-openapi-drift.md), [events](../troubleshooting/SEN-05-openapi-drift.md), [admin](../troubleshooting/SEN-06-openapi-drift.md) |
| XState actor output | [state flow repair](../troubleshooting/SEN-04-actor-output.md) |
| Ambiguous category locator | [fixture browser repair](../troubleshooting/SEN-04-category-locator.md) |
| Wildcard JSONPath assertion | [explicit funnel checks](../troubleshooting/SEN-06-funnel-jsonpath.md) |
| Accessible name for filter | [explicit label association](../troubleshooting/SEN-06-admin-filter-label.md) |

These are historical observed failures, not currently open defects. Check the latest gate. Preserve failure logs in safe summarized form, use exact generated OpenAPI rather than hand editing, and rerun tests.
