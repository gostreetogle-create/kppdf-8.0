# TZ-FRONTEND-302-A5: KP recipient effect/subscribe

- Parent: `TZ-FRONTEND-302-angular-integrity-remediation-wave`
- Lane: `A`
- Status: DONE
- Finding: `P0-A2` / `P1-KP-CHILD`
- Canonical audit: `483ebd0ba6ac82615645cd4077d7e7b69fe17772`

CONFLICT KEYS:
- `frontend/src/app/pages/commercial/proposals/proposal-create-recipient.component.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-create-recipient.component.spec.ts`

- Implementation: replaced subscribe inside effect with `toObservable(selectedCounterpartyId)` → `distinctUntilChanged` → `switchMap` → `takeUntilDestroyed`.
- Evidence: focused characterization 2/2 PASS; FE tsc PASS; changed-file ESLint PASS; architecture:check PASS; diff-check PASS.
- Browser: authenticated recipient route unavailable in this headless worktree; lookup and output contract are covered by the focused spec.
- Implementation commit: `f6625cd3`.
- Push SHA: `f6625cd34fc65682f018907fbdaf4617682ea0da`.
