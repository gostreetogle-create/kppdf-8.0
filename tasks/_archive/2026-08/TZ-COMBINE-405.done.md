# TZ-COMBINE-405: FE DnD линий + freeze modal + ship dialog — DONE

> Source: `tasks/TZ-COMBINE-405-combine-item-dnd.md`

## OUTCOME

DONE 2026-08-16. `/design/combine` CDK DnD of OrderItem cards between
boardLane columns → `OrdersService.patchLane`. First transition of any line
into `shop` → freeze AlertDialog RU («Состав заказа будет заморожен…»);
Cancel aborts. Drop into «Отгружены»: if any line not in to_ship/shipped →
toast «Ещё N изделий не готовы»; if all ready → confirmShip → POST /ship
(never PATCH lane=shipped). Optimistic lane + rollback on error (SWEEP-401).
Deploy НЕ.

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- `pnpm test -- --testPathPattern="dashboard.page" --coverage=false` — PASS
  (dashboard.page 13 + inventory-dashboard match = 14)

## Files

- `frontend/src/app/pages/dashboard/dashboard.page.ts`
- `frontend/src/app/pages/dashboard/dashboard.page.spec.ts`
- `docs/pages/design-combine.page.md`

## known_limitation

- Module DnD → COMBINE-406/407
- Partial ship API — PARK

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T14:57:07+03:00
closed_by: cursor-composer-executor
TZ: TZ-COMBINE-405
layer: 3
conflict_keys: frontend/src/app/pages/dashboard/dashboard.page.ts; frontend/src/app/pages/dashboard/dashboard.page.spec.ts; frontend/src/app/pages/orders/orders.service.ts; docs/pages/design-combine.page.md
protects: combine item DnD freeze ship-whole FE
next: COMBINE-406/407 modules; warm deploy after 402–405 PASS
