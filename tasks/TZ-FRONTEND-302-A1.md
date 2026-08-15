# TZ-FRONTEND-302-A1: Admin raw HTTP remediation

- Parent: `TZ-FRONTEND-302-angular-integrity-remediation-wave`
- Lane: `A`
- Status: claimed / in progress after Cursor amendment
- Finding: `P1-HTTP`
- Canonical audit: `6cb978a2484af108b891a87793247c76dc60329e`
- Owner: Lane A serial until A1 archive

CONFLICT KEYS:
- `frontend/src/app/pages/admin/users-admin.page.ts`
- `frontend/src/app/pages/admin/users-admin.page.spec.ts`
- `frontend/src/app/pages/admin/roles-admin.page.ts`
- `frontend/src/app/pages/admin/roles-admin.page.spec.ts`
- `frontend/src/app/shared/services/pi-users.service.ts`
- `frontend/src/app/shared/services/pi-users.service.spec.ts`
- `frontend/src/app/shared/services/pi-roles.service.ts`
- `frontend/src/app/shared/services/pi-roles.service.spec.ts`

- Method surface: move existing page `silentPost`/`silentPatch`/`silentDelete` URLs and payloads into the services; pages call service methods only. No new endpoints, RBAC, or UI behavior.
- Required evidence: baseline focused specs, service characterization tests for create/reset-password, FE tsc, focused Jest, changed-file ESLint, architecture check, diff check, admin browser smoke.
- Baseline before implementation: existing admin users + roles specs PASS (27 tests).
- Commit/push SHA: pending.
