# TZ-TEST-COMBINE-411: FE OrdersService.patchLane spec — DONE

> Source: `tasks/_backlog/TZ-TEST-COMBINE-411-orders-service-patchlane.md`

## OUTCOME

DONE 2026-08-16. `orders.service.spec.ts` +2 кейса: `patchLane` бьёт
`PATCH /orders/:id/lines/:lineId/lane` с body `{ lane }` (ok → data) и
http-ошибка (400 shipped) → `SilentResult { ok:false }`. Deploy НЕ.

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- `pnpm exec jest --config jest.config.js --testPathPattern="orders.service" --no-coverage` PASS — 12 tests (+2)

## Files

- `frontend/src/app/pages/orders/orders.service.spec.ts`

## known_limitation

- n/a

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T15:18:00+03:00
closed_by: deepseek/deepseek-v4-pro
TZ: TZ-TEST-COMBINE-411
layer: 1
conflict_keys: frontend/src/app/pages/orders/orders.service.spec.ts
protects: FE patchLane HTTP contract spec
next: TZ-TEST-COMBINE-412 (dashboard extra cases)
