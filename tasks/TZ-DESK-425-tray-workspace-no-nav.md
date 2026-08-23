# TZ-DESK-425: tray workspace — без навигации из expand

**PAGES:** `/desk`  
**PAGE_DOCS:** `manager-desk.page.md`  
**РОЛЬ АГЕНТА:** executor (Freebuff / Claude terminal)  
**ЗАВИСИМОСТИ:** DESK-423/424 DONE; `SupplyQuickOrderComponent` (SUPPLY-304)  
**LAYER:** frontend  
**CONFLICT KEYS:** `frontend/src/app/shared/orders/order-hub-tray.component.ts`; `frontend/src/app/pages/desk/manager-desk.page.ts`; `frontend/src/app/pages/desk/manager-desk.page.html` (если есть inline template — только `.ts`); `docs/pages/manager-desk.page.md`

**Проверено:** audit `docs/audits/2026-08-23-desk-tray-workspace-audit.md`; PO-CANON «Стол expand-in-row»; hub mode не регрессить.

**Решения PO (2026-08-23):** документы = desk R-flyout; производство в tray = только сводка; статусы = только draft→confirmed вручную.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. `order-hub-tray` в `mode="desk"` всё ещё содержит `routerLink` на `/production`, `/storage-items`, `/shipping` (строки ~412–486).
2. `onOpenSupply()` делает `router.navigate(['/supply'])` (`manager-desk.page.ts` ~1282).
3. `onCreateDocument()` → `/doc-constructor/templates` (~1297).
4. `panel=supply` в query и `canOpenPanel('supply')` есть, но **flyout supply не реализован** — кнопка уводит со стола.
5. DESK-416 explicitly added production navigate from tray — **superseded** для desk.

## ЧТО ДЕЛАТЬ

### 1. Контракт `mode="desk"` в tray

- Обернуть **все** `routerLink` / `<a href>` на другие routes в `@if (mode() !== 'desk')`.
- В desk заменить на emit на host или inline read-only content.
- **Не** добавлять новые routes.

### 2. Supply — flyout на столе

- `onOpenSupply()` → `openPanel('supply')` + `navigateQuery(expandedId, 'supply')`.
- R-flyout `desk-flyout-supply`: host `SupplyQuickOrderComponent` с `[orderId]="expandedId()"`.
- Закрытие flyout → `panel=null`, остаться на `/desk?orderId=`.
- Перезагрузить supply counters в tray после create/update.

### 3. Документы — desk R-flyout (канон PO + WR-509)

- `onCreateDocument(order)` → `openPanel('docs')` + `navigateQuery(expandedId, 'docs')`.
- `onOpenDocs()` → тот же flyout.
- Flyout: список шаблонов + «Создать» — reuse templates logic in-place; `{ source: 'order', sourceId }` **без** смены path.
- **Не** PiDialog для основного flow — патtern как `panel=bom` / `panel=notebook`.

### 4. Производство / склад / отгрузка — только сводка (канон PO)

- **Производство:** убрать link; lane + readiness; muted «Подробнее — chip Гantt». **Не embed** ганта/WT.
- **Склад:** counters inline, read-only; без navigate из tray.
- **Отгрузка:** строка статуса; полный раздел — chip «Отгрузка».

### 5. Статусы (канон PO)

Только ручной `draft → confirmed` в tray. Остальные — следствие процессов/документов. Без multi-status picker.

### 6. Hub mode regression guard

- `mode="hub"` — **не менять** поведение ссылок (DESK-412 contract).
- Tests: desk mode has zero `routerLink`; hub keeps links.

## ИЗМЕНЯТЬ

- `order-hub-tray.component.ts` (+ spec)
- `manager-desk.page.ts` (+ inline template section flyouts)
- `docs/pages/manager-desk.page.md` — supersede DESK-416 desk navigate

## НЕ ИЗМЕНЯТЬ

- Backend APIs
- `/orders` hub page behavior
- Workflow chips (DESK-426)
- Right rail removal (DESK-427)
- `pi-group-workspace` (DESK-429)

## КРИТЕРИИ ПРИЁМКИ

1. Expand на `/desk` → клики в tray — **URL path `/desk`** (допустим `?panel=`).
2. Supply flyout + docs flyout работают без смены path.
3. `data-test="order-production-link"` **отсутствует** в desk DOM.
4. Frontend tsc + test order-hub-tray manager-desk + lint PASS.

## Known limitations

- Full Gantt embed — out of scope; chip «Гант» (426).
- Warehouse write from desk — out of scope.

## Финализация

`tasks/_archive/2026-08/TZ-DESK-425.done.md` + Claim slot per `GEMINI.md`.
