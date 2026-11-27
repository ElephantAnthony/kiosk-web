# Security and privacy boundary

| Area | Implemented control | Remaining limitation |
|---|---|---|
| Learner ownership | Random UUID in HttpSession; server-side owner predicate on reads and row locks | Anonymous browser cookie expiry, no cross-device account |
| Admin | Separate Spring Security context, ROLE_ADMIN, environment credential, BCrypt cost 12, session ID rotation, CSRF | Single local account; no MFA, login rate limiter, credential lifecycle or multi-node session |
| Transactions | Owner-scoped locks, atomic grading/result and event batch | No production failover or restore test |
| Event validation | JSON Schema allowlist, semantic menu and option checks, unique ID and sequence | Client observations and time are untrusted |
| Storage | IndexedDB outbox, exact ACK deletion, no payment/personal fields in schema | Storage eviction, clearing origin, expired cookie, pagehide best effort |
| Reports | Aggregates only, no owner IDs/raw payloads; authenticated access | No privacy retention or production data governance policy |
| Network | Localhost port binding, HttpOnly and SameSite cookies; secure cookie default outside local/container profiles | Local HTTP, no production TLS setup |
| Secrets | .env ignored, CI ephemeral masked credentials, Gitleaks history scan with fingerprint-specific upstream false-positive exceptions | Not a full dependency audit, penetration test or credential rotation service |

No real participant data, names, real card details, payment execution or free text event collection. Do not expose demo publicly. Before production, independently assess data retention/deletion, credential rotation, rate limiting, transport security, backups, recovery, dependency vulnerabilities, privacy obligations and manual accessibility. None is claimed as implemented by this release.

Historic Gitleaks evidence: [triage](../evidence/runs/SEN-01-security-45770313225.md), [admin final scan](../evidence/runs/SEN-06-pass-45920332880.md). Do not disable scanner, expand ignore patterns indiscriminately or rewrite history. If a real credential is found, stop and arrange owner revocation/rotation.
