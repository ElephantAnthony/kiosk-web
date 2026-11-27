# ADR-001: Spring modular monolith
Status: accepted by user request.

## Context
V1 used Django templates and process-global state. A maintainable successor should separate state, grading and analytics from presentation.

## Decision
Java 21, Spring Boot 3, Spring MVC, Spring Security, Spring JDBC, Flyway and PostgreSQL; React and TypeScript on the frontend. JDBC is chosen over JPA for explicit SQL and predictable atomic insert-on-conflict and row locks. One deployable server, packages grouped by capability. No external AI calls in the product.

## Alternatives
Django preserves language continuity but conflicts with the explicit Spring request. JPA simplifies entity CRUD but offers less direct control for ingestion SQL. Microservices add operational costs without verified load.

## Consequences
Database migration, concurrency integration tests and contract validation are necessary. Maven and Docker verification remain pending until executable.
