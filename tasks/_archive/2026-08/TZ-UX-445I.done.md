# TZ-UX-445I — DONE

ARCHIVE_MARKER

> Статус: DONE · Дата: 2026-08-27 · agent: freebuff-1 (Buffy)
> TZ: `tasks/TZ-UX-445I-order-nested-collapsed-by-default.md`

## Что сделано

1. `order-hub-tray`: desk больше не форсит `compositionExpanded` / `loadComposition` в `ngOnInit` — состав = disclosure; load только через `toggleComposition`. Shipments preload + logistics auto-open для ready/shipped сохранены.
2. `composition-tree`: effect при смене root очищает `expanded`, **не** автодобавляет root — дерево стартует свёрнутым.
3. Specs: desk / tray / tree / orders — collapsed until click; 445F pencil untouched.
4. Docs: `orders.page.md` + `manager-desk.page.md` one-liner канон UX-445I.

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS**
- focused jest:
  `order-hub-tray.component.spec` · `composition-tree.component.spec` ·
  `manager-desk.page.spec` · `orders.page.spec` → **88/88 PASS**

## Conflict disclosure

- Keys: tray + composition-tree + desk/orders specs + orders/manager-desk page docs
- Not touched: supply-quick-order, work-types, Gantt, backend, 445F pencil edit path

## Files

- `frontend/src/app/shared/orders/order-hub-tray.component.ts`
- `frontend/src/app/shared/orders/order-hub-tray.component.spec.ts`
- `frontend/src/app/shared/ui/composition/composition-tree.component.ts`
- `frontend/src/app/shared/ui/composition/composition-tree.component.spec.ts`
- `frontend/src/app/pages/desk/manager-desk.page.spec.ts`
- `frontend/src/app/pages/orders/orders.page.spec.ts`
- `docs/pages/orders.page.md`
- `docs/pages/manager-desk.page.md`
- `docs/agent-checklists/TZ-UX-445I.md`
- `.mimocode/locks/TZ-UX-445I-order-nested-collapsed.lock`

## Deploy

NO
