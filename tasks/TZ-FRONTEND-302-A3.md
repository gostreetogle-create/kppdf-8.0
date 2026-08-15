# TZ-FRONTEND-302-A3: Import-todos HttpClient remediation

- Parent: `TZ-FRONTEND-302-angular-integrity-remediation-wave`
- Lane: `A`
- Status: DONE
- Finding: `P1-HTTP`
- Canonical audit: `483ebd0ba6ac82615645cd4077d7e7b69fe17772`

CONFLICT KEYS:
- `frontend/src/app/pages/import-todos/import-todos.page.ts`
- `frontend/src/app/pages/import-todos/import-todos.service.ts`
- `frontend/src/app/pages/import-todos/import-todos.service.spec.ts`

- Implementation: moved only existing `silentPatch` markDone into the page-local service; `httpResource` GET remains on the page at `/import-todos`.
- Evidence: service Jest 2/2 PASS; FE tsc PASS; changed-file ESLint PASS; architecture:check PASS; git diff --check PASS.
- Browser: authenticated import-todos smoke unavailable in this headless worktree; service contract covers mark-done and page resource behavior was kept unchanged.
- Implementation commit: pending.
- Push SHA: pending.
