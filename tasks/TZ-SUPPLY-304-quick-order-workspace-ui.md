# TZ-SUPPLY-304 — Быстрый заказ: UI-оболочка (mock data)

**Status:** READY — **design PASS 2026-08-19**; Phase 1 только UI; API → SUPPLY-305.

```
PAGES: /supply ; /desk
PAGE_DOCS: supply.page.md ; manager-desk.page.md
ROLE: frontend executor (Gemini / local)
DESIGN CANON: docs/audits/2026-08-19-supply-quick-order-design-canon.md (PASS PO)
DEPENDS ON: canon PASS ✅
LAYER: frontend (routes, components, mock state)
CONFLICT KEYS: frontend/src/app/pages/supply/** ;
  frontend/src/app/pages/desk/desk-workflow-chips.ts ;
  frontend/src/app/pages/desk/manager-desk.page.ts (onOpenSupply only) ;
  docs/pages/supply.page.md
```

## Domain preflight

Проверено:
- `backend/src/modules/supply/supply-task.schema.ts` — текущий реестр `SupplyTask`, enum status, привязка к `orderId`
- `backend/src/modules/purchase-request/purchase-request.schema.ts` — backend-only, UI нет
- `backend/src/modules/status/entity-status.schema.ts` — справочник статусов по `entityType`
- `frontend/src/app/pages/supply/supply.page.ts` — табличный реестр (не трогать write-path)
- `frontend/src/app/pages/desk/desk-workflow-chips.ts` — chip «Снабжение» → `/supply`
- `frontend/src/app/pages/desk/manager-desk.page.ts:1087` — `onOpenSupply()` stub toast
- `docs/PO-CANON.md` — reuse-first, expand-in-row на столе, без второго write-path
- Excel PO 2026-08-19 — эталон полей v1

Канон имён:
- **Поставщик** = `Organization` (type `supplier`), не Counterparty
- **Наша компания** = `Organization` (наше юрлицо)
- **Заказчик** (кто просил) — v1 текст/select; не путать с Counterparty (покупатель заказа)
- **SupplyTask** — существующий реестр; быстрый заказ v1 = **отдельный UI-слой** с mock, без PATCH/POST на SupplyTask

Coupling map: N/A на Phase 1 (mock). Phase 2 (305) добавит строку `SupplyRequest.statusId` → §3.

## ИСХОДНОЕ СОСТОЯНИЕ

1. `/supply` — одна таблица SupplyTask, chip row `LOGISTICS_SECTION_CHIPS` (Закупки / Отгрузка).
2. Нет режима быстрого ввода; создание задачи требует выбора заказа и обхода каталога.
3. Desk chip «Снабжение» → `/supply` (таблица); tray «Открыть снабжение» → toast-заглушка.
4. Design canon — **PASS** (`docs/audits/2026-08-19-supply-quick-order-design-canon.md`).

## ЧТО ДЕЛАТЬ

### ШАГ 1 — IA и маршрут (canon §2)

1. Query `view=quick|registry` на `/supply`; **default = `quick`** (redirect или treat absent as quick).
2. **Две chip-строки** (sticky):
   - **Row A:** `LOGISTICS_SECTION_CHIPS` — без изменений (`Закупки` / `Отгрузка`).
   - **Row B:** segmented **«Быстрый заказ» | «Реестр»** + toolbar в tools-слоте.
3. Query `orderId` **сохранять** при переключении quick ↔ registry.
4. `DESK_WORKFLOW_CHIPS`: «Снабжение» → `/supply?view=quick`.
5. `onOpenSupply()` → `/supply?view=quick` + `orderId` если expand активен.

### ШАГ 2 — Компонент быстрого заказа (mock)

1. Новый компонент `supply-quick-order.page` (или sub-view в supply) по design canon.
2. **Mock seed** — 5 строк из canon §11 (`supply-quick-order.mock.ts`).
3. **Плитки expand-in-row** (canon §3–4):
   - одновременно **одна** развёрнутая (`expandedId`);
   - свёрнуто: summary `dd.MM · кат · title · qty · [status] · priority · supplier`;
   - развёрнуто: 4 блока + collapsible **«Ещё»** (цена, сумма, дата заказа, ответственный).
4. **«+ Создать»** — плитка **вверху**, auto-expand, focus «Наименование», defaults: status «В работе», priority «Обычный».
5. Mock selects: статусы (canon §6.1), категории (§6.2), приоритеты (§6.3), orgs; in-memory signals, F5 сбрасывает.
6. **Inline «+ Новый» поставщик** — panel под select (название + сайт), без `/organizations`.
7. **Inline «+ Новая» категория** — одно поле, push в mock-массив.
8. Toolbar: search, status filter, priority filter, «N заявок», «+ Создать».
9. Sort client-side: priority ↓, then date ↓.
10. Delete — только в развёрнутой плитке, confirm RU.

### ШАГ 3 — Визуал и a11y

1. Paper & Ink: `pi-dashed-panel`, hairline, dense spacing как `/desk` queue.
2. Priority colors: urgent=destructive tint, low=success tint (как Excel PO).
3. Empty state RU: «Нет заявок. Нажмите «+ Создать» — первая строка откроется сразу.»
4. `data-test` на: create, tile collapse/expand, status select, priority select, supplier quick-add.
5. Light/dark — проверить contrast badge/chip.

### ШАГ 4 — Docs

1. Обновить `docs/pages/supply.page.md`: два режима, query `view`, mock limitation.
2. Строка в `docs/pages/PAGE-TZ-INDEX.md`.

## ИЗМЕНЯТЬ

- `frontend/src/app/pages/supply/**` (+ новый quick-order component)
- `frontend/src/app/app.routes.ts` — только если нужен lazy child; предпочтительно query view
- `frontend/src/app/pages/desk/desk-workflow-chips.ts`
- `frontend/src/app/pages/desk/manager-desk.page.ts` — `onOpenSupply` navigate
- `docs/pages/supply.page.md`, `docs/pages/PAGE-TZ-INDEX.md`
- `docs/audits/2026-08-19-supply-quick-order-design-canon.md` — только если PO правит canon в той же волне

## НЕ ИЗМЕНЯТЬ

- `backend/**` — Phase 1 без API
- Write-path SupplyTask (POST/PATCH/confirm/ordered/received)
- Табличный реестр `view=registry` — поведение SUPPLY-301/302
- `PurchaseRequest` / `PurchaseOrder` modules
- Гант, Комбайн, КП
- Справочники admin UI (реальные CRUD — в SUPPLY-305)

## КРИТЕРИИ ПРИЁМКИ

1. `/supply` без query открывает **быстрый заказ**, не таблицу.
2. Chip «Реестр» показывает прежнюю таблицу SupplyTask 1:1.
3. Desk chip «Снабжение» и tray «Открыть» ведут на быстрый заказ.
4. Mock-плитки: collapse/expand, create с auto-expand, edit полей in-memory.
5. Статус и приоритет — dropdown (mock options), **без** drag/kanban.
6. Inline «+ Поставщик» добавляет option без навигации на `/organizations`.
7. Design canon соблюдён (блоки полей, toolbar, empty state).
8. RU copy; нет EN labels.
9. `data-test` hooks из ШАГ 3 присутствуют.
10. Spec: минимум 2 теста — default view=quick; create expands new tile.

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- supply-quick-order --passWithNoTests
cd frontend && pnpm exec eslint frontend/src/app/pages/supply --max-warnings=0
```

## known_limitation

- Данные mock; F5 теряет правки.
- Нет sync с SupplyTask / PurchaseRequest.
- Справочники не из API — hardcoded mock до SUPPLY-305.
- Фото upload — stub thumb/placeholder без реального storage.
- Связь с заказом — optional select mock, без `orderId` POST.

## Successor

`tasks/_backlog/TZ-SUPPLY-305-quick-order-data-bind.md` — EntityStatus seed, optional `SupplyRequest` schema, quick-create Organization, persist + link to registry.

## Промпт исполнителю

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-SUPPLY-304.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
5) Team Room claim best-effort
Затем: прочитай docs/AI-AGENT-GUIDE.md + docs/audits/2026-08-19-supply-quick-order-design-canon.md +
  tasks/TZ-SUPPLY-304-quick-order-workspace-ui.md и выполни TZ.
Archive только после Cursor/PO PASS если TZ требует review.
```
