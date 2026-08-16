# TZ-COMBINE-404: FE колонки + карточки изделий + фильтр заказа — DONE

> Source: `tasks/TZ-COMBINE-404-combine-item-cards.md`

## OUTCOME

DONE 2026-08-16. `/design/combine` shows item cards by `boardLane`
(prep|design|shop|to_ship|shipped) with RU titles + helpers. Flat OrderItems
from all orders; badge `№{order.number}`; optional filter by orderId («Все заказы»).
Missing lane → derive from `item.status`. Click badge/title → `openOrderEdit`.
`OrdersService.patchLane` wired for 405. DnD not in scope. Deploy НЕ.

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- `pnpm test -- --testPathPattern="dashboard.page" --coverage=false` — PASS (dashboard.page 6 + inventory-dashboard match)

## Files

- `frontend/src/app/pages/dashboard/dashboard.page.ts`
- `frontend/src/app/pages/dashboard/dashboard.page.spec.ts`
- `frontend/src/app/pages/orders/orders.service.ts`
- `docs/pages/design-combine.page.md`

## known_limitation

- CDK DnD + freeze modal + ship-whole gate → TZ-COMBINE-405
- Order-level status DnD (SWEEP-401) removed from Комбайн UI (now item board)

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T14:55:00+03:00
closed_by: cursor-composer-executor
TZ: TZ-COMBINE-404
layer: 3
conflict_keys: frontend/src/app/pages/dashboard/dashboard.page.ts; frontend/src/app/pages/dashboard/dashboard.page.spec.ts; frontend/src/app/pages/orders/orders.service.ts; docs/pages/design-combine.page.md
protects: combine item cards boardLane FE
next: TZ-COMBINE-405 DnD; deploy НЕ
