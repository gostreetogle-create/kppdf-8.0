# TZ-AUTH-RBAC-ROLE-PERMS: guard — permissions роли, не пользователя

**РОЛЬ АГЕНТА:** Executor  
**LAYER:** backend  
**CONFLICT KEYS:** `backend/src/common/guards/permissions.guard.ts`; `backend/src/modules/auth/strategies/jwt.strategy.ts`; `backend/src/modules/auth/auth.service.ts`; `backend/src/common/contracts/rbac-contract.ts`  
**ЗАВИСИМОСТИ:** WIP uncommitted от unknown author (2026-08-30)

## ИСХОДНОЕ СОСТОЯНИЕ

`PermissionsGuard` передавал `user.permissions` как permissions **роли** в `effectivePermissions`. JWT не содержал `rolePermissions`. `/auth/me` отдавал сырые user.permissions без merge с ролью.

Uncommitted diff уже делает: `rolePermissions` в JWT, guard fix, `effectivePermissions` в toAuthUser.

## ЧТО ДЕЛАТЬ

1. Claim TZ; **не** смешивать с studio.
2. Довести uncommitted diff до green: jwt.strategy.spec + permissions.guard.spec (role perms vs user overrides).
3. Regression: admin role, user with extra permission, user with denied override.
4. `cd backend && pnpm test && pnpm lint` exit 0.

## НЕ ИЗМЕНЯТЬ

- Frontend auth
- docker-compose healthcheck (отдельный ops commit если нужно)

## КРИТЕРИИ ПРИЁМКИ

1. User с ролью «manager» получает permissions роли, не пустой массив user-only.
2. effectivePermissions(user, role) на `/auth/me` совпадает с guard.
3. Tests exit 0.

## Финализация

Archive → `tasks/_archive/2026-08/TZ-AUTH-RBAC-ROLE-PERMS.done.md`
