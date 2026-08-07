# Feature Integration Checklist — обязательное внедрение нового

> **Статус:** MANDATORY для агентов и людей.  
> **Зачем:** новая страница / модуль / право / MCP-tool не считается «готовым», пока не вписано во все канонические списки проекта.  
> **Обновлено:** 2026-08-06 (PO: следить за обновлением списков при любой новой фиче).

Связанные SoT (не дублировать длинно):

| Тема | Документ / код |
|------|----------------|
| Новая страница (tutorial) | [`add-new-page.md`](./add-new-page.md) |
| Protected routes / caps | [`protected-page-contract.md`](./protected-page-contract.md) |
| RBAC + PAGE_KEYS | [`RBAC-CONTRACT.md`](./RBAC-CONTRACT.md) |
| Паттерны кода | [`DEVELOPMENT-PATTERNS.md`](./DEVELOPMENT-PATTERNS.md) §8–9, §17 |
| Page docs | [`pages/README.md`](./pages/README.md) |
| Готовность разделов | [`SECTION-READINESS.md`](./SECTION-READINESS.md) |
| Permission keys | `backend/src/common/seed/permissions.constants.ts` |
| RU labels ролей | `frontend/src/app/pages/admin/permission-labels.ru.ts` |

---

## Правило

**Любой** TZ / PR, который добавляет:

- маршрут или пункт меню;
- backend-модуль с `@Permissions` / `@Roles`;
- новое capability-право;
- сущность в каталоге / складе / админке;
- MCP tool;

обязан **в том же PR** обновить все релевантные строки ниже.  
«Потом допишем списки» = **не готово** (как half-baked UI).

---

## A. Новая страница / route (UI)

- [ ] `frontend/src/app/app.routes.ts` — lazy route + `data.capabilities` / guards по контракту
- [ ] `frontend/src/app/layout/app-layout.component.ts` — `NAV_CATEGORIES` / entryPath
- [ ] Group chips / TOC, если раздел с несколькими списками (`*-group-chips.ts`, `PiGroupWorkspace`)
- [ ] `PAGE_KEYS` в `permissions.constants.ts` (1:1 с nav)
- [ ] Default `pages[]` в `admin.seed.ts` (admin / director / manager / user)
- [ ] `docs/pages/<name>.page.md` из шаблона + строка в `pages/README.md` / `PAGE-TZ-INDEX.md`
- [ ] RU UI-лейблы (не английский цех в таблице)

**TZ-PRODUCTION-303 (2026-08-06) — §A done for `/production`:** route + nav «Производство» + `PAGE_KEYS.production` + seed pages (admin/director/manager) + `production-cockpit.page.md` + PAGE-TZ-INDEX/README/SECTION-READINESS; capabilities `production:read`; director Roles on facade GET reads. Group chips N/A (single page).

## B. Новое право (`section:action`)

- [ ] Запись в `PERMISSIONS` (`permissions.constants.ts`) — ключ ASCII
- [ ] **RU подпись** в `frontend/src/app/pages/admin/permission-labels.ru.ts`  
      (через `scripts/gen-permission-labels.mjs` или `\u`-эскейпы — не сырая кириллица в seed на Windows)
- [ ] Группа категории в том же файле (`PERMISSION_GROUP_TITLE_RU` / `SECTION_TO_GROUP` в role dialog), если новая секция
- [ ] `@Permissions(...)` на Nest controller methods
- [ ] FE `data.capabilities` / `CapabilitiesService` metadata, если экран режется по cap
- [ ] При необходимости — обновить seed ролей (какие caps у manager по умолчанию)

Диалог «Новая роль» читает каталог с API + RU map: без пункта B галочка будет с английским/пустым смыслом.

## C. Новый backend-модуль / API

- [ ] `XxxModule` зарегистрирован в `app.module.ts`
- [ ] Schema + soft-delete / org scope по канону домена
- [ ] Swagger `@ApiTags` / операции
- [ ] Focused Jest на service
- [ ] `protected-page-contract` / policy audit, если route protected
- [ ] Не обходить RBAC «для удобства агента»

## D. Склад / каталог / документы (доменные списки)

- [ ] Каталог: composition / where-used / attachments — не ломать dual-write и legacy bridges
- [ ] Склад: SoT qty = `StorageItem` / movements; не возвращать остаток в `Material.stockQty`
- [ ] `SECTION-READINESS.md` — статус раздела, если меняется пользовательский контур
- [ ] Smoke-сценарий в page.md или SECTION-READINESS, если раздел претендует на READY

## E. Desktop / MCP

- [x] Новый read/write tool → `desktop/mcp/src/*-tools.ts` + таблица в `desktop/docs/MCP.md` — **TZD-15**: `kppdf_inbox_list`, `kppdf_inbox_propose_file` (`desktop/mcp/src/inbox-tools.ts`) + таблица в MCP.md ✅
- [x] Write-путь → propose/confirm + mutation journal (не silent SoT write) — **TZD-15**: inbox propose → `/api/mutation-journal/proposals` (`material.create`, toolName `kppdf_inbox_propose_file`), confirm/cancel — те же эндпоинты журнала; десктоп-кнопки «Подтвердить / Отменить» ✅
- [x] Env / connect docs, если меняется порт/auth — **TZD-15**: `KPPDF_INBOX_DIR` в таблице Env (MCP.md) + карточка «Inbox» в десктопе ✅
- [x] Domain / validate tools → `desktop/mcp/src/domain-tools.ts` + `validate-material.ts` + MCP.md — **TZD-17**: `kppdf_get_domain_schema`, `kppdf_list_categories`, `kppdf_validate_material`, `kppdf_inbox_audit_file` (+ `kppdf_inbox_propose_file` mode=validate). Validate/audit **не** создают proposal и **не** пишут SoT ✅
- [x] Connect helper (mcp.json clipboard) — **TZD-20**: `buildMcpClientSnippet` + кнопки «Скопировать mcp.json» / «Только фрагмент» в `App.svelte`; docs Cursor/LM Studio = один JSON; **не** автозапись в `~\.cursor\mcp.json` ✅
- [ ] Ops: демо-данные на стенде — опц. `node scripts/seed-demo-five.mjs --base http://HOST:3000` (префикс «Тест ·»); локально для Ганта/каталога — `node scripts/seed-local-demo.mjs` (маркер `DEMO-LOCAL`, пишет в Mongo через API; boot-seed `LocalDemoSeed`, off: `LOCAL_DEMO_SEED=0`)

## F. Перед «DONE / archive»

- [ ] Этот чеклист пройден для типа изменения (A–E)
- [ ] FE/BE tsc + focused tests
- [ ] `progress.md` + checklist; чужой dirty не в коммите

---

## Анти-паттерны

| Нельзя | Почему |
|--------|--------|
| Добавить route без `PAGE_KEYS` + seed pages | Роль не увидит пункт меню / ACL дыра |
| Добавить `@Permissions('foo:write')` без `PERMISSIONS` + RU label | Роль-диалог и валидатор расходятся |
| Хардкод 3 ролей в user form | Кастомные роли не назначаются (см. TZ-ADMIN-306) |
| Английские ключи как единственный UI-текст в админке | PO/менеджер не понимает галочки |
| MCP write без journal | Нарушение vision propose→confirm |

---

## Для авторов TZ

В шаблоне TZ (acceptance / ЧТО ДЕЛАТЬ) явно укажи:

> Обновить Feature Integration Checklist (`docs/FEATURE-INTEGRATION-CHECKLIST.md`) — пункты A/B/C…

Исполнитель без галочек чеклиста не ставит DONE.
