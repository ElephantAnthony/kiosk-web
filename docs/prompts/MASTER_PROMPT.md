# Public engineering prompt (sanitized)

Act as repository coding agent. Implement SENIOSK 2.0 on portfolio/seniosk-v2, preserving main.
Goal: enable people to practice fictional kiosk orders and reliably record and grade training.
M1: scenario JSON contract, common renderer, XState order flow, server-side deterministic grading, database session isolation, IndexedDB outbox, batch ACK and retry, authenticated funnel, accessibility and tests.
Use Spring Boot rather than Django for V2. Keep V1 unchanged except approved generated-file cleanup and defect reproduction tests.
For each task define acceptance criteria, implement, test, review and commit evidence. If tests cannot run, label NOT_RUN. Never invent performance or participant outcomes.
Retain design decisions, public task prompts and sanitized logs; exclude private details and real data.
Original master and review decision attachments are retained privately by the owner. This public operational summary is not a verbatim copy.
