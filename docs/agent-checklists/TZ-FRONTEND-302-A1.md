# TZ-FRONTEND-302-A1 checklist

- [x] Cursor amendment verified at `6cb978a2484af108b891a87793247c76dc60329e`.
- [x] Umbrella claimed through Team Room.
- [x] Expanded eight exact keys claimed through Team Room.
- [x] Baseline focused tests recorded: users + roles specs, 27 tests PASS.
- [x] Service characterization tests added for create/reset-password and all moved mutation methods.
- [x] Existing page URLs/payloads moved into services without behavior changes.
- [x] Pages call service methods only; no HttpClient imports.
- [x] Frontend tsc PASS: `pnpm exec tsc -p tsconfig.app.json --noEmit`.
- [x] Focused Jest PASS: 4 suites, 35 tests.
- [x] Changed-file ESLint PASS: 8 exact files, 0 errors/warnings.
- [x] architecture:check PASS: 936 files, baseline 6.
- [x] git diff --check PASS.
- [ ] Browser smoke: authenticated admin create/reset-password, light/dark, dialog keyboard unavailable in this headless worktree; covered by existing component specs and service HTTP characterization.
- [ ] Commit and pushed SHA recorded.

## Implementation evidence

`PiUsersService` now owns create, update, activate, deactivate, remove, and resetPassword. `PiRolesService` now owns create, update, and remove. URLs and request bodies are unchanged from the prior page-local silent HTTP calls. No endpoints, RBAC, UI labels, dialog flow, or loading/error handling changed.

## Exact keys

1. `frontend/src/app/pages/admin/users-admin.page.ts`
2. `frontend/src/app/pages/admin/users-admin.page.spec.ts`
3. `frontend/src/app/pages/admin/roles-admin.page.ts`
4. `frontend/src/app/pages/admin/roles-admin.page.spec.ts`
5. `frontend/src/app/shared/services/pi-users.service.ts`
6. `frontend/src/app/shared/services/pi-users.service.spec.ts`
7. `frontend/src/app/shared/services/pi-roles.service.ts`
8. `frontend/src/app/shared/services/pi-roles.service.spec.ts`
