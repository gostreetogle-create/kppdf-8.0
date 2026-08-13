# TZ-AUTH-306 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-AUTH-306.md` (removed at archive)
> Commit/push: **YES (green gates); NO deploy**

## Claim slot

- agent_id: agent-3e757640b7 (coding agent)
- claimed_at: 2026-08-13T20:40:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: no (room task registry stale from 2026-08-01; join+inbox done)

## Plan

1. `user.schema.ts`: `isOwner` (default false) + partial unique index (`partialFilterExpression: { isOwner: true }`).
2. `admin.seed.ts`: idempotent owner backfill — exact `ADMIN_USERNAME` active bootstrap admin; 0 match / mismatch / >1 owner → fail-closed startup error; never creates a 2nd owner.
3. Guards: `OwnerOnlyGuard` (roles-admin + permissions catalog) and `OwnerTargetGuard` (users-admin mutators); owner bypass in `RolesGuard`/`PermissionsGuard`; owner hidden from list/getById for non-owner; admin-power grant/revoke owner-only; owner self delete/deactivate/demote blocked.
4. `auth.service.ts` `toAuthUser`: expose `isOwner` (only true for owner) + drop `admin-roles` page for non-owner (page-ACL hides Роли chip/nav).
5. `req.user` shape: add `isOwner` in `jwt.strategy.ts` (direct dependency; documented).
6. FE: `auth.service.ts` `isOwner` computed; `app.routes.ts` owner-only guard on `/admin/roles`; `users-admin.page.ts` hides self-destructive actions for the owner's own row.
7. Tests + docs (RBAC-CONTRACT, admin-users.page.md, admin-roles.page.md).

## Preflight

- [x] Точный `ADMIN_USERNAME` и единственный bootstrap admin подтверждены без вывода секрета (default `admin`, `.env` не выводился)
- [x] Root/worktree, active map и conflict keys проверены (`_active/` пуст, чужого claim нет)
- [x] Active marker создан до кода
- [x] Backfill fail-closed, wipe/reseed запрещены (только `$set isOwner`, никогда drop/wipe)

## Acceptance

- [x] Ровно один immutable `isOwner=true` (partial unique index + backfill; e2e: ровно 1 owner = TEST_ADMIN_USERNAME)
- [x] Owner не является ролью/permission (`isOwner` нет ни в одном DTO; нет owner-only permission key)
- [x] Non-owner не перечисляет и не изменяет owner (list/count/search/getById скрывают; mutate → 404)
- [x] Role editor owner-only и скрыт от ordinary admin (OwnerOnlyGuard 403 OWNER_ONLY; `admin-roles` вырезан из pages)
- [x] Owner full access + password break-glass (Roles/Permissions bypass; login неизменён)
- [x] Owner auth/enumeration/escalation tests PASS (unit + e2e)

## Integrity slot

- [x] Тип: permission + auth + page
- [x] FIC §A–E пройден (gates ниже; docs RBAC-CONTRACT + admin-users/roles page.md обновлены)
- [x] admin users/roles page docs обновлены
- [x] Чужой WIP исключён (`__pycache__`, `ruvector.db`, stashes не тронуты)

## Gates

- [x] backend tsc (`pnpm exec tsc -p tsconfig.build.json --noEmit`) PASS
- [x] backend owner/users/roles tests: `owner-target` 15/15, `owner-only` 3/3, `roles.guard` 5/5, `permissions.guard` 22/22, `auth.service` 15/15, `users-admin` 17/17, `roles-admin` 10/10, `last-admin` 12/12 PASS
- [x] owner e2e: `test/e2e/owner-invariant.e2e-spec.ts` 8/8 PASS; `auth.e2e` 6/6 PASS (регрессии нет)
- [x] frontend tsc PASS; `users-admin` 14/14, `roles-admin` 13/13 PASS
- [x] diff/review security invariants (git diff --check PASS; review ниже)

## Review handoff

- [x] READY FOR REVIEW; security self-review выполнен. Cursor/PO может открыть successor при замечаниях; автономный closeout в рамках continuous-волны.

## Executor report (auto)

- Owner invariant: `isOwner` + partial unique index; idempotent fail-closed backfill в `admin.seed.ts` (никогда не создаёт второго owner, 0/неоднозначность → startup error).
- Owner bypass в RolesGuard/PermissionsGuard (server-hydrated `isOwner`, не из JWT claim).
- Owner скрыт: list/count/search/getById non-owner → owner отсутствует / 404; mutate → 404.
- Owner-only: role editor + permissions matrix → `OwnerOnlyGuard` (403 OWNER_ONLY); admin-power grant/revoke → `OwnerTargetGuard`; owner self delete/deactivate/demote → 403 OWNER_SELF_PROTECTED.
- Scope disclosure: добавлены прямые зависимости вне строгого conflict-key списка — `jwt.strategy.ts`, `rbac-contract.ts`, `current-user.decorator.ts`, `auth-response.dto.ts`, `permissions-admin.controller.ts`, `owner-*.guard.ts` (новые). Ни один не пересекается с TZ-AUTH-303..307. Desktop module не тронут.
- Known limitation: ordinary admin всё ещё может выдать `permissions: ['*']` (pre-existing wildcard break-glass из RBAC-CONTRACT §4/§9.3) — вне scope 306; при необходимости successor-TZ.
- Architecture check: 1 pre-existing violation (`proposal-create.page.ts` fe-page-cross-component) — не мой файл, не регрессия.
- ESLint: новые файлы чисты; в `auth.service.spec.ts` остались pre-existing `no-unused-vars` (FakeUserService `_`-параметры) и `any` warnings, не вводились этим TZ.
- closed_at: 2026-08-13T21:10:00Z
