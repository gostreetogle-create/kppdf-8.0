# TZ-COMBINE-406: moduleLanes SoT (v1.1) — DONE

> Source: `tasks/_backlog/TZ-COMBINE-406-module-lanes.md`

## OUTCOME

DONE 2026-08-16. Backend: `Order.moduleLanes: [{ lineId, moduleId, lane }]`
(sparse) + `PATCH /orders/:id/lines/:lineId/modules/:moduleId/lane`.
Полоса линии = **min** по её moduleLanes (если есть записи), иначе `boardLane`;
`rollupOrderStatus` считает по этой эффективной полосе (последний модуль уходит →
родитель следует min). `lane=shipped` через PATCH → 400 RU. FE ghost (→407) и
shop-gate (→408) вне scope. Deploy НЕ.

## Gates

- `npx tsc --noEmit` (backend) — PASS
- `npx jest src/modules/order --silent` — PASS (3 suites / 75 tests; +6 новых: upsert sparse, reject shipped, unknown lineId, invalid moduleId, rollup min, effectiveLineLane)

## Files

- `backend/src/modules/order/order.schema.ts` (+ ModuleLane embedded)
- `backend/src/modules/order/order.service.ts` (+ patchModuleLane, effectiveLineLane, LANE_ORDER, rollup на эффективной полосе)
- `backend/src/modules/order/order.controller.ts` (+ PATCH .../modules/:moduleId/lane)
- `backend/src/modules/order/dto/patch-module-lane.dto.ts` (new)
- `backend/src/modules/order/order.service.spec.ts`, `order.controller.spec.ts`
- `docs/COUPLING-MAP.md` (§2b moduleLanes + header)

## Known limits

- `item.status` остаётся дериватом line-level `boardLane` (не трогается при
  сдвиге модуля) — «X из Y» и legacy kanban используют линию. Комбайн-полоса и
  rollup уже учитывают модули.
- moduleLanes не populate (moduleId → ProductModule) — рендер имён модулей в 407.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T17:25:00+03:00
closed_by: freebuff (deepseek-v4-pro)
TZ: TZ-COMBINE-406
COMMIT: 8fbf8589
layer: 2
conflict_keys: backend/src/modules/order/order.schema.ts; backend/src/modules/order/order.service.ts; backend/src/modules/order/order.controller.ts; backend/src/modules/order/dto/patch-module-lane.dto.ts; backend/src/modules/order/order.service.spec.ts; backend/src/modules/order/order.controller.spec.ts; docs/COUPLING-MAP.md
protects: order moduleLanes SoT + module lane PATCH API
next: TZ-COMBINE-407 (module DnD ghost) · TZ-COMBINE-408 (shop workType/days gate)
