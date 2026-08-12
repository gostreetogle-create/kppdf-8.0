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

**Обязательно в том же PR:** обновить [`CAPABILITY-LEDGER.md`](./CAPABILITY-LEDGER.md), если добавил/снял продуктовую способность (строка `included`/`available`/`absent`/`removed`).

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
- [x] Import Task (AI assembly) — **TZD-22**: BE `backend/src/modules/import-task/**` + `/api/import-tasks`; Desktop «Создать задачу для ИИ»; MCP `kppdf_import_task_list|get|create|set_status`; **не** matching (→ TZD-23); propose path сохранён ✅
- [x] Matching + HITL plan — **TZD-23**: BE `PATCH /api/import-tasks/:id/report` (aiReport + awaiting_user; whitelist → rows/source не трогаются) + `PATCH /api/import-tasks/:id/proposals` (proposalIds + applying); MCP `kppdf_import_task_set_report` (0 journal) + `kppdf_import_task_apply_plan` (только `awaiting_user` + `userOk:true`; new→propose_create, update→propose_update, skip/doubt—нет); Variant C protocol в MCP.md ✅
- [x] Column ready/unfit + reshape — **TZD-26**: `kppdf_inbox_classify_columns` (canonical|unknown|conflict, mapping, sampleRows — 0 journal) + `PATCH /api/import-tasks/:id/rows` (`kppdf_import_task_reshape`; только pre-apply статусы; сброс aiReport → обязателен re-match); protocol Column ready/reshape в MCP.md; запрет EAV-полей ✅
- [x] Batch/scale — **TZD-18**: `POST /api/mutation-journal/propose-batch` (all-or-nothing best-effort + `idempotencyKey`) / `confirm-batch` / `cancel-batch`; MCP `kppdf_propose_material_batch` / `kppdf_confirm_batch` / `kppdf_cancel_batch`; `apply_plan` чанками по 100 (≤3 вызова на 120-строковый план); ImportTask cap 500→**2000**; `inbox_propose_file` limit/offset ✅
- [x] Product graph/integrity — **TZD-19**: MCP `kppdf_get_product_composition|where_used`, `kppdf_get_material_where_used`, `kppdf_get_module_composition|where_used` (живые REST shape), `kppdf_run_integrity_suite` (read-only smoke, sample ids; **не** sandbox_reset), `kppdf_list_modules`; graph protocol в MCP.md перед product.update / mass material.update ✅
- [x] Journal product kinds — **TZD-27**: `MUTATION_KINDS` += `product.create|product.update` (propose валидирует name+kind, **не** ProductService до confirm; confirm/undo с org scope зеркально material); MCP `kppdf_propose_product_create|_update` + `kppdf_validate_product` + domain schema `entity=product`; `aiReport.rows[].entity` ('material'|'product', default material) ветка в `kppdf_import_task_apply_plan` (тот же propose-batch); MCP.md product path protocol; **не** BOM/Order/КП ✅
- [x] Doc-constructor MCP — **TZD-28**: NEW `desktop/mcp/src/doc-tools.ts` — `kppdf_doc_types_list` / `kppdf_doc_template_categories_list` / `kppdf_doc_templates_list` (GET) + `kppdf_doc_template_create_draft` (POST draft: `isActive=false`, `isDefault=false`, notes `[AI-DRAFT]…`; **никогда** set-default/publish); doc-draft protocol в MCP.md → id в todo (TZD-29) ✅
- [x] Manager import todos — **TZD-29**: NEW BE `backend/src/modules/import-todo/**` (POST/GET?status=/PATCH :id, RBAC admin|manager, org-scope как import-tasks) + seed pages admin+manager; MCP `kppdf_import_todo_create` / `kppdf_import_todo_list` / `kppdf_import_todo_set_status` (`desktop/mcp/src/import-todo-tools.ts` + tools.ts) + todo protocol в MCP.md; FE thin `/import-todos` page (route + nav «Задачи импорта» + page.md + PAGE-TZ-INDEX) ✅
- [x] MCP response contract — **TZD-41**: shared `{ ok, result, id?, proposalId? }` envelope with `_id` normalization, structured content, key `outputSchema` declarations, canonical `kppdf_list_*` names and one-wave aliases; `desktop/mcp/src/tool-result.ts` + `desktop/docs/MCP.md` ✅
- [x] MCP mutation-journal confirm recovery — **TZD-42**: backend 404 for missing proposal includes the received id and `proposalId` recovery hint; MCP confirm preserves the exact top-level id and has material/product mock-chain regression; `backend/src/modules/mutation-journal/**` + `desktop/mcp/src/write-tools.ts` + `desktop/docs/MCP.md` ✅
- [x] Windows install/update docs + NSIS preinstall stop Desktop/MCP — `desktop/docs/INSTALL.md` + `src-tauri/windows/hooks.nsh` (нет locked `esbuild.exe` при update) ✅
- [x] Desktop pairing keys (TTL / multi / revoke) — **TZD-21**: opaque `kppd_…` + `/api/desktop/pairing-keys`; session JWT больше не в пакете; PAIRING.md / MCP.md ✅
- [ ] Ops: демо-данные на стенде — опц. `node scripts/seed-demo-five.mjs --base http://HOST:3000` (префикс «Тест ·»); локально для Ганта/каталога — `node scripts/seed-local-demo.mjs` (маркер `DEMO-LOCAL`, пишет в Mongo через API; boot-seed `LocalDemoSeed`, off: `LOCAL_DEMO_SEED=0`)

## F. Перед «DONE / archive»

- [ ] Этот чеклист пройден для типа изменения (A–E)
- [ ] FE/BE tsc + focused tests
- [ ] `progress.md` + checklist; чужой dirty не в коммите
- [ ] **Integrity slot в checklist заполнен** (см. `docs/DOCS-INTEGRITY.md` + `_TEMPLATE.md`)

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
