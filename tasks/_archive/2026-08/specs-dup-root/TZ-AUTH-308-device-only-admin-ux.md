# TZ-AUTH-308: Один вход через Устройства (без дубля «Пользователи»)

РОЛЬ АГЕНТА: Frontend Engineer (+ минимальный BE только для register)

ЗАВИСИМОСТИ: TZ-AUTH-305 DONE (cutover 2026-08-15)

LAYER: 2

PAGES: /admin ; /admin/devices ; /admin/users ; /admin/roles
PAGE_DOCS: admin-devices.page.md ; admin-users.page.md ; admin-roles.page.md

CONFLICT KEYS: frontend/src/app/app.routes.ts ; frontend/src/app/layout/app-layout.component.ts ; frontend/src/app/pages/admin/admin-group-chips.ts ; frontend/src/app/pages/admin/users-admin.page.ts ; frontend/src/app/pages/admin/devices-admin.page.ts ; docs/pages/admin-devices.page.md ; docs/pages/admin-users.page.md ; docs/pages/PAGE-TZ-INDEX.md ; docs/agent-checklists/_NOW.md ; backend/src/modules/auth/auth.controller.ts

Проверено: docs/pages/admin-users.page.md ; admin-devices.page.md ; docs/ops/home-host-access.md §4 ; app.routes.ts `/admin`→users ; app-layout entryPath `/admin/users` ; ADMIN_TOC_CHIPS users+devices ; POST /api/auth/register ещё публичен ; PO-CANON: passwordless device grant + hidden owner.

Loose wording PO «убрать дубликаты пользователей» → код-канон: **Devices invite** = единственный UI-путь приглашения; classic `User` person CRUD UI deprecate; owner password + BE `/api/admin/users` KEEP.

## РЕШЕНИЕ (канон этого TZ)

**Не** удалять модель User, password login owner, Desktop `kppd_`, BE users-admin API.  
**Да** сделать так, чтобы в UI был один понятный способ: **Устройства → Создать ссылку**.  
Страница «Пользователи» не должна мозолить глаза и не должна быть точкой входа в админку.

Полный AUTH-307 (Bearer migration / wipe htpasswd / kill BE CRUD) — **НЕ** этот TZ.

## ИСХОДНОЕ СОСТОЯНИЕ

1. Канонический вход для цеха: `/admin/devices` + one-time invite + роль.
2. Параллельный дубль: `/admin/users` create/edit login+password+email — путает PO.
3. Левое меню «Пользователи» и `/admin` redirect ведут на users, не devices.
4. TOC: Устройства | Пользователи | Роли.
5. `POST /api/auth/register` всё ещё публичен — второй способ завести аккаунт в обход invite.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Админ-навигация → Устройства

1. В `app-layout.component.ts`: `entryPath` и пункт меню с `/admin/users` → `/admin/devices`.
2. Label пункта: **«Устройства»** (или «Доступ»), не «Пользователи».
3. Любые path-match списки (`'/admin/users'` для active section) обновить так, чтобы `/admin/devices` и `/admin/roles` подсвечивались корректно.

### ШАГ 2. Routes + TOC

1. `app.routes.ts`: bare `/admin` → `redirectTo: 'admin/devices'` (не users).
2. `path: 'admin/users'` → **redirect** на `admin/devices` (replaceUrl). Компонент UsersAdminPage можно оставить в codebase, но route не должен его открывать.
3. `ADMIN_TOC_CHIPS`: убрать chip `users` («Пользователи»). Остаются **Устройства | Роли**.
4. Обновить комментарии в `admin-group-chips.ts`.

### ШАГ 3. Закрыть публичный register (минимальный BE)

1. В `auth.controller.ts`: удалить или `@HttpCode`+жёстко отключить `POST register` → **404** или **410 Gone** (предпочтительно удалить endpoint + RegisterDto usage если больше нигде не нужен).
2. Обновить/удалить тесты, которые ждут успешный register.
3. **Не** трогать `POST /api/auth/login` (owner break-glass).

### ШАГ 4. Docs + hygiene

1. `admin-devices.page.md`: канон «единственный UI-путь приглашения»; TOC без Пользователи; `/admin` → devices.
2. `admin-users.page.md`: статус **DEPRECATED / redirected** — UI route редиректит на devices; BE API KEEP для owner/ops; не описывать create как рабочий UI.
3. `PAGE-TZ-INDEX.md` + `_NOW.md`: AUTH-308 active→done по факту.
4. Checklist `docs/agent-checklists/TZ-AUTH-308.md` + `## Executor report (auto)`.

## НЕ ИЗМЕНЯТЬ

- nginx / AUTH-305 auth_request / Basic rollback files.
- Owner password login, owner-invite step-up, device enroll/session/auth-check.
- Desktop pairing / MCP `kppd_` / `X-Access-Token` transport (это AUTH-307, не здесь).
- BE `POST/PATCH /api/admin/users` (оставить для break-glass/scripts).
- Roles matrix, RBAC, wipe, deploy.ps1 production secrets.
- Не делать full AUTH-307 Layer-3 cleanup в этом TZ.

## КРИТЕРИИ ПРИЁМКИ

1. Меню админки ведёт на `/admin/devices`; label не «Пользователи».
2. `/admin` и `/admin/users` открывают `/admin/devices` (redirect).
3. TOC на devices: только Устройства | Роли (нет «Пользователи»).
4. `POST /api/auth/register` недоступен (404/410) или удалён; login owner жив.
5. Devices: «Создать ссылку» + owner «Добавить мой компьютер» без регрессии (код/тесты зоны).
6. Gates:
   - `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
   - `cd frontend && pnpm test -- --testPathPattern="admin|layout|devices|auth" --passWithNoTests` (или эквивалент существующих спек зоны; не раздувать матрицу)
   - `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
   - targeted backend auth tests если register удалили
   - `git diff --check` PASS
7. Docs синхронизированы; checklist + Executor report (auto) с полным SHA.
8. Cursor/PO PASS перед archive.

## known_limitation

- Owner reset-password UI через `/admin/users` временно недоступен (redirect). Break-glass: password login API / script `reset-admin-password` / successor TZ если нужен отдельный owner «сброс пароля» экран.
- Device User rows больше не админятся через Users UI — роль/отзыв только в Devices (уже канон).

## ФИНАЛИЗАЦИЯ

Root: `GEMINI.md` + archive `tasks/_archive/2026-08/TZ-AUTH-308.done.md`, progress, lock. Commit зелёный. Deploy НЕ без слова PO «деплой».
