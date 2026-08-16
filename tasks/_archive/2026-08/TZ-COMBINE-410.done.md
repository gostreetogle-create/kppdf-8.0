# TZ-COMBINE-410.done — Комбайн rows: «целиком» + polish индикаторов

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T23:05:00+03:00
closed_by: composer-executor-combine-410 (kppdf-executor-loop)
TZ: TZ-COMBINE-410
WAVE: WAVE-COMBINE-PRODUCT-ROWS
DEP: COMBINE-409 DONE
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

- Prefetch `GET /modules?productId=` so collapsed lane indicators work without expand.
- Empty catalog modules → chip «целиком» in effective lane; CDK drag reuses `dropItem` → PATCH line lane.
- a11y: `aria-expanded` + `aria-controls` → panel id; `pi-focus-ring` on expand controls.
- Optional light order group headers on `orderId` change.
- boardLane / moduleLanes / freeze / ship semantics unchanged.

## Critical files

- `frontend/src/app/pages/dashboard/dashboard.page.ts`
- `frontend/src/app/pages/dashboard/dashboard.page.spec.ts`
- `docs/pages/design-combine.page.md`
- `docs/agent-checklists/TZ-COMBINE-410.md`

## Lock

`.mimocode/locks/TZ-COMBINE-410-combine-rows-whole-product-polish.lock`

## Known limitations

- Deploy not run
- Multi-expand / module drawer still park
