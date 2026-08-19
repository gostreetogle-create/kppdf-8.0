# TZ-SUPPLY-304.done — Быстрый заказ: UI-оболочка (mock data)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-19T18:50:00+03:00
closed_by: cursor-executor-subagent
TZ: TZ-SUPPLY-304
WAVE: SUPPLY-QUICK-ORDER
DEP: design canon PASS 2026-08-19
Cursor_verdict: N/A (executor close-out)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm test -- supply --passWithNoTests`)
  - checklist: DONE
  - deploy: NOT RUN (forbidden)

## Outcome

- `/supply` default → «Быстрый заказ» (`view=quick` or absent); chip «Реестр» → existing SupplyTask table 1:1.
- New `SupplyQuickOrderComponent` with mock seed (5 rows), expand-in-row tiles, toolbar, inline supplier/category create.
- Desk chip «Снабжение» → `/supply?view=quick`; tray `onOpenSupply()` → quick + `orderId` when row expanded.
- Docs: `docs/pages/supply.page.md` updated; PAGE-TZ-INDEX row notes SUPPLY-304.

## Critical files

- `frontend/src/app/pages/supply/supply.page.ts`
- `frontend/src/app/pages/supply/supply-quick-order.component.ts`
- `frontend/src/app/pages/supply/supply-quick-order.mock.ts`
- `frontend/src/app/pages/supply/supply.page.spec.ts`
- `frontend/src/app/pages/supply/supply-quick-order.component.spec.ts`
- `frontend/src/app/pages/desk/desk-workflow-chips.ts`
- `frontend/src/app/pages/desk/manager-desk.page.ts` (onOpenSupply)
- `docs/pages/supply.page.md`

## Lock

`.mimocode/locks/TZ-SUPPLY-304-quick-order-workspace-ui.lock`

## Known limitations

- Mock in-memory data; F5 resets edits.
- No API sync with SupplyTask until TZ-SUPPLY-305.
- Photo upload stub only.

## Successor

`tasks/_backlog/TZ-SUPPLY-305-quick-order-data-bind.md`
