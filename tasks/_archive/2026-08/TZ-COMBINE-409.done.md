# TZ-COMBINE-409.done — Комбайн product rows + expand mini-kanban

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T22:50:00+03:00
closed_by: composer-executor-combine-409 (kppdf-executor-loop)
TZ: TZ-COMBINE-409
WAVE: WAVE-COMBINE-PRODUCT-ROWS
DEP: COMBINE-401…408 landed
Cursor_verdict: N/A (TZ does not require review gate)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm exec jest src/app/pages/dashboard/dashboard.page.spec.ts` — 23/23)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN (forbidden)

## Outcome

- Replaced column-first kanban with sticky 5-stage headers + full-width OrderItem rows.
- Collapsed row: order · name · qty · ▸ · 5 lane indicators.
- Expand (single accordion): mini 5-cell kanban; module chips; CDK drop lists scoped to `${card.key}::lane`.
- Reused dropItem / dropModule / freeze / ship write-paths; boardLane semantics unchanged.
- Whole-product chip when catalog modules empty (polish → 410).

## Critical files

- `frontend/src/app/pages/dashboard/dashboard.page.ts`
- `frontend/src/app/pages/dashboard/dashboard.page.spec.ts`
- `docs/pages/design-combine.page.md`
- `docs/agent-checklists/TZ-COMBINE-409.md`

## Lock

`.mimocode/locks/TZ-COMBINE-409-combine-product-rows.lock`

## Known limitations

- Whole-product / multi-expand / indicator polish → TZ-COMBINE-410
- Deploy not run
