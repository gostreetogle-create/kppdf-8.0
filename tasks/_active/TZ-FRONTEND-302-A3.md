# ACTIVE: TZ-FRONTEND-302-A3

Lane: A
Parent: TZ-FRONTEND-302
Owner: Buffy-TZ-FRONTEND-302-A
Status: BLOCKED / needs amendment
Canonical: 6cb978a2484af108b891a87793247c76dc60329e
Exact key: frontend/src/app/pages/import-todos/import-todos.page.ts

Blocker: `httpResource` covers the existing GET, but `markDone()` requires PATCH. No existing import-todos shared service/API method exists. A new shared service/file is outside approved A3 scope. No product edits.
Baseline: ESLint 1 expected warning; focused spec path absent.
