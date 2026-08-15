# TZ-FRONTEND-302-A2: Order form raw HTTP remediation

- Parent: `TZ-FRONTEND-302-angular-integrity-remediation-wave`
- Lane: `A`
- Status: DONE
- Finding: `P1-HTTP`
- Canonical audit: `6cb978a2484af108b891a87793247c76dc60329e`

CONFLICT KEYS:
- `frontend/src/app/pages/orders/order-form-dialog.component.ts`
- `frontend/src/app/pages/orders/order-form-dialog.component.spec.ts`

- Constraint: prefer an existing shared service method; if a new shared users-list method is required beyond A1, STOP for a new amendment.
- Evidence: focused Jest 2/2 PASS; FE tsc PASS; changed-file ESLint PASS; architecture:check PASS; git diff --check PASS.
- Implementation: replaced page `HttpClient`/`silentGet` users lookup with the existing `Users.inject()` entity service; no new shared method or endpoint.
- Browser: authenticated order dialog smoke unavailable in this headless worktree; lookup and submit pending guard are covered by characterization tests.
- Implementation commit: `003da5f0`.
- Push SHA: `40768423d391cb98dbe66cce9a75aee7f338fd8d`.
