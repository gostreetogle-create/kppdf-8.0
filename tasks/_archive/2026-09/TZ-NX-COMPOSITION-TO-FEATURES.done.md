# TZ-NX-COMPOSITION-TO-FEATURES

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (composition specs green as part of features lib; consumers green in full kppdf-web suite)
  - typecheck: PASS (kppdf-web app + features lib, both clean on first run)
  - architecture check: PASS (1527 files; baseline 17; 2 resolved since baseline)
  - tests: PASS (features 32/32 suites 273/273; kppdf-web full suite 99/99 suites, 719/726 passed, 7 skipped, 0 failed — one initial jest-spy-on-barrel failure, fixed via narrow tsconfig path)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB; confirmed no eager route provider)
  - checklist: docs/agent-checklists/TZ-NX-COMPOSITION-TO-FEATURES.md
  - commit: daa66698
  - status synchronization: PASS (tracker updated)

## Root cause

The TZ asked to move `composition-tree`/`composition-panel`/
`composition-picker-dialog` + helpers/specs into
`@kppdf/features/composition`, to unblock B4 F2 (registry-form dialogs)
and order-hub's full features move — both previously blocked because
`CompositionPanelComponent`/`CompositionTreeComponent` lived in the app.

## Fix

Checked every relative import first. Unlike every prior features-move TZ
in this program, the composition folder had **no real blocker**: all
internal imports were self-contained siblings, and the one external
dependency (`on-dialog-close-once.ts`, 19 LOC pure) already had an
established duplication pattern. Moved the entire folder (8 source +
their specs) in full, and updated all 8 external consumers
(order-hub tray/facade, the 3 registry-form dialogs, 2 of the 3
registry-form facades, and one spec's dynamic import).

One jest-specific wrinkle: spying on a function re-exported through the
`export *` barrel chain threw `Cannot redefine property` (non-configurable
forwarding getter). Fixed with a narrow tsconfig path
(`@kppdf/features/composition/composition-focus-scroll`) pointing at the
leaf module directly, used only by the spec's spy — the component's own
import stays on the barrel.

## Files changed

- `pages/composition/*` (8 files + specs) → `libs/features/src/lib/composition/ui/*`
- New: `libs/features/src/lib/composition/index.ts`, `ui/index.ts`, `ui/on-dialog-close-once.ts` (duplicate)
- New tsconfig paths: `@kppdf/features/composition`, `@kppdf/features/composition/composition-focus-scroll`
- 8 consumer files (imports only)
- `docs/agent-checklists/TZ-NX-COMPOSITION-TO-FEATURES.md` (new)

## Successor

`TZ-NX-DECOMP-DEBT-CLOSEOUT` (C2) — finish the moves this TZ unblocked:
registry form dialogs → features (B4 F2 retry), order-hub tray/facade if
now unblocked, supply leftovers if any.
