# TZ-AUTH-306 DONE — единственный скрытый владелец (hidden owner invariant)

```
ARCHIVE_MARKER
task: TZ-AUTH-306
outcome: DONE
closed_at: 2026-08-13
closed_by: agent-3e757640b7 (coding agent)
workspace: D:\kppdf-8.0
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-AUTH-306.md)
  - backend tsc (tsconfig.build.json --noEmit): PASS
  - frontend tsc (tsconfig.app.json --noEmit): PASS
  - backend tests: owner-target 15/15 · owner-only 3/3 · roles.guard 5/5 · permissions.guard 22/22 · auth.service 15/15 · users-admin 17/17 · roles-admin 10/10 · last-admin 12/12 = PASS
  - e2e owner-invariant 8/8 PASS · auth.e2e 6/6 PASS (нет регрессии)
  - frontend jest users-admin 14/14 · roles-admin 13/13 = PASS
  - eslint (изменённые/новые файлы): PASS (pre-existing warnings вне scope)
  - architecture:check: 1 pre-existing violation (proposal-create.page.ts) — не регрессия
  - git diff --check: PASS
  - checklist: docs/agent-checklists/TZ-AUTH-306.md (DONE)
  - progress.md: UPDATED
  - _active-map.md: UPDATED
```

## Что сделано

**Invariant «ровно один скрытый owner»:**

- `backend/src/modules/user/user.schema.ts` — поле `isOwner` (default `false`),
  НЕ роль и НЕ permission; partial unique index
  `{ isOwner: 1 } + partialFilterExpression { isOwner: true }` — БД-уровневый
  gate «не более одного true».
- `backend/src/common/seed/admin.seed.ts` — idempotent fail-closed backfill
  `backfillOwner()` после `seedAdmin()`: owner = точный активный bootstrap admin
  по `ADMIN_USERNAME` (case-insensitive). 0 совпадений / неактивный /
  существующий owner не совпадает с конфигом / >1 owner → startup error
  (процесс не стартует, «fail closed»). Никогда не создаёт второго owner,
  никогда не wipe/reseed (только `$set isOwner: true`).

**Server-side enforcement:**

- `jwt.strategy.ts` — `isOwner` гидрируется из БД (`user.isOwner === true`),
  НЕ читается из JWT claim.
- `roles.guard.ts` / `permissions.guard.ts` — owner bypass (полный доступ)
  без owner-only permission key в каталоге; `isOwner` — server-hydrated.
- `owner-only.guard.ts` (NEW) — 403 `OWNER_ONLY` для non-owner; навешен
  class-level на `roles-admin` (role CRUD) и `permissions-admin` (матрица).
- `owner-target.guard.ts` (NEW) — на users-admin mutators (update/activate/
  deactivate/delete/reset-password):
  - non-owner → owner-строка = 404 (не перечисляем через HTTP);
  - owner self delete/deactivate/demote = 403 `OWNER_SELF_PROTECTED`
    (password break-glass сохранён);
  - grant/revoke admin power (mutate admin user / promote to admin) = 403
    `OWNER_ONLY` для non-owner.
- `users-admin.controller.ts` — list/count/search фильтруют `isOwner` для
  non-owner; `getById` возвращает 404 на owner для non-owner; `create` с
  `role: admin` = 403 `OWNER_ONLY` для non-owner; `NotFound` вместо `throw Error`.

**Owner surface / UI hiding:**

- `auth.service.ts toAuthUser` — `isOwner` (true только owner); `admin-roles`
  page вырезается из `pages` для non-owner (page-ACL прячет nav/chip).
- `rbac-contract.ts`, `current-user.decorator.ts`, `auth-response.dto.ts` —
  `isOwner?` в типы (server-hydrated).
- `frontend/src/app/core/auth.service.ts` — `isOwner` computed signal.
- `frontend/src/app/app.routes.ts` — `ownerOnlyRouteGuard` на `/admin/roles`
  (UX-зеркало backend `OwnerOnlyGuard`).
- `frontend/src/app/pages/admin/users-admin.page.ts` — у owner-строки скрыты
  delete/deactivate; тосты для `OWNER_SELF_PROTECTED` / `OWNER_ONLY`.

**Тесты + docs:** unit (guards/controllers/auth) + e2e `owner-invariant.e2e-spec.ts`;
`docs/RBAC-CONTRACT.md`, `docs/pages/admin-users.page.md`, `docs/pages/admin-roles.page.md`.

## Known limitation

Ordinary admin всё ещё может выдать `permissions: ['*']` (pre-existing wildcard
break-glass из RBAC-CONTRACT §4/§9.3) — вне scope 306; successor-TZ при необходимости.

## NEXT

TZ-AUTH-303 (backend regular invite + owner-device self-link + BrowserDeviceGrant + 365d cookie + JWT ≤5m).
