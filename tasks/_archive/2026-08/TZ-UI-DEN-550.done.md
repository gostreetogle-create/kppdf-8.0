ARCHIVE_MARKER
task_id: TZ-UI-DEN-550
outcome: DONE
closed_at: 2026-08-23T15:47:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-550-deals-logistics-density.md

verification:
  - typecheck: PASS
  - tests: PASS (orders/supply/shipping page specs)

## Density applied

- Orders/supply tables: `text-xs` cells, 11px «Показано» counter
- Supply viewMode chips: gold+on-gold preserved (WR-504)
- Shipping registry: 12px status (`0.75rem`), 11px counter
- Order form panel: single gold Save unchanged

## Files changed

- `frontend/src/app/pages/orders/orders.page.ts`
- `frontend/src/app/pages/supply/supply.page.ts`
- `frontend/src/app/pages/shipping/shipping.page.ts`
