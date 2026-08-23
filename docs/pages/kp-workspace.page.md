# Страница: КП Single Workspace (`ProposalWorkspace*`)

**Краткое описание:** одно рабочее место менеджера для **создания и правки коммерческого предложения** — каталог, шаблон, получатель, параметры, состав/таблица, условия, вывод и настройки документов **без обязательного ухода** в `/doc-constructor/*`. Центр = A4-превью; инструменты = overlay-панели.

> **SoT этой страницы.** При любой правке workspace / shell / rails — **сначала этот файл**, затем код. После изменений — **обновить этот файл в той же TZ** (route, секции, API, data-test, known_limitation).  
> Геометрия (immutable): [`kp-workspace-geometry.md`](./kp-workspace-geometry.md).  
> Программа волн: [`../audits/2026-08-23-kp-single-workspace-program.md`](../audits/2026-08-23-kp-single-workspace-program.md).  
> Legacy (до cutover 408): [`proposals-create.page.md`](./proposals-create.page.md) — поведение create; после cutover этот файл = единственный канон студии.

## Север продукта (зачем страница)

1. Менеджер **живёт здесь** при работе с КП: не прыгает в «Документы» за таблицей/текстом/фоном — открывает inline или returnUrl в builder.
2. **Один write-path** на `Quotation` (autosave draft), как на create; snapshot ≠ молчаливая правка каталога.
3. **Multi-supplier:** копия КП + смена `Organization` (наша фирма) + при необходимости другой шаблон / family variants.
4. **MCP/AI-ready:** черновик шаблона `[AI-DRAFT]` из Desktop MCP → доработка в workspace/builder; парсинг PDF/картинки — successor, не блокер UI.

## Routes

| Route | Статус | Title / роль |
|-------|--------|----------------|
| `/proposals/demo-workspace` | **Wave 0 PASS** | Геометрия + placeholders; эталон layout (тонкий wrapper над shell, TZ-KP-WS-401) |
| `/proposals/workspace` | **TZ-KP-WS-404 DONE** | Left (каталог/шаблон/клиент) + right (параметры/таблица/условия/вывод) panels; hydration + autosave + preview; catalog review |
| `/proposals/create` | legacy до **TZ-KP-WS-408** | Текущая студия; после cutover → workspace (или redirect) |
| `/proposals` | list | Lifecycle (статус, копия, заказ) — **не** в workspace ribbon (канон 367) |

`pageKey` / ACL: как у create (`proposals`, adminOnly до решения PO).

Chips «Сделки»: **КП** · **Договоры** · **Заказы**; секция КП: **Создать КП** → workspace (после 408) · **Все КП** · Demo (временно).

## Query params

| Param | Назначение |
|-------|------------|
| `id` | resume draft `Quotation` |
| `new=1` | новый черновик (не открывать lastDraft) |
| `source=order` + `sourceId` | prefill из стола/заказа (DESK-426) |
| `action=print` | открыть и печать (как create) |
| `templateDraft` | (Wave 406) открыть AI-draft шаблон / todo |

Resume keys localStorage (пока общие с create): `kp.create.lastDraftId`, `kp.create.lastTemplateId`.

## UI — каркас

```
┌─ group-workspace chips (Сделки / КП) ─────────────────────────┐
├─ ribbon (ориентация · №/дата · статус/сумма · Печать/PDF) ────┤
├ chrome-rail-L ┬─ body (relative) ─────────────────────────────┤
│  Template     │  [panel overlay 480px] │ viewport (A4 stage) │
│  Catalog      │  absolute left         │ sheet flex-end 8px  │
│  Recipient    │                        │                     │
├ chrome-rail-R ┤  (right sections)      │                     │
│  Params       │                        │                     │
│  Table (L)    │  tier-L может ~794px overlay, без reflow A4  │
│  Terms        │                        │                     │
│  Output       │                        │                     │
└───────────────┴────────────────────────┴─────────────────────┘
```

- **Панель = overlay** поверх viewport; open/close **не двигает и не сжимает** A4 (portrait **и** landscape).
- **Panel width:** 480px (S-tier); контент `max-width: 272px` где применимо; Table = tier-L overlay (~A4).
- **Left chrome rail:** `PiChromeToolsService` — иконки слева и в альбоме; horizontal strip только `<lg`.
- **Ribbon:** действия и режимы (ориентация, печать), не третий flyout с формой.
- **Клик по A4** / Escape → свернуть панель (кроме модалки catalog-review).

Детали геометрии: [`kp-workspace-geometry.md`](./kp-workspace-geometry.md).  
IA иконок (после 400): [`kp-workspace-rail-ia.md`](./kp-workspace-rail-ia.md) — создать в TZ-400.

## Секции (target IA)

| Секция | Rail | Содержимое (reuse create components) | Тир |
|--------|------|--------------------------------------|-----|
| Шаблон | L | picker + «Редактировать» → builder `?returnUrl=` workspace; фон/AI-draft (405/406) | S |
| Каталог | L | витрина изделий/модулей/материалов: search, chips, pager, cards, «В КП: N» | S / L* |
| Получатель | L | Counterparty · контакт · объект | S |
| Параметры | R | org, деньги, сроки, вид листа | S |
| Редактор таблицы | R | состав + chrome + DnD + row drawer + catalog review | L |
| Условия | R | `Quotation.terms` + библиотека TextBlock | S |
| Вывод | R / ribbon | Печать · PDF · Архив (gates 368) | S |

\* если витрина не влезает в 480 — nested/wider overlay, **без** reflow A4.

**Не дублировать** список «Позиции КП» в каталоге (канон 375) — состав только в редакторе таблицы.

## Preview (центр)

- `DocumentTemplatesService.build(templateId, { previewLines, tableLayout, dealTotals, organizationId? })`
- Sandboxed iframe `srcdoc` (`data-test="kp-tpl-html-preview"`) — только просмотр
- Multipage: стек `.doc-page`; нумерация в бланке
- Rebuild debounce ~200ms при смене шаблона / org / lines / terms / layout
- Read-only при `status === accepted` (snapshot)

Полный канон превью/вывода до cutover: [`proposals-create.page.md`](./proposals-create.page.md) § Center / Вывод.

## API (основные)

| Метод | Endpoint | Назначение |
|-------|----------|------------|
| GET/POST/PATCH | `/quotations` · `/:id` | CRUD draft |
| POST | `/quotations/:id/pdf` | PDF |
| POST | `/quotations/:id/duplicate` | копия (multi-supplier) |
| POST | `/quotations/:id/attach-organizations` | family variants |
| POST | `/document-templates/:id/build` | HTML preview |
| CRUD | `/table-templates`, `/text-blocks` | shared presets (inline 405) |
| POST | `/document-templates` | AI-draft shell (MCP 406) |

Сервисы FE: `ProposalsService`, `DocumentTemplatesService`, `TableTemplatesService`, `TextBlocksService`, `GeneratedDocumentsService`, `PiChromeToolsService`.

## State (target после 402)

| Сигнал / store | Назначение |
|----------------|------------|
| `ProposalWorkspaceStore` (TZ-402 DONE) | `activeLeft` / `activeRight` / `panelOpen` / `orientation` / `quotationId`; actions `openSection`/`toggleSection`/`closePanel`/`setOrientation` |
| `ProposalWorkspaceDraftService` (TZ-404 DONE) | `selectedTemplate`/`draftLines`/`previewHtml`/`previewPages`/`previewStatus` + recipient/terms/org/деньги/сроки + right-panel state: `kpTableLayout`/`tableTargets`/`tableTemplateId` + `catalogReviewOpen`/`catalogReviewRows` + `requestOutput` gates + `saveDraft`/`scheduleAutosave` (1200ms) + hydration `?id`/`?new=1`/`source=order`/resume |
| draft lines / templateId / org / recipient / terms / sheetLayout / kpTableLayout | как create — один autosave path |
| `panelCollapsed` | overlay hide; A4 неизменен |

## Dialogs / overlays

| Что | Примитив | Когда |
|-----|----------|--------|
| Tools panel | shell absolute overlay | секции L/R |
| Catalog review | modal (create reuse) **TZ-404 DONE** | exit table editor с dirty catalog fields; Esc НЕ закрывает (formal exception KP-CATALOG-REVIEW-NO-ESC) |
| Table preset | `PiDialog` (`TableTemplateFormDialogComponent`) | **TZ-405 DONE** — edit from table panel, без route change; save → `kpTableLayout` sync |
| Text block | `PiDialog` (`TextBlockEditorComponent` host) | **TZ-405 DONE** — create/edit from terms panel; save → `libraryRefresh` bump |
| Template mini (rename/дубликат/фон) | inline + `PiDialog` | **TZ-405 DONE** — full canvas остаётся builder `?returnUrl=` |
| Pairing desktop | existing pairing dialog | Wave 406 CTA |
| Family attach | existing family dialog | Wave 407 |

**Запрет:** hand-rolled modal/backdrop вне shell + Pi primitives ([`AI-UI-CONTRACT.md`](../AI-UI-CONTRACT.md)).

## Couplings

| Поле | Этот экран | Другие | Смысл |
|------|------------|--------|-------|
| `Quotation.status` | read-only accepted | `/proposals` lifecycle | один канон статусов |
| `organizationId` | params / preview build | list, family | **наша фирма**, не клиент |
| `counterpartyId` | получатель | desk prefill | покупатель |
| `kpTableLayout` | table editor | build / PDF | copy-on-write instance; shared TableTemplate не патчить с КП |
| `templateSnapshot` | accepted / PDF | — | snapshot SoT после freeze |

Канон: [`../COUPLING-MAP.md`](../COUPLING-MAP.md).

## Файлы кода (эволюция)

| Сейчас (Wave 1) | Цель |
|-----------------|------|
| `.../demo/proposal-workspace-demo.page.*` | **тонкий wrapper над shell** (TZ-401 DONE) |
| `.../workspace/proposal-workspace-shell.component.*` | **SoT геометрии** (TZ-401 DONE); rails/store — TZ-402 |
| `.../workspace/proposal-workspace.page.ts` | `/proposals/workspace` — shell + chrome rails L/R + placeholder (TZ-401/402 DONE) |
| `.../workspace/proposal-workspace.store.ts` | store state machine (TZ-402 DONE) |
| `.../workspace/proposal-workspace-draft.service.ts` | draft: hydration + autosave + build — один write-path; right-panel методы (TZ-403/404 DONE) |
| `proposal-create.page.ts` + `proposal-create-*` / `proposal-product-rail` | reuse в панелях; god-page снять в 409 |
| `tasks/kp-workspace-dummy/*` | reference only после 401 |

## Wave / TZ

| TZ | Что |
|----|-----|
| Wave 0 | geometry PASS — demo |
| **KP-WS-400** | audit + rail IA docs |
| **401** | shell component + `/proposals/workspace` — **DONE** |
| **402** | store + chrome rails — **DONE** (L3+R4, unique Lucide, Esc/close) |
| **403** | left: catalog / template / recipient — **DONE** (mount + hydration + autosave + preview) |
| **404** | right: params / table / terms / output — **DONE** (inspector/table-editor/terms/output mounted; catalog review на exit; output gates 368; tier-L overlay без A4 reflow) |
| **405** | embedded doc settings — **DONE** (table preset inline PiDialog; text block inline dialog + library refresh; template mini: rename/duplicate/фон; full builder через returnUrl) |
| **406** | MCP AI-draft bridge |
| **407** | multi-supplier UX |
| **408** | cutover create → workspace |
| **409** | legacy cleanup; этот файл = SoT |

Wave: [`../../tasks/WAVE-KP-SINGLE-WORKSPACE.md`](../../tasks/WAVE-KP-SINGLE-WORKSPACE.md).

## Правила обновления документации (обязательно)

Любая TZ, которая меняет workspace, **в AC** должна иметь:

1. Обновлён **этот** `kp-workspace.page.md` (route / секции / API / data-test / limitation).
2. При смене геометрии — ещё [`kp-workspace-geometry.md`](./kp-workspace-geometry.md) (только по согласованию PO).
3. При смене иконок/rail — [`kp-workspace-rail-ia.md`](./kp-workspace-rail-ia.md).
4. Строка в [`PAGE-TZ-INDEX.md`](./PAGE-TZ-INDEX.md).
5. Не дублировать длинную историю create — ссылка на [`proposals-create.page.md`](./proposals-create.page.md) до cutover; после 408 — перенести уникальное сюда, create пометить superseded.

## known_limitation (на сейчас)

- `/proposals/workspace` ещё не production — demo = layout; create = полный функционал.
- PDF/image → auto blocks: нет; MCP только empty `[AI-DRAFT]` + todo (406).
- Full builder canvas остаётся на `/doc-constructor/builder/:id` с returnUrl.
- Lifecycle UI (статус / версии / «В заказ») — на `/proposals`, не в ribbon workspace (367).

## Связанные docs

- [`proposals-create.page.md`](./proposals-create.page.md) — frozen create behavior
- [`proposals.page.md`](./proposals.page.md) — список КП
- [`builder.page.md`](./builder.page.md) · [`tables.page.md`](./tables.page.md) · [`texts.page.md`](./texts.page.md)
- [`page-chrome.md`](./page-chrome.md) — chrome rail
- [`../../desktop/docs/MCP.md`](../../desktop/docs/MCP.md)
- Smoke: [`../agent-checklists/KP-E2E-SMOKE.md`](../agent-checklists/KP-E2E-SMOKE.md)

---

_Создано: 2026-08-23. Последнее обновление: 2026-08-23 (Wave 0 PASS; SoT до/во время KP-WS-400…409)._
