# SEN-02 OpenAPI response contract mismatch

Run 45771847340 generated an actual OpenAPI file with a GET /api/sessions/{id} response list containing 404 only; normal 200 was omitted because the controller declared an explicit error response but not the success response. The application tests passed, but generated contract review identified a documentation defect.

Resolution: explicitly document 200/404, problem response content, the required CSRF request header, and database-unavailable 503. Add assertions to SessionApiIT for the normal read response and health failure response. Regenerate the machine contract instead of editing generated JSON manually.

Verification: run 45772148779 produced a corrected OpenAPI 3.1 artifact; 45772447666 re-generated it and passed mandatory byte-for-byte diff. Both runs' backend and frontend tests passed. This is a contract documentation fix, not a claim of new functionality beyond the observed API tests.
