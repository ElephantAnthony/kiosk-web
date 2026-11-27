# Phase 6 learning

## Nontechnical explanation
Only a verified administrator can see the aggregate report.
The learner's session remains separate from administrator permissions.
The report counts distinct sessions instead of counting repeated event requests.
The server result is authoritative; telemetry tells us which steps were observed.
Inactivity is an estimate, not proof that someone abandoned a task.

## Three code locations
- v2/backend/src/main/java/com/seniosk/admin/AdminSecurity.java: filter chain and credential comparison
- v2/backend/src/main/java/com/seniosk/admin/FunnelRepository.java: cohort, event rollup, grouping and SQL
- v2/frontend/src/admin/AdminApp.tsx: authenticated accessible report

## Choices
Separate Spring Security context avoids granting ownership by role. BCrypt hashes the environment credential in memory. One grouped event row per session prevents inflated aggregate joins. UTC dates and explicit zero denominator behavior make the results reproducible. An event received late can revise telemetry coverage; actual completion remains based on persisted results.

## Interview questions
1. Why should learner ownership and admin roles be separate?
2. How can joining events directly to results inflate aggregates, and how does this CTE avoid it?
3. Why is the server completion count not necessarily the same as the last funnel stage?

Understanding not assessed. CI evidence is separate.
