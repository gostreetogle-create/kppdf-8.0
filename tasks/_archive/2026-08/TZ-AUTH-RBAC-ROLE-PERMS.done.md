# TZ-AUTH-RBAC-ROLE-PERMS — DONE

**agent_id:** `buffy-gpt-5.6-luna`
**completed_at:** `2026-08-31T20:18:10+03:00`
**layer:** backend auth/RBAC
**archive_status:** DONE
**commit:** `b3607871`

## Outcome

- `PermissionsGuard` now computes effective permissions from the persisted
  role's permissions plus user-level overrides; there is no deny-list behavior.
- `JwtStrategy` hydrates `rolePermissions` from `RoleService` using the
  persisted user's role rather than trusting stale JWT role data.
- `AuthService.toAuthUser()` uses the canonical `effectivePermissions()` merge
  for login and `/auth/me`, keeping the response aligned with the guard.
- Admin role shortcut and owner permission behavior remain covered.
- `frontend-nx/**`, `frontend/**`, `docker-compose.yml`, and unrelated dirty
  WIP were not included in the task changes.

## Regression coverage

- manager role permission is accepted even with unrelated user permissions;
- user extra permission is accepted;
- lower user permission does not deny a role permission;
- admin role with an empty explicit permissions array remains all-powerful;
- JWT role permissions are hydrated from the database role;
- `/auth/me` returns the merged effective permission set.

## Gates

- backend TypeScript: PASS, exit 0 — `pnpm exec tsc -p tsconfig.build.json --noEmit`
- backend Jest: PASS, exit 0 — 119 suites / 1112 tests
- changed auth/RBAC ESLint scope: PASS, 0 errors (9 existing warnings)
- repository-wide `pnpm lint`: FAIL, exit 1 — 45 pre-existing errors and 200
  warnings in unrelated baseline files; no unrelated lint cleanup was folded
  into this task.

## Files in closeout commit

- `backend/src/common/contracts/rbac-contract.ts`
- `backend/src/common/guards/permissions.guard.ts`
- `backend/src/common/guards/permissions.guard.spec.ts`
- `backend/src/modules/auth/auth.module.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/auth/auth.service.spec.ts`
- `backend/src/modules/auth/strategies/jwt.strategy.ts`
- `backend/src/modules/auth/strategies/jwt.strategy.spec.ts`
- `docs/agent-checklists/WAVE-AUTH-RBAC.md`
- `docs/agent-checklists/TZ-AUTH-RBAC-ROLE-PERMS.md`
- `tasks/_archive/2026-08/TZ-AUTH-RBAC-ROLE-PERMS.done.md`

**Note:** the active task marker was absent at closeout; no unrelated active task
was removed. The parallel DCI marker remains in `tasks/_active/`.
