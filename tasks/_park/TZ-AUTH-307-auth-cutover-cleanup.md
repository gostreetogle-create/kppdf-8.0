# TZ-AUTH-307: Очистка старого входа

РОЛЬ АГЕНТА: Senior Security Refactoring Engineer

ЗАВИСИМОСТИ: TZ-AUTH-305 DONE ; post-cutover smoke PASS ; новый вход стабилен

LAYER: 3

PAGES: /login ; /admin/users ; /admin/devices
PAGE_DOCS: login.page.md ; admin-users.page.md ; admin-devices.page.md

CONFLICT KEYS: backend/src/modules/auth/auth.controller.ts ; backend/src/modules/auth/auth.service.ts ; backend/src/modules/auth/auth.module.ts ; backend/src/modules/auth/dto ; backend/src/modules/user/user.controller.ts ; backend/src/modules/user/user.module.ts ; backend/src/common/guards/jwt-auth.guard.ts ; frontend/src/app/core/auth.service.ts ; frontend/src/app/core/auth.interceptor.ts ; frontend/src/app/core/jwt-access-header.ts ; frontend/src/app/pages/login/login.page.ts ; frontend/src/app/app.routes.ts ; deploy/synology/DEPLOY.md ; deploy/synology/RUNBOOK.md ; docs/ops/home-host-access.md ; docs/pages/login.page.md

## ЦЕЛЬ

После доказанного cutover убрать только подтверждённо устаревшие и дублирующие пути. **Не очищать старый вход до готовности нового**: сначала параллельная реализация и smoke, затем переключение, затем этот cleanup. Иначе нет безопасного отката.

## ОБЯЗАТЕЛЬНО СОХРАНИТЬ

- password login единственного owner как break-glass;
- BrowserDeviceGrant/device session;
- Desktop/MCP `kppd_` Bearer;
- стандартный JWT API;
- audit, revoke и rollback-документацию;
- production data; wipe/reseed запрещены.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Построить фактическую карту auth-входов

1. По `rg`, route metadata, frontend consumers, Desktop/Tauri и e2e перечислить все auth endpoints, headers, guards, cookies и nginx locations.
2. Для каждого отметить `KEEP | MIGRATE | REMOVE` и доказательство caller-а.
3. Не удалять «по названию» без проверки runtime consumer.

### ШАГ 2. Закрыть ненужные публичные и дублирующие пути

1. Удалить публичную самостоятельную регистрацию `/api/auth/register`: новых устройств создают только одноразовые admin/owner invites.
2. Свести user-admin CRUD к одному каноническому `/api/admin/users`; legacy `UserController` admin-дубли удалить либо оставить только доказанный self endpoint.
3. Для `accountType=device` убрать password/reset-password UI и недостижимые handlers.
4. Удалить waiting/pending flow, если он случайно появился вопреки TZ-AUTH-303/304.
5. Удалить dead imports, DTO, tests и docs вместе с удалённым API; не оставлять заглушки.

### ШАГ 3. Убрать Basic-specific browser workaround

1. После снятия Basic проверить всех клиентов `X-Access-Token`.
2. SPA перевести на стандартный `Authorization: Bearer` и удалить browser-only workaround, если Desktop/CLI evidence подтверждает отсутствие caller.
3. Backend compatibility удалять только при доказанном отсутствии поддерживаемых клиентов; иначе оформить один явно датированный deprecation, не второй бессрочный auth-path.
4. Удалить активные Basic directives и устаревшие инструкции/секретные файлы с VPS после подтверждённого rollback window; сам rollback-runbook оставить.

### ШАГ 4. Проверить отсутствие дублей и регрессий

1. Повторный route/header/cookie inventory: один regular invite flow, один owner-device flow, один device session renew, один password break-glass, один Desktop pairing.
2. Full targeted auth/admin/desktop test matrix и browser smoke.
3. Security review diff: public endpoints, mass assignment, owner enumeration, token leaks, stale cookies.
4. Архитектура/page docs описывают только живые пути.

## НЕ ДЕЛАТЬ

- Не удалять password break-glass owner.
- Не объединять browser grant с `kppd_`.
- Не менять роли/бизнес ACL сверх AUTH-306.
- Не удалять совместимость без caller inventory.
- Не wipe, не менять DNS/TLS/tunnel.
- Не выполнять cleanup раньше PASS TZ-AUTH-305.

## КРИТЕРИИ ПРИЁМКИ

1. `/api/auth/register` недоступен; новые устройства появляются только через одноразовую ссылку.
2. Нет двух user-admin CRUD API с одинаковым назначением.
3. Нет Basic popup/directives и Basic-specific browser transport без доказанного caller.
4. Живые auth-пути перечислены один раз в каноне; dead code/tests/docs удалены.
5. Owner password break-glass, regular device, second owner device, revoke/F5 и Desktop/MCP smoke PASS.
6. Никаких orphan DTO/routes/imports, дублирующих guards или неиспользуемых cookies.
7. Gates:
   - backend/frontend typecheck, lint и targeted auth/admin/desktop tests PASS;
   - architecture check PASS;
   - route/header inventory приложен в checklist evidence;
   - browser incognito/regular/owner/revoke smoke PASS;
   - `git diff --check` PASS.
8. Перед archive заполнен `docs/agent-checklists/TZ-AUTH-307.md`, приложен `## Executor report (auto)` и получен Cursor/PO PASS.

## ФИНАЛИЗАЦИЯ

Root task: архив/lock/progress/ARCHITECTURE, отдельный зелёный commit+push. Cleanup production-конфига — только по явной команде PO, без wipe.
