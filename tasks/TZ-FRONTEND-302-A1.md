# TZ-FRONTEND-302-A1: Admin raw HTTP remediation

- Parent: `TZ-FRONTEND-302-angular-integrity-remediation-wave`
- Lane: `A`
- Status: blocked / needs shared API owner decision
- Finding: `P1-HTTP`
- Canonical audit: `405cb71d51f56b21e694a0781ca3f82d30c6702d`
- Exact conflict keys:
  - `frontend/src/app/pages/admin/users-admin.page.ts`
  - `frontend/src/app/pages/admin/users-admin.page.spec.ts`
  - `frontend/src/app/pages/admin/roles-admin.page.ts`
  - `frontend/src/app/pages/admin/roles-admin.page.spec.ts`
- Blocker: `PiUsersService` and `PiRolesService` expose only `list()`. Removing the page `HttpClient` requires new mutation methods in those shared API services, but the approved A1 keys explicitly exclude them and say not to invent shared API surface. Per the canonical serial-hot-file/STOP rule, product edits are paused.
- Constraint: use existing `PiUsersService` / `PiRolesService` API; no shared API surface or behavior changes.
- Evidence so far: baseline focused specs PASS (27 tests); changed-file ESLint reproduces 2 expected `no-raw-http-in-components` warnings.
- Required evidence after scope decision: characterization where needed, frontend tsc, focused Jest, changed-file ESLint, architecture check, diff check, admin browser smoke.
- Commit/push SHA: pending; no product edits made.
