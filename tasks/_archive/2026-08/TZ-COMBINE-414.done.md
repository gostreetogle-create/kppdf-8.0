# TZ-COMBINE-414.done — Комбайн: имя/ряд → expand; edit только карандашом

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T23:15:00+03:00
closed_by: composer-executor-414 (kppdf-executor-loop)
TZ: TZ-COMBINE-414
WAVE: WAVE-COMBINE-PRODUCT-ROWS
DEP: COMBINE-412 DONE
Cursor_verdict: N/A (TZ does not require review gate)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm exec jest src/app/pages/dashboard/dashboard.page.spec.ts` — 26/26)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN (forbidden)

## Outcome

- Product name click → `toggleExpand` + `aria-expanded` / `aria-controls` (not `editProduct`).
- Qty + lane indicators also `toggleExpand`.
- Product pencil (`combine-row-product-edit`) is the only `editProduct` path.
- Fuse layout from 412 kept (`gap-0`, `mt-3`, order № on row, no «Заказ №» headers).
- Module pencil / DnD (413) not touched.
- Page + method docs: имя/ряд → expand; карандаш → edit.

## Critical files

- `frontend/src/app/pages/dashboard/dashboard.page.ts`
- `frontend/src/app/pages/dashboard/dashboard.page.spec.ts`
- `docs/pages/design-combine.page.md`
- `docs/methods/combine-product-row-kanban.md`

## Lock

`.mimocode/locks/TZ-COMBINE-414-combine-name-expands-pencil-edits.lock`

## Known limitations

- DnD jump → TZ-COMBINE-413 (park).
