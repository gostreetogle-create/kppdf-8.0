# TZD-ORDER-IMPORT-01 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-ORDER-IMPORT-01.md`
> Commit/push: по `docs/GIT-POLICY.md` — после gates PASS локальный commit;
> push — только после PO review (как и TZ-STRAT-01A).

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-22T09:15:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI room active)
- CONFLICT KEYS: см. `tasks/_active/TZD-ORDER-IMPORT-01.md` § CONFLICT KEYS — чистый backend/MCP, без пересечения с TZ-STRAT-01A (frontend)

## Preflight

- [x] `git status`/`branch` проверены — main, чистое дерево кроме заранее известного чужого WIP
- [x] `_NOW.md` + `tasks/_active/` прочитаны — единственная другая активная TZ (TZ-STRAT-01A) не пересекается по файлам
- [x] TZ записан в `tasks/_active/TZD-ORDER-IMPORT-01.md` (постановка PO + мои архитектурные решения)
- [x] Claim slot заполнен, Status = CLAIMED / IN PROGRESS

## Acceptance (из постановки PO)

- [x] `Order.schema.ts` — поле `source: 'manual' | 'desktop-import'`, default `'manual'`
- [x] `CreateOrderDto`/`OrderService.create` — источник `source` прокинут; при подтверждении через mutation-journal `order.create` всегда форсится `'desktop-import'` (не принимается из payload — `mutation-journal.service.ts` подставляет его напрямую в `confirm()`, а не читает из proposal)
- [x] `mutation-journal`: новые kinds `counterparty.create`, `site.create`, `order.create` — propose/confirm/undo реализованы
- [x] `order.create` payload несёт `items[].quantity`, ссылается на реальные `productId`; пишет SoT только через существующий `OrderService.create` (второго write-path нет)
- [x] `ImportTaskRow`/`AiReportProposed` — новое поле `quantity`
- [x] `AiReportRow.proposalId` — row-level трассировка после apply_plan (`PATCH .../proposals` расширен `rowProposals[]`, обратная совместимость с плоским `proposalIds` сохранена — старые клиенты apply_plan продолжают работать)
- [x] Новый MCP tool `kppdf_import_task_finalize_order` — собирает один `order.create` proposal из подтверждённых product-строк; строки без `quantity`/неподтверждённого `proposalId` попадают в `excludedRows` с причиной, не теряются молча
- [x] Новые MCP tools `kppdf_propose_counterparty_create` / `kppdf_propose_site_create` (propose→confirm через mutation-journal, НЕ прямой SoT-write — в отличие от существующих `kppdf_counterparty_create`/`kppdf_site_create`)
- [x] `desktop/docs/MCP.md` — задокументирован Order import protocol (новая секция + таблица tools + Follow-ups запись)
- [x] Backend unit-тесты на все 3 новых kind (propose validation + confirm + undo, 8 новых тестов в `mutation-journal.service.spec.ts`)
- [x] MCP unit-тест на row-level `rowProposals` linking в `applyImportTaskPlan` (`import-task-tools.test.ts`)
- [~] `kppdf_import_task_finalize_order` сам — НЕ покрыт отдельным unit-тестом (его тело инлайново в `registerTool`, как и большинство MCP-tool хендлеров в этом файле — `applyImportTaskPlan` тестируется отдельно именно потому, что вынесен в чистую функцию; тот же паттерн, что у остальных commercial/write tools, которые тоже не юнит-тестируются построчно). Логика finalize_order опирается на уже протестированный mutation-journal confirm/entityId контракт. Ручной live-прогон этого конкретного tool не делался в этой сессии — honest gap, не заявляю как PASS.

## Integrity slot (до READY / archive)

- [x] Тип изменения: module (backend) + MCP tool surface. Нет новой page/route на вебе.
- [x] FIC A–E: A (route) N/A — нет нового web route; B (permission) N/A — RBAC как у `mutation-journal`/`import-task` (admin|manager), не менялся; C (backend module) — ДА, order.create/counterparty.create/site.create kinds — описано выше; D (entity) — ДА, `Order.source` новое поле — backward-compatible (`default: 'manual'`, существующие документы не ломаются); E (MCP tool) — ДА, 3 новых tool — задокументированы в MCP.md.
- [x] FIC §F / Coupling map: order.create пишет через существующий `OrderService.create` (те же инварианты: `assertBelongsTo(siteId, counterpartyId)`, counter number, total из items) — не дублирует бизнес-правила.
- [x] Page docs / PAGE-TZ-INDEX: N/A — нет UI route.
- [x] SECTION-READINESS: N/A.
- [x] `docs/DOCS-INTEGRITY.md` reviewed — соответствует (module/MCP change, docs обновлены в MCP.md).
- [x] Чужой WIP не в коммите — во время сессии в дереве шла параллельная работа другого агента (frontend `select`/`pi-nav-dropdown`/`app-layout`, `GEMINI.md`, `_NOW.md`, удалённые `tasks/TZ-DESK-*`/`PROMPT-FREEBUFF-*`, новые audits/specs) — ни один из этих файлов не тронут и не будет staged; коммит планируется точечно только по CONFLICT KEYS этого TZ.

## Gates (факт — re-check 2026-08-22T11:41:42+03:00)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → **PASS** (0 ошибок)
- `cd backend && pnpm test` (полный) → **958/960 PASS**; 2 pre-existing failures (users-admin.controller, catalog-314.archive) — не регрессия TZ
- `cd backend && pnpm lint` → 47 errors / 195 warnings total, но **0 в TZ-файлах** (mutation-journal, order, import-task) — pre-existing debt
- `cd desktop/mcp && pnpm typecheck` → **PASS** (0 ошибок)
- `cd desktop/mcp && pnpm test` → **PASS**, 122/122
- `pnpm architecture:check` → **PASS** (979 files; baseline 6; resolved since baseline: 0)

## Executor report

**Что сделано:**
- `Order.schema.ts`/`create-order.dto.ts`/`order.service.ts` — поле `source` (`manual`|`desktop-import`, default `manual`), прокинуто в `create()`.
- `mutation-journal.schema.ts` — 3 новых kind (`counterparty.create`, `site.create`, `order.create`).
- `create-proposal.dto.ts` — `ProposeCounterpartyCreateDto`, `ProposeSiteCreateDto`, `ProposeOrderCreateDto`/`OrderCreateItemDto` с whitelist-валидацией (та же, что у прямых SoT-tools для counterparty/site; qty > 0 обязателен для order items).
- `mutation-journal.service.ts` — `proposeOne`/`confirm`/`undo` ветки для всех трёх kinds; при confirm `order.create` форсит `source:'desktop-import'` и `managerId = actorUserId`.
- `mutation-journal.module.ts` — импортированы `CounterpartyModule`/`SiteModule`/`OrderModule` (без циклов — ни один из них не импортирует `MutationJournalModule`).
- `import-task.schema.ts`/`create-import-task.dto.ts` — `quantity` на `ImportTaskRow`/`AiReportProposed`; `proposalId` на `AiReportRow`; `customerNameRaw` на `ImportTaskSource` (трассировка, backend не парсит); `RowProposalLinkDto`/`rowProposals[]` на `PatchImportTaskProposalsDto`.
- `import-task.service.ts` — `patchProposals` пишет `rowProposals` на `aiReport.rows[]` по `rowIndex` (`markModified` — `aiReport` типа `Object`).
- `desktop/mcp/src/import-task-tools.ts` — `rowSchema`/`AiPlanRow.proposed` incl. `quantity`; `applyImportTaskPlan` теперь строит `rowIndex→proposalId` и передаёт в `setProposals`; новый tool `kppdf_import_task_finalize_order` (резолвит productId по confirmed proposals/existing materialId, требует quantity>0, отчитывается об исключённых строках, создаёт один `order.create` proposal).
- `desktop/mcp/src/commercial-tools.ts` — `kppdf_propose_counterparty_create`/`kppdf_propose_site_create` (тот же whitelist, что у прямых tools, но через `/api/mutation-journal/proposals`).
- `desktop/docs/MCP.md` — секция «Order import (TZD-ORDER-IMPORT-01)», таблица новых tools, Follow-ups.
- Тесты: 8 новых в `mutation-journal.service.spec.ts`, 1 новый в `import-task-tools.test.ts`, 3 registry-теста обновлены под новые имена/счётчики (`commercial-tools.test.ts`, `import-task-tools.test.ts`, `tools-registry.test.ts`).

**Conflict disclosure:** во время сессии параллельно шла другая работа в этом же дереве (не под моим claim) — правки frontend (`select`, `pi-nav-dropdown`, `app-layout`, `supply.page`), `GEMINI.md`, `docs/agent-checklists/_NOW.md`, удаление старых `tasks/TZ-DESK-*`/`PROMPT-FREEBUFF-*` (видимо архивация), новые `docs/audits/*`/`docs/superpowers/specs/*`. Ничего из этого не тронуто; при коммите буду стейджить только файлы из CONFLICT KEYS этого TZ поимённо.

**Known limitations / explicit non-goals (см. TZ файл):**
- Именованные шаблоны сопоставления, dropdown «куда льём», кнопка «Отправить в ИИ» — не в этом TZ (см. `docs/superpowers/specs/2026-08-22-universal-import-mapping-templates.md` §2.1/2.3/2.4).
- Матчинг Counterparty/Site по свободному тексту — агент-driven (best-effort через `kppdf_list_*`), не backend-NLP — сознательное архитектурное решение, не gap.
- `kppdf_import_task_finalize_order` не имеет отдельного unit-теста (см. Acceptance выше) и не был живым end-to-end прогнан в этой сессии (только typecheck + опора на протестированные mutation-journal контракты).
- Desktop Svelte UI (кнопка finalize в «Импорт») — не добавлена, v1 MCP-only, как и заявлено в TZ файле.
- Browser/UI-сценарий не проверялся — изменения чисто backend/MCP, нет затронутого web route.

## Review handoff

- [x] READY FOR REVIEW
- [x] Не archive до PO/Cursor review PASS

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-22T11:41:42+03:00
