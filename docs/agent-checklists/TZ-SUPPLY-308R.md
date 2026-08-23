# TZ-SUPPLY-308R checklist

> Status: **DONE**
> Marker archived: `tasks/_archive/2026-08/TZ-SUPPLY-308R.done.md`
> TZ: `tasks/TZ-SUPPLY-308R-quick-order-layout-restore.md` → archived
> PO choice: **A** (stacked ▸ strips, not 3 columns)

## Claim slot

- agent_id: cursor-composer-executor
- claimed_at: 2026-08-23T21:42:01+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable
- closed_at: 2026-08-23T21:55:00+03:00

## Conflict keys

- `frontend/src/app/pages/supply/supply-quick-order.component.ts`
- `frontend/src/app/pages/supply/supply-quick-order.component.spec.ts`

## Acceptance

- [x] Position strip always visible when row expanded
- [x] ▸ Поставщик / ▸ Детали и статус toggles; strips gated
- [x] ▸ Ещё optional (unchanged)
- [x] Not 3 columns side-by-side as default — vertical stack
- [x] Dense field layout inside open strips; no center islands / side voids
- [x] Green square + buttons (`supply-quick-order__add-btn`) preserved
- [x] whereExpanded / detailsExpanded restored (+ maybeAutoExpandWhere)
- [x] Specs updated for Option A
- [x] Gates: tsc, jest supply-quick-order --runInBand, lint

## Integrity slot

- [x] Type: page (supply quick-order UI layout)
- [x] FIC N/A (layout restore, no new route/permission)
- [x] page.md N/A (behavior restore only)
- [x] No foreign WIP in commit

## Gates

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit          PASS
cd frontend && pnpm test -- supply-quick-order --runInBand         PASS 29/29
cd frontend && pnpm lint -- --quiet …supply-quick-order…           PASS
```

## Executor report

Restored pre-307 separate expand strips (Option A). Removed 3-column default grid / wide container query. Specs open where/details where needed.
