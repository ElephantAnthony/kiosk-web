# Phase 3 learning

## Nontechnical explanation
The server compares the submitted order against the mission that was originally assigned.
The score distinguishes correct items, missing items, and extra items.
Payment choice affects success but does not change the order accuracy ratio.
Database locking ensures two simultaneous submissions cannot replace one another.
Server elapsed time and client-reported active time are stored separately because they measure different things.

## Core code locations
- v2/backend/src/main/java/com/seniosk/grading/OrderGrader.java
- v2/backend/src/main/java/com/seniosk/grading/GradingService.java
- v2/backend/src/main/resources/db/migration/V2__mission_result.sql

## Decisions
Use a multiset rather than comparing raw JSON strings; ordering and split lines must not affect the grade. Use row locking and a unique result instead of in-process synchronization. Use one transaction rather than separate status and result commits. Preserve the original response on retry. Client timing is not trusted as server performance evidence.

## Interview questions
1. How are missing and extra computed when options differ?
2. Why does a unique result constraint alone not define the intended replay response?
3. What happens if an exception occurs after status update and result insertion inside the transaction?

Understanding not assessed. No measured learner improvement. Initial Maven and PostgreSQL tests pass; strict OpenAPI and live proxy regression still require final check.
