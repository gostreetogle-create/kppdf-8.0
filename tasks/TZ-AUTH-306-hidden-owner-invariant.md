# TZ-AUTH-306: Единственный скрытый владелец

РОЛЬ АГЕНТА: Senior Authorization Security Engineer

ЗАВИСИМОСТИ: Нет (выполнять первым перед TZ-AUTH-303)

LAYER: 3

PAGES: /admin/users ; /admin/roles
PAGE_DOCS: admin-users.page.md ; admin-roles.page.md

CONFLICT KEYS: backend/src/modules/user/user.schema.ts ; backend/src/common/seed/admin.seed.ts ; backend/src/modules/admin/users-admin.controller.ts ; backend/src/modules/admin/users-admin.controller.spec.ts ; backend/src/modules/admin/roles-admin.controller.ts ; backend/src/modules/admin/roles-admin.controller.spec.ts ; backend/src/common/guards/permissions.guard.ts ; backend/src/common/guards/roles.guard.ts ; backend/src/common/guards/last-admin.guard.ts ; backend/src/modules/auth/auth.service.ts ; backend/src/modules/auth/auth.service.spec.ts ; frontend/src/app/core/auth.service.ts ; frontend/src/app/pages/admin/users-admin.page.ts ; frontend/src/app/pages/admin/roles-admin.page.ts ; frontend/src/app/app.routes.ts ; docs/RBAC-CONTRACT.md ; docs/pages/admin-users.page.md ; docs/pages/admin-roles.page.md

## ИСХОДНОЕ СОСТОЯНИЕ

Проверено: `backend/src/common/seed/admin.seed.ts`; `backend/src/modules/user/user.schema.ts`; `backend/src/modules/admin/users-admin.controller.ts`; `backend/src/common/guards/last-admin.guard.ts`; `frontend/src/app/pages/admin/users-admin.page.ts`; `frontend/src/app/pages/admin/roles-admin.page.ts`.

1. Текущий bootstrap admin — системный пользователь без `organizationId`, но отдельного неизменяемого owner-инварианта нет.
2. `LastAdminGuard` защищает только последнего `role=admin`; другой admin всё ещё может видеть и пытаться менять bootstrap admin.
3. PO требует ровно одного скрытого владельца: он имеет полный доступ всегда, не выдаётся ролью и не виден обычным администраторам.
4. Owner должен иметь несколько собственных компьютеров, но это остаётся один User/owner. Выдачу owner-device link реализует TZ-AUTH-303 после этого фундамента.

## РЕШЕНИЕ PO

- `isOwner=true` — неизменяемый системный признак User, **не роль** и не permission checkbox.
- Ровно один существующий bootstrap admin становится owner; второй owner не создаётся ни API, ни seed, ни invite.
- Owner всегда проходит role/permission/page guards.
- Owner-only операции не входят в выдаваемый каталог разрешений:
  - CRUD ролей и матрицы permissions/pages;
  - назначение/снятие административных полномочий;
  - доступ к owner devices и созданию owner-device link;
  - изменение owner-инварианта запрещено вообще обычным runtime API.
- Обычный admin может управлять regular invites/devices и обычными пользователями только если имеет соответствующие обычные capability.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Закрепить единственного owner в данных

1. Добавить `isOwner` default false и partial unique index, допускающий максимум один `true`.
2. Идемпотентный bootstrap/backfill:
   - ищет точное совпадение с настроенным `ADMIN_USERNAME`;
   - требует существующий активный bootstrap admin;
   - 0 или неоднозначность → fail closed с понятным startup error, без выбора «первого admin»;
   - никогда не создаёт второго owner поверх существующего.
3. `isOwner` отсутствует в public create/update DTO.

### ШАГ 2. Enforce owner server-side

1. Owner проходит RolesGuard/PermissionsGuard/page ACL как полный доступ без перечисления owner-only флагов в Role.
2. Любые PATCH/delete/deactivate/reset-password/role change owner со стороны non-owner возвращают 404 либо единый безопасный 403 без enumeration.
3. Owner не возвращается non-owner в list/count/search/getById.
4. Non-owner не может создать/назначить owner через extra DTO fields, mass assignment или role name.
5. Owner password login сохраняется как break-glass.

### ШАГ 3. Убрать owner surface у обычного администратора

1. `/admin/roles` и role-matrix API доступны только owner; ordinary admin не видит route/chip/page и получает server-side deny по deep link.
2. Owner не виден в `/admin/users` ordinary admin.
3. Owner в собственном UI не получает опасных действий «удалить/отключить/понизить».
4. `AuthUser` сообщает `isOwner` только самому owner, чтобы frontend мог показать owner-only UI; для остальных поле false/отсутствует.
5. Не создавать роль `superadmin`, не добавлять её в picker и не показывать скрытые owner-only галочки.

### ШАГ 4. Зафиксировать security tests

1. Unit/e2e: unique owner, exact backfill, fail-closed ambiguity.
2. Non-owner enumeration: list/count/search/getById одинаково не раскрывают owner.
3. Non-owner mutation/escalation: PATCH/delete/deactivate/reset-password/extra fields/role CRUD blocked.
4. Owner full access и password break-glass работают.
5. Обычный admin по-прежнему выполняет только выданные regular capability.

## ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ

ИЗМЕНЯТЬ: только conflict keys выше и их прямые specs/docs.

НЕ ИЗМЕНЯТЬ:

- device invite/grant — TZ-AUTH-303.
- nginx/Basic/production.
- Desktop pairing.
- существующие бизнес-роли и их права сверх owner-only границы.
- данные через wipe/reseed; нужен безопасный idempotent backfill.

## КРИТЕРИИ ПРИЁМКИ

1. В БД ровно один owner, привязанный к точному bootstrap username PO.
2. Owner — не роль; его нельзя выдать через Role/API/UI.
3. Ordinary admin не видит owner, owner devices, role editor и owner-only permissions.
4. Ordinary admin не может изменить owner даже прямым API-запросом.
5. Owner имеет полный доступ и может входить password break-glass.
6. TZ-AUTH-303 получает безопасный owner invariant для подключения второго owner-компьютера к тому же User.
7. Gates:
   - `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
   - `cd backend && pnpm test -- last-admin --runInBand`
   - `cd backend && pnpm test -- users-admin --runInBand`
   - `cd backend && pnpm test -- roles-admin --runInBand`
   - owner auth e2e PASS
   - `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
   - `cd frontend && pnpm test -- users-admin --runInBand`
   - `cd frontend && pnpm test -- roles-admin --runInBand`
8. Перед archive создать `docs/agent-checklists/TZ-AUTH-306.md`, приложить `## Executor report (auto)` и получить Cursor/PO PASS.

## known_limitation

Owner-device link и список owner computers появляются только в TZ-AUTH-303/304. Этот TZ создаёт invariant и скрытие, не внешний вход.

## ФИНАЛИЗАЦИЯ

Root task: следовать `GEMINI.md`, архивировать в `tasks/_archive/YYYY-MM/`, обновить checklist/progress/ARCHITECTURE, commit+push после зелёных gates. Не деплоить.
