# TZ-NX-ORDER-WS-COMPOSITION: состав editable + tree

> **SIZE:** L · Depends: HEADER archived  
> **CONFLICT KEYS:** `order-workspace/ui/order-ws-composition*`; facade; `order-detail.page.ts`; composition-tree usage; `orders.page.md`

**IMPLICIT CONFLICT:** `nx build kppdf-web`

## ИСХОДНОЕ
Макет: dual CTA snapshot vs catalog; add/qty/delete/ready; tree. Live: flat list only. API: PATCH items; `PATCH …/ready`; `GET /products/:id/tree`.

## ЧТО ДЕЛАТЬ

1. `OrderWsCompositionComponent`:
   - Список линий: name, sku optional, qty input, unit, ready toggle, delete (confirm)
   - «+ Добавить позицию» → product picker (reuse existing registry/catalog picker pattern in app/features — не изобретать React modal)
   - Expand line → `pi-composition-tree` (lazy load tree like hub)
   - Dual CTA: «Править строки заказа» (фокус на list controls) · «Открыть в каталоге» → product route
   - Freeze: если заказ `shipped|cancelled` (и/или BE freeze) — inputs disabled + banner «Состав заморожен»
2. Facade: `addLine`, `updateQty`, `removeLine`, `toggleReady`, `loadTree(lineIndex)` — один write-path PATCH/ready.
3. Empty state: «В заказе нет изделий» + CTA добавить.
4. **Без** колонок unitPrice/total.
5. Specs: add/qty/ready/freeze disabled; tree expand.

## НЕ
- Inline edit каталожного BOM (карандаш = deep-link catalog)
- Commerce totals
- Hub tray rewrite

## AC
Оператор с карточки может добавить/изменить qty/удалить/ready без ухода в list; tree видно; freeze честный; build LAST PASS.
