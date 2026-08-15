# TZ-FRONTEND-302-A2: Order form raw HTTP remediation

- Parent: `TZ-FRONTEND-302-angular-integrity-remediation-wave`
- Lane: `A`
- Status: DONE
- Finding: `P1-HTTP`
- Canonical audit: `6cb978a2484af108b891a87793247c76dc60329e`

CONFLICT KEYS:
- `frontend/src/app/pages/orders/order-form-dialog.component.ts`
- `frontend/src/app/pages/orders/order-form-dialog.component.spec.ts`

- Implementation: replaced page `HttpClient`/`silentGet` users lookup with the existing `Users.inject()` entity service; no new shared method or endpoint.
- Evidence: focused Jest 2/2 PASS; frontend tsc PASS; changed-file ESLint PASS; architecture:check PASS; git diff --check PASS.
- Browser: authenticated order dialog smoke unavailable in this headless worktree; lookup and submit pending guard are covered by characterization tests.
- Implementation commit: pending.
