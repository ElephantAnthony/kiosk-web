# Security triage: four historical false positives

2026-11-26: CI diagnostic run 45770313225 produced per-finding metadata. All four were verified as ordinary setuptools library code: `Windows registry enumeration function alias`. Two distinct blobs match official setuptools releases 65.5.0 and 49.2.1 exactly. No genuine credential identified among these four; no revocation or reissue required.

See [evidence with commit/path/line and upstream comparisons](../evidence/runs/SEN-01-security-45770313225.md). Previous unfiltered failure remains recorded. The repository now uses only four exact fingerprints in .gitleaksignore. It does not ignore a directory, disable a rule or rewrite history. The scanner must still fail on any other finding. A successful filtered re-scan is required.

For future alerts: never copy secret values into documentation, logs or Git. Review precise rule and source locally; revoke/rotate real or uncertain credentials via the authorized provider; document evidence for false positives. Do not bypass the scanner. No external credential management tool was needed or used for this triage.

Follow-up run 45770554222 no longer reports the four upstream files; it found two historical Markdown quotations of that same benign statement. Both source lines were checked in commit b496aecee2651e08f8d94d858405ac3062e8c969. Removed the literal quotation from current documents and recorded only two additional exact historical fingerprints. All other rules and findings remain enforced. Re-scan required.
