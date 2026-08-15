# TZ-FRONTEND-302-A1: Admin raw HTTP remediation

- Parent: `TZ-FRONTEND-302-angular-integrity-remediation-wave`
- Lane: `A`
- Status: DONE
- Finding: `P1-HTTP`
- Canonical audit: `6cb978a2484af108b891a87793247c76dc60329e`
- Owner: Lane A serial until archive

CONFLICT KEYS:
- `frontend/src/app/pages/admin/users-admin.page.ts`
- `frontend/src/app/pages/admin/users-admin.page.spec.ts`
- `frontend/src/app/pages/admin/roles-admin.page.ts`
- `frontend/src/app/pages/admin/roles-admin.page.spec.ts`
- `frontend/src/app/shared/services/pi-users.service.ts`
- `frontend/src/app/shared/services/pi-users.service.spec.ts`
- `frontend/src/app/shared/services/pi-roles.service.ts`
- `frontend/src/app/shared/services/pi-roles.service.spec.ts`

- Implementation: moved the existing page `silentPost`/`silentPatch`/`silentDelete` URLs and payloads into the services; pages call service methods only. No new endpoints, RBAC, or UI behavior.
- Evidence: frontend tsc PASS; focused Jest 35/35 PASS; changed-file ESLint PASS; architecture:check PASS; git diff --check PASS.
- Browser: authenticated admin smoke unavailable in this headless worktree; existing page specs cover loading/empty/error/success and service specs cover method/payload contracts.
- Implementation commit: `91ef835a`.
- Push SHA: pending.
