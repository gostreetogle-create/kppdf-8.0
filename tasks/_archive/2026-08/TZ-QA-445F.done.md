# TZ-QA-445F — DONE

> Статус: DONE · Закрыт: 2026-08-27 · agent: freebuff-1
> TZ: `tasks/TZ-QA-445F-desk-order-row-edit-affordance.md`
> PAGES: `/desk` (OrderHubTray composition), `/orders/:id` (order-detail composition)

## Что сделано

1. **Клик по строке состава** больше не уводит в карточку каталога и не открывает
   редактор: только `selectedId` / expand-collapse в `app-composition-tree`.
2. **Карандаш** по-прежнему открывает каталожный Form dialog (`openCatalogEditFromTree`).
3. Удалён `openCatalogViewFromTree` (row→navigate) — конфликт с PO-CANON
   «из tray не navigates» и AC «редактирование только через карандаш».
4. Docs: `orders.page.md`, `ui-composition-tree.md` AC13.

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS**
- Jest focused: order-detail + order-hub-tray + composition-tree + order-composition-forest → **50/50 PASS**

## Conflict disclosure

- Keys: order-detail / manager-desk order-tray composition-list
- Not touched: doc-constructor, inventory, proposal PDF, product-detail, gantt, work-types, desktop

## Files

- `frontend/src/app/pages/orders/order-detail.page.ts`
- `frontend/src/app/pages/orders/order-detail.page.spec.ts`
- `frontend/src/app/shared/orders/order-hub-tray.component.ts`
- `frontend/src/app/shared/orders/order-hub-tray.component.spec.ts`
- `frontend/src/app/shared/orders/open-catalog-composition-edit.ts`
- `docs/pages/orders.page.md`
- `docs/pages/ui-composition-tree.md`
- `docs/agent-checklists/TZ-QA-445F.md`
- `.mimocode/locks/TZ-QA-445F-desk-order-row-edit-affordance.lock`

## Deploy

NO
