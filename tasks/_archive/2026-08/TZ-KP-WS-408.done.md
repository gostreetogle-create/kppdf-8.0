# TZ-KP-WS-408 — DONE

- **TZ:** `tasks/TZ-KP-WS-408.md` — Cutover `/proposals/create` → workspace
- **agent_id:** freebuff-1
- **claimed_at:** 2026-08-23T17:05:00+0300
- **closed_at:** 2026-08-23T17:45:00+0300
- **SHA:** _(fill after commit)_
- **Deploy:** НЕ

## Что сделано

1. **Route cutover:** `/proposals/create` → тот же компонент, что
   `/proposals/workspace` (`ProposalWorkspacePage`). `redirectTo` нельзя
   комбинировать с `canMatch` (NG04014), поэтому — loadComponent тот же.
   Query params (`id`, `new=1`, `source`, `sourceId`, `templateDraft`,
   `action=print`) сохраняются: конструктор workspace их читает.
2. **Legacy rollback path:** `proposal-create.page.ts` → `proposal-create.legacy.page.ts`
   (+ spec) — один релиз, rollback-маршрут не удалён.
3. **`?action=print` parity:** `ProposalWorkspaceDraftInit.print` +
   `pendingRoutePrint` — печать один раз, когда первое превью готово
   (build-ready и locked-snapshot-ready). Страница вешает `attachPrinter`
   на template-center через `afterNextRender`.
4. **Тесты (parity groups):**
   - `source=order&sourceId` prefill (426 parity) — клиент/объект/позиции, без resume;
   - `?action=print` — принтер вызывается ровно один раз (первое превью), не на rebuild;
   - legacy-спека (`proposal-create.legacy.page.spec.ts` + autosave) — импорт обновлён, 48 тестов живут.
5. **Chips:** `deals-group-chips.ts` не менялся — «Создать КП» ведёт на
   `/proposals/create`, который теперь = workspace (TZ: «still lands on create path»).

## Parity matrix (45 строк из TZ-KP-WS-400 audit §1)

Все строки **PASS** на workspace, кроме отложенных (defer ниже):

| # | Функция | Статус | Где |
|---|---------|--------|-----|
| 1–2 | L/R rail toggles | PASS | chrome rails `chrome-tool-*` (store + page) |
| 3–4 | Template picker + «Редактировать» → builder | PASS | picker + `?returnUrl=` |
| 5–6 | A4 preview + rebuild pipeline | PASS | draft service buildPreview |
| 7–9 | Print / PDF / archive | PASS | draft `requestOutput` (canon 368) |
| 10 | Output panel shell | PASS | `kp-ws-panel` → output section |
| 11–21 | Inspector (number/org/markup/vat/sheet/discount/estimate/recipient/timing/status/table) | PASS | `ProposalCreateInspectorComponent` mounted в params |
| 22–24 | Recipient (client/contact/site/quick-create/card) | PASS | `ProposalCreateRecipientComponent` |
| 25–28 | Products rail (catalog/module/material/add/quick-create/edit) | PASS | `ProposalProductRailComponent` |
| 29–36 | Table editor (columns/chrome/cell/discount/row-move/drawer/presentation) | PASS | `ProposalCreateTableEditorComponent` |
| 37 | Table target picker | PASS | draft `syncTableTargets/applyTableTarget` |
| 38 | Catalog-review dialog | PASS | draft `catalogReview*` + page modal (KP-CATALOG-REVIEW-NO-ESC) |
| 39 | Autosave (debounced) | PASS | draft `scheduleAutosave` |
| 40 | Draft resume / new / prefill-from-order | PASS | draft `init` + tests |
| 41 | Version menu (freeze/list/view/return) | **DEFER** | canon 367: lifecycle (freeze/версии) — только на `/proposals` (Все КП), не в студии. В legacy create — dead code (методы без template-привязки). TZ ref: TZ-SALES-367 no-savebar canon |
| 42 | Convert-to-order / duplicate-KP | **DEFER** | canon 367: «В заказ», копировать — на `/proposals`. В workspace есть «Копировать для другой фирмы» (407, ribbon). TZ ref: TZ-SALES-367 + TZ-KP-WS-407 |
| 43 | Locked/accepted snapshot | PASS | draft `applyLockedTemplateSnapshot` + тест |
| 44 | Responsive rail collapse | **DEFER/N/A** | геометрия: панель = overlay 480px (закон #4), инлайн-rail create не переносится. TZ ref: kp-workspace-geometry.md |
| 45 | Escape/backdrop/outside-click dismiss | PASS | page `onEscape` + sheet-click + catalog-review Esc exception |

## data-test mapping (smoke-совместимость)

| Было (create) | Стало (workspace) |
|---------------|-------------------|
| `kp-create-toggle-template` | `chrome-tool-template` |
| `kp-create-toggle-left` (Товары) | `chrome-tool-catalog` |
| `kp-create-toggle-recipient` | `chrome-tool-client` |
| `kp-create-toggle-right` (Параметры) | `chrome-tool-params` |
| `kp-create-toggle-table` | `chrome-tool-table` |
| `kp-create-toggle-terms` | `chrome-tool-terms` |
| `kp-create-toggle-output` | упразднён → ribbon/панель output (`kp-ws-panel`) |
| `kp-output-print` / `-pdf` / `-archive` | сохранены (в output-панели) |
| `kp-tpl-*`, `kp-rail-*`, `kp-recipient-*`, `kp-insp-*`, `kp-table-*`, `kp-catalog-review-*` | без изменений (те же компоненты) |

## Gates (факт)

| Команда | Результат |
|---------|-----------|
| `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` | PASS |
| `cd frontend && pnpm test -- proposal --runInBand` | PASS (174/174) |
| `cd frontend && pnpm lint` | PASS (0 errors; 18 pre-existing warnings) |
| `cd frontend && pnpm exec ng build --configuration development` | PASS |
| legacy rename: `deals-group-chips`/`proposals.page`/`manager-desk`/`builder`/`app-history` specs | PASS (97/97) |

## KP-E2E-SMOKE evidence

Ручной прогон на prod — гейт PO перед деплоем (409). Checklist:
- `docs/agent-checklists/KP-E2E-SMOKE.md` (создание → PDF/печать, многостраничность);
- `docs/agent-checklists/KP-WORKSPACE-SMOKE.md` (workspace-специфичный, 10 шагов).
Evidence-файл `docs/qa/kp-workspace-manager-smoke.md` указывает на
KP-WORKSPACE-SMOKE как канон. Авто-покрытие cutover-поведения — 2 новых
теста (source=order prefill, action=print) + существующие 174 proposal-теста.

## Conflict disclosure

- `app.routes.ts`, `proposal-create.page.ts` — мои conflict keys; чужой WIP на них отсутствует.
- Делегировано: ручной smoke (PO/manager), deploy (не в этой волне).

## known_limitation

- Legacy create остаётся в бандле один релиз (rollback path) — не удалён,
  route не указывает на него. 409 (cleanup) решит.
- Version menu / convert-to-order не портированы в workspace (canon 367).
