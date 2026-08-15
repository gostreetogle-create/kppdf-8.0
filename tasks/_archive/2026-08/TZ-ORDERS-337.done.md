# TZ-ORDERS-337.done — Unified composition tree + edit pencil on order

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: cursor-grok-4.6-executor
TZ: TZ-ORDERS-337
DEP: TZ-ORDERS-336

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (FE composition-tree + order-detail + orders.page + forest helper + bom-panel: 48)
  - lint: PASS (owned files; pre-existing OnInit warning on orders.page)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS

## Outcome

- `app-composition-tree` pencil on every row (`data-test="composition-tree-edit"`); click emits `editClick` without collapsing.
- Order detail + list expand «Состав заказа» use the same live catalog forest (`getProductTree`), not a snapshot copy.
- Leaf product/module click (no ›) opens the catalog editor so composition can be added; module/material pencil opens matching dialogs (BOM `bom-edit` path).
- FactStack title «Заказ» (не «Паспорт заказа»); hint under «Состав».

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `frontend` jest focused specs: PASS — 48 tests
- eslint owned files: PASS (0 errors)
- deploy: NOT RUN (PO: no deploy)

## Files

- `frontend/src/app/shared/ui/composition/composition-tree.component.ts`
- `frontend/src/app/shared/ui/composition/composition-tree.component.spec.ts`
- `frontend/src/app/shared/ui/composition/product-bom-panel.component.ts`
- `frontend/src/app/pages/orders/order-detail.page.ts`
- `frontend/src/app/pages/orders/order-detail.page.spec.ts`
- `frontend/src/app/pages/orders/orders.page.ts`
- `frontend/src/app/pages/orders/orders.page.spec.ts`
- `frontend/src/app/pages/orders/order-composition-forest.ts`
- `frontend/src/app/pages/orders/order-composition-forest.spec.ts`
- `frontend/src/app/pages/orders/open-catalog-composition-edit.ts`
- `docs/pages/ui-composition-tree.md`
- `docs/pages/orders.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-ORDERS-337.md`

Primary signal: met
Secondary: PASS
