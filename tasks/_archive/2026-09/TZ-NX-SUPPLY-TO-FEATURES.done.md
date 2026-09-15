# TZ-NX-SUPPLY-TO-FEATURES: supply + supply-requests → @kppdf/features/supply

ARCHIVE_MARKER
outcome: DONE (scoped — see Root cause / Fix)
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (scoped per disclosed rationale)
  - typecheck: PASS (kppdf-web + features)
  - architecture check: PASS (1507 files; baseline 17; 2 resolved since baseline)
  - tests: PASS (features 22/22 suites 241/241; kppdf-web supply|warehouse pattern 109/109 suites, 751/758, 7 skipped, 0 failed)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB; confirmed SupplyFacade not provided eagerly at route level)
  - checklist: docs/agent-checklists/TZ-NX-SUPPLY-TO-FEATURES.md
  - commit: 0ab7a507
  - status synchronization: PASS (tracker updated)

## Root cause

The TZ asked to move both facades + dumb UI + dialogs for `/supply` and
`/supply-requests` into `libs/features/src/lib/supply/`. Investigation
before moving found `supply-requests.facade.ts` and
`supply-request-form-dialog.component.ts` transitively need
`MaterialFormDialogComponent` — a real, 734-LOC component also consumed by
`material-registry-dialog-host.ts` (registries domain) and
`storage-put-on-stock-dialog.component.ts` (warehouse domain) — not
supply-local. Every prior features-move TZ in this program (A4's
`ProductionCockpitContext`, B1's `CompositionTreeComponent`) established
"never duplicate or reach for a real, actively-shared component" as a hard
line.

## Fix

Moved only what's genuinely self-contained or trivially duplicable:
`supply.facade.ts` (only relative dependency: the 19-line
`on-dialog-close-once.ts`, already duplicated once before for doc-studio)
to the lib root, and the fully self-contained
`supply-request-receive-dialog.component.ts` (+ spec) to `ui/`.
`supply-requests.facade.ts` and `supply-request-form-dialog.component.ts`
stay in `apps/kppdf-web`, documented in full in the checklist with the
identical precedent `TZ-NX-ORDER-HUB-UI-FEATURES` set.

## Files changed

- `supply.facade.ts` → `libs/features/src/lib/supply/supply.facade.ts`
- `supply-request-receive-dialog.component.ts` (+ spec) → `libs/features/src/lib/supply/ui/`
- New: `libs/features/src/lib/supply/ui/on-dialog-close-once.ts` (duplicate)
- New barrels: `supply/index.ts`, `supply/ui/index.ts`
- `frontend-nx/tsconfig.base.json` (new `@kppdf/features/supply` path)
- `supply.page.ts`, `supply-requests.facade.ts`, `supply-requests.page.spec.ts` (import paths)
- `docs/agent-checklists/TZ-NX-SUPPLY-TO-FEATURES.md` (new)

## Stream S — COMPLETE (S1-S3)

| TZ | Commit |
|----|--------|
| TZ-NX-SUPPLY-PAGE-FACADE | 7e68240c |
| TZ-NX-SUPPLY-REQUESTS-FACADE | 4533da8b |
| TZ-NX-SUPPLY-TO-FEATURES | 0ab7a507 |

## Successor

Stream W: `TZ-NX-WAREHOUSE-PAGES-FACADE` (W1).
