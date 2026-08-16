# TZ-COMBINE-412.done — Комбайн: склейка рядов + имя → edit + module pencil

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T23:10:00+03:00
closed_by: composer-executor-412 (kppdf-executor-loop)
TZ: TZ-COMBINE-412
WAVE: WAVE-COMBINE-PRODUCT-ROWS
DEP: COMBINE-411 DONE
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

- Same-order rows fused: `gap-0`, `border-t-0` between rows, `border-rule-strong`, rounded only on group start/end.
- Inter-order boundary `mt-3` (`data-order-boundary`); no «ЗАКАЗ» headers.
- Product name click → `editProduct` + `hover:underline`; ▸ (`combine-row-expand`) → expand; product pencil kept.
- Module chips `py-2` + pencil → `/modules/:id` (`editModule`, stopPropagation); grip remains for drag.
- DnD placeholder/jump not touched (→ 413).
- Page doc + method link updated.

## Critical files

- `frontend/src/app/pages/dashboard/dashboard.page.ts`
- `frontend/src/app/pages/dashboard/dashboard.page.spec.ts`
- `docs/pages/design-combine.page.md`
- `docs/agent-checklists/TZ-COMBINE-412.md`

## Lock

`.mimocode/locks/TZ-COMBINE-412-combine-fuse-rows-name-edit.lock`

## Known limitations

- DnD jump → TZ-COMBINE-413; order color coding — later.
