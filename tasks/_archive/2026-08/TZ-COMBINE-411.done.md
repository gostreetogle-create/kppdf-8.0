# TZ-COMBINE-411.done — Комбайн: убрать дубль «Заказ №», компакт рядов

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T22:58:00+03:00
closed_by: composer-executor-combine-411 (kppdf-executor-loop)
TZ: TZ-COMBINE-411
WAVE: WAVE-COMBINE-PRODUCT-ROWS
DEP: COMBINE-409/410 DONE
Cursor_verdict: N/A (TZ does not require review gate)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm exec jest src/app/pages/dashboard/dashboard.page.spec.ts` — 25/25)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN (forbidden)

## Outcome

- Removed UI `combine-order-group` / `showOrderGroupHeader`.
- Order number remains once per product row (`combine-row-order-number` → `openOrder`).
- List `gap-1`; `mt-4` + `data-order-boundary` when `orderId` changes (`isOrderBoundary`).
- No color coding; no boardLane / moduleLanes / DnD changes.

## Critical files

- `frontend/src/app/pages/dashboard/dashboard.page.ts`
- `frontend/src/app/pages/dashboard/dashboard.page.spec.ts`
- `docs/pages/design-combine.page.md`
- `docs/agent-checklists/TZ-COMBINE-411.md`

## Lock

`.mimocode/locks/TZ-COMBINE-411-combine-drop-order-group-dup.lock`

## Known limitations

- Цветовое различие заказов — отдельная TZ (park).
