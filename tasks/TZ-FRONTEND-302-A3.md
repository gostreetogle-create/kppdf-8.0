# TZ-FRONTEND-302-A3: Import-todos HttpClient remediation

- Parent: `TZ-FRONTEND-302-angular-integrity-remediation-wave`
- Lane: `A`
- Status: BLOCKED / needs amendment
- Finding: `P1-HTTP`
- Canonical audit: `6cb978a2484af108b891a87793247c76dc60329e`

CONFLICT KEYS:
- `frontend/src/app/pages/import-todos/import-todos.page.ts`

- Baseline: page ESLint reproduces 1 expected raw-HttpClient warning; no import-todos focused spec exists (Jest path is absent).
- Blocker: the page already uses `httpResource` for GET, but `markDone()` needs a PATCH transport. No existing import-todos shared service or mutation API exists. Removing `HttpClient` requires a new shared service/file or an amendment allowing a mutation transport; both are outside the approved A3 exact scope.
- STOP: no product edits made. Request Cursor amendment with the exact shared service key, or explicitly approve the Angular 20 mutation approach and its behavior contract.
- Commit/push SHA: pending.
