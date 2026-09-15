# TZ-NX-PROPOSALS-TO-FEATURES: proposals → @kppdf/features/proposals

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (3/3)
  - typecheck: PASS (kppdf-web + features, clean on first run)
  - architecture check: PASS (1517 files; baseline 17; 2 resolved since baseline)
  - tests: PASS (features 25/25 suites 251/251; kppdf-web proposals-pattern 106/106 suites, 741/748, 7 skipped, 0 failed)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB; confirmed lazy-only route)
  - checklist: docs/agent-checklists/TZ-NX-PROPOSALS-TO-FEATURES.md
  - commit: 104fb059
  - status synchronization: PASS (tracker all-DONE, _NOW.md updated)

## Root cause

The TZ asked to move `ProposalsListFacade` + `ProposalAttachOrgsDialogComponent`
into `libs/features/src/lib/proposals/`, completing the P1 facade
extraction's features-lib relocation.

## Fix

Checked every relative import first (per the pattern every prior
features-move TZ in this program required) and found **no cross-domain
blocker this time** — `proposal-attach-orgs.dialog.ts` has zero relative
imports, and the facade's only relative dependency is the already-
established `on-dialog-close-once.ts` (duplicated the usual way). Moved
both files in full, matching the TZ's literal text with zero scope
deviation — the first features-move TZ in the whole B1→B3 batch that
didn't need one.

## Files changed

- `proposals-list.facade.ts` → `libs/features/src/lib/proposals/proposals-list.facade.ts`
- `proposal-attach-orgs.dialog.ts` (+ spec) → `libs/features/src/lib/proposals/ui/`
- New: `libs/features/src/lib/proposals/ui/on-dialog-close-once.ts` (duplicate)
- New barrels: `proposals/index.ts`, `proposals/ui/index.ts`
- `frontend-nx/tsconfig.base.json` (new `@kppdf/features/proposals` path)
- `proposals-list.page.ts` (+ spec) — import paths
- `docs/agent-checklists/TZ-NX-PROPOSALS-TO-FEATURES.md` (new)

## B3 WAVE — COMPLETE (2/2)

| TZ | Commit |
|----|--------|
| TZ-NX-PROPOSALS-LIST-FACADE | 93eec886 |
| TZ-NX-PROPOSALS-TO-FEATURES | 104fb059 |

## DECOMP BATCH B1→B3 — COMPLETE

- B1 (Production Gantt+Cockpit → Order hub): 6/6 TZs, wave `0379563f`
- B2 (Supply cluster + Warehouse): 5/5 TZs, wave `07e0c2a3`
- B3 (Proposals list): 2/2 TZs, this wave

## Successor

None (batch end). PARK: role-form / registry fat forms — only on new PO ask.
