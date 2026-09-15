# TZ-NX-ORDER-HUB-UI-FEATURES: Order hub UI + facade → features

ARCHIVE_MARKER
outcome: DONE (scoped — see Root cause / Fix)
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (3/3, scoped per disclosed rationale)
  - typecheck: PASS (kppdf-web + features)
  - architecture check: PASS (1502 files; baseline 17; 2 resolved since baseline)
  - tests: PASS (features 21/21 suites 236/236; kppdf-web orders-pattern 110/110 suites, 756/763, 7 skipped, 0 failed; order-hub-tray.component.spec.ts + order-detail.page.spec.ts re-verified in isolation 38/38)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.37 kB)
  - checklist: docs/agent-checklists/TZ-NX-ORDER-HUB-UI-FEATURES.md
  - commit: ced1f204
  - status synchronization: PASS (tracker all-DONE, WAVE-MAP status updated, _NOW.md updated)

## Root cause

The TZ asked to move the order-hub facade, tray UI, and its dialogs into
`libs/features/src/lib/order-hub/`, mirroring the DocStudio/production
feature-lib pattern. Investigation before moving found the tray and facade
both depend on `CompositionTreeComponent` — a real, 172-LOC Angular
component also consumed by `composition-panel.component.ts` in an unrelated
domain, not order-hub-local. Every prior TZ in this pack (A1's
`gantt-bars.constants.ts`, A4's `ProductionCockpitContext`, B1's `bind()`
host pattern) established "the lib must never reach into `apps/kppdf-web`"
as a hard rule; duplicating a real, actively-maintained 172-line component
(unlike a 15-line pure helper) would create genuine drift risk.

## Fix

Moved only the two dialogs that are genuinely order-hub-local and fully
self-contained (`kit-reserve-confirm-dialog.component.ts`,
`ship-confirm-dialog.component.ts`, no relative imports of their own) into
`libs/features/src/lib/order-hub/ui/` with a barrel. `order-hub.facade.ts`
and the tray's spec now import both dialogs from `@kppdf/features/order-hub`.
`order-hub-tray.component.ts` and `order-hub.facade.ts` stay in
`apps/kppdf-web` — documented in full in the checklist, with the identical
precedent DocStudio Editor Decomp Phase 3 set for
`studio-data-panel`/`studio-properties-panel`/etc.

Also found and corrected a stale assumption in this TZ's (and B1's)
CONFLICT KEYS: they name `order-detail.page.ts` as the tray's consumer, but
the actual consumer (rendering it as an expandable row) is
`orders-list.page.ts`. Neither needed edits since the tray's own file path
did not move.

## Files changed

- `kit-reserve-confirm-dialog.component.ts` (+ spec) → `libs/features/src/lib/order-hub/ui/`
- `ship-confirm-dialog.component.ts` (+ spec) → `libs/features/src/lib/order-hub/ui/`
- New barrels: `order-hub/index.ts`, `order-hub/ui/index.ts`
- `frontend-nx/tsconfig.base.json` (new `@kppdf/features/order-hub` path)
- `order-hub.facade.ts`, `order-hub-tray.component.spec.ts` (import paths)
- `docs/agent-checklists/TZ-NX-ORDER-HUB-UI-FEATURES.md` (new)

## B1 WAVE — COMPLETE (6/6)

| TZ | Commit |
|----|--------|
| TZ-NX-GANTT-BARS-FACADE | 0b05d437 |
| TZ-NX-GANTT-BARS-UTIL-UI | 94c4adb8 (docs-only) |
| TZ-NX-PRODUCTION-COCKPIT-FACADE | d8a4aeff |
| TZ-NX-PRODUCTION-TO-FEATURES | 01c2b46f |
| TZ-NX-ORDER-HUB-FACADE | 8261af25 |
| TZ-NX-ORDER-HUB-UI-FEATURES | ced1f204 |

## Successor

Block 2 pack (Supply + Warehouse) — `tasks/_ready/2026-09-14-decomp-b2-supply-warehouse/`, not started this session per PO instruction ("После B1 DONE — STOP").
