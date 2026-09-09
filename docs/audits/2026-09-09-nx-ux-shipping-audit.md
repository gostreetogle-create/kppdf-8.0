# NX UX smell audit — `/shipping`

**TZ:** `TZ-NX-UX-05-shipping-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 05
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`
**Gold reference:** `/registries` (expand + `pi-button` toolbar)
**Page source (conflict keys = whole folder `pages/shipping/**`, all 4 components in scope):**
`shipping.page.ts` (380 lines, list+filters+toolbar), `shipment-create-dialog.component.ts` (218),
`shipment-edit-dialog.component.ts` (137), `shipment-doc-dialog.component.ts` (114).
**Route:** `/shipping`.

## Что это за страница

`ShippingPage` — hand-rolled `role="table"` registry of shipments (status/order/date filters,
row actions: dispatch/cancel/mark-delivered/edit/add-doc), matching the "Registry table actions
filters" note. Three dialogs (create/edit/doc) handle writes.

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| **T1** | **Таблица: нет expand / клик ничего не даёт / детали только на другой странице без причины** | **FAIL — P1** | `shipping.page.ts:120-168` — table row has **no click/expand at all**. `Shipment` carries substantial data never shown in the row and not viewable read-only anywhere: `items[]` (row shows only a count, `:125`), `recipient`, `address`, `driverInfo`, `notes`, `docs[]` (`shipment.types.ts:21-38`). The only way to see any of it is opening `ShipmentEditDialogComponent` (a **write**-intent form) or `ShipmentDocDialogComponent` — and neither shows `items`/`docs` at all. Registry-like table (per this TZ's own note) with no read-only detail view — the exact T1 anti-pattern, and the FIX TZ's own first suggested remedy ("expand-in-row if table registry-like") names this case |
| T2 | Таблица: пустые/сдвинутые колонки; нет loading/empty/error | **OK** | `shipping.page.ts:98-108` — loading text, `app-pi-status-banner` error w/ retry, honest empty «Отгрузок пока нет. Создайте первую из заказа.» |
| **A1** | Действия: primary/secondary как `<a class="underline">` / голый текст вместо `pi-button` | **FAIL — P2** | All row actions correctly use `pi-button pi-button-primary/secondary` (`:129-164`, better than #04 orders' pre-fix state). One exception: the order-filter chip's reset control is a `<button class="underline underline-offset-2 hover:text-sunrise-warm">` (`:60-62`) — matches the literal "underline instead of pi-button" anti-pattern, though scoped to a small in-chip dismiss action, not a primary/secondary CTA |
| A2 | Destructive без confirm | **OK** | `cancelShipment` `:326-352` opens `AlertDialogComponent` (`variant: 'destructive'`) before calling the API — matches gold. `dispatch`/`markDelivered` have no confirm, consistent with how `/orders` hub-tray's non-destructive status transitions are also un-confirmed (status changes, not data loss) |
| F1 | Фильтры: поле без `pi-label` / голый native select | **OK** | Both filters have a real associated `<label class="sr-only" for="...">` (`:65,78`) — actual `<label for>` element, even stronger a11y wiring than the gold's `aria-labelledby` span pattern |
| F2 | Фильтры: нет сброса чипа deep-link | **OK** | Order filter (deep-linked via `?orderId=`) has a visible chip + «Сбросить» (`:57-64`), tested in `shipping.page.spec.ts:90-101`. Status filter resets via its own «Все статусы» option, same as gold |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **N/A** | No dropdown-menu on this page; order/warehouse `<select>` options show `order.number`/`warehouse.name`, never raw ObjectId |
| L1 | Layout: контент липнет к рамке (< `--space-3`/12px) | **OK** | `px-panel-inset py-6`, `px-4 py-2/py-3`, `gap-3` — no sub-token spacing |
| L2 | Layout: прыгающие ошибки валидации | **OK** | All 3 dialogs use `app-pi-form-field` consistently (reserved error-line primitive, TZ-UX-441) — no ad-hoc validation UI |
| C1 | Copy: EN в UI; мёртвые кнопки; stub «скоро» без честного empty | **OK** | All copy RU; every button has a real handler; honest empty states (`Нет активных складов`, `Нет складов`, `Отгрузок пока нет`) |

## Что уже ок (не чинить)

- Row-action buttons already use canonical `pi-button` throughout — no ad-hoc styling like #04 orders had before its fix.
- Destructive-confirm pattern for cancel matches gold exactly (`AlertDialogComponent`, same copy style as `/orders`).
- Filter labeling (`<label for>` + `sr-only`) is arguably *better* than the gold's own pattern.
- All 3 dialogs (`create`/`edit`/`doc`) use `app-pi-form-field` + `app-pi-button` consistently — clean, no L2/A1 smells, honest inline errors and empty-warehouse warnings.
- `shipping.page.spec.ts` already covers filters, dispatch, cancel-confirm, deliver, empty-state — good regression net for the T1 fix.

## Verdict

**PASS-FIX** — found 1×P1 (T1: no expand/detail view despite substantial hidden per-shipment
data — items, recipient, address, driver, notes, docs) and 1×P2 (A1: filter-chip reset button
styled as underline text). FIX TZ (`TZ-NX-UX-05-shipping-FIX`) — **claim**: add expand-in-row
(same hand-rolled pattern as `/orders` list — `orders-list.page.ts`) showing items/recipient/
address/driver/notes/docs read-only; restyle the chip reset button to `.pi-outline-btn`/similar
if free.
