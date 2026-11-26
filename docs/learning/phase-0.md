# Phase 0 learning
## Nontechnical explanation
The old application stored all shopping baskets in one shared variable.
Different browsers could therefore see the same items.
A characterization test captures this unwanted behavior before replacement.
Removing generated dependencies makes the development branch easier to maintain.
The original main branch remains available for comparison.

## Code locations
- mcdonaldapp/views.py
- mcdonaldapp/tests.py
- .gitignore

## Decision
Preserve V1 source and add a regression demonstration instead of silently fixing the old branch.
Use a new database-backed session design for V2 rather than global dictionaries.

## Interview questions
1. Why does a module-level dictionary cross session boundaries?
2. What does a passing characterization test mean here?
3. Why does removing tracked files not remove them from Git history?

Understanding: not assessed.
