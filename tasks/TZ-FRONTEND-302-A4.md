# TZ-FRONTEND-302-A4: KP autosave nested subscribe

- Parent: `TZ-FRONTEND-302-angular-integrity-remediation-wave`
- Lane: `A`
- Status: DONE
- Finding: `P0-A1`
- Canonical audit: `483ebd0ba6ac82615645cd4077d7e7b69fe17772`

CONFLICT KEYS:
- `frontend/src/app/pages/commercial/proposals/proposal-create.page.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-create.autosave.spec.ts`

- Implementation: replaced only the stale-pointer nested subscribe with `switchMap`/`of`; the existing 404/400 remove-pointer and one-create-retry semantics remain unchanged.
- Evidence: characterization 1/1; existing proposal-create 45/45; combined 46/46; FE tsc PASS; changed-file ESLint PASS; architecture:check PASS; diff-check PASS.
- Browser: authenticated KP studio unavailable in this headless worktree; focused suites cover autosave and shell behavior.
- Implementation commit: pending.
- Push SHA: pending.
