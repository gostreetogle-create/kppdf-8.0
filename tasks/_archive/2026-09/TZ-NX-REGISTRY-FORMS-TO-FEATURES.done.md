# TZ-NX-REGISTRY-FORMS-TO-FEATURES

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (no-op — no files touched; specs/build re-verified as sanity check)
  - typecheck: PASS (kppdf-web app tsconfig)
  - tests: not re-run in full (no product files changed since F1's green run)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB)
  - checklist: docs/agent-checklists/TZ-NX-REGISTRY-FORMS-TO-FEATURES.md
  - commit: 504383d5
  - status synchronization: PASS (tracker updated)

## Root cause

The TZ asked to move the three registry-form facades (+ dialogs, if clean)
into `@kppdf/features/registry-forms`, explicitly anticipating a
CompositionPanel-class blocker ("same deviation class as B1/B2").

## Fix (investigation, no code change)

Both layers turned out to be independently hard-blocked by real,
non-duplicable Angular components:

- Dialogs (`material/module/product-form-dialog.component.ts`) import
  `CompositionPanelComponent`, which itself imports `CompositionTreeComponent`
  — the same blocker class that already stopped `TZ-NX-ORDER-HUB-UI-FEATURES`
  (B1) and the B2 supply/warehouse features-move TZs.
- Facades (`material/module/product-form.facade.ts`) each call
  `this.dialog.open(CategoryFormDialogComponent, …)` — a real, shared
  `@Component` (233 LOC) also used by doc-studio and registries-data,
  deliberately outside this TZ's conflict keys.

Unlike prior scoped-down TZs (where the dialog UI was blocked but the
facade was clean and moved alone), here **neither** layer is clean.
Relocating only the genuinely pure leftovers (`on-dialog-close-once.ts`,
`dirty-dialog.guard.ts`, `material-formatters.ts`) would produce an empty
`registry-forms` lib with no actual form logic — rejected as pure
indirection with no benefit. Decision: no relocation; everything stays in
`apps/kppdf-web` exactly as F1 left it.

## Files changed

- None (product code). `docs/agent-checklists/TZ-NX-REGISTRY-FORMS-TO-FEATURES.md` (new, investigation write-up).

## B4 wave — COMPLETE (R1–F2)

| TZ | Commit |
|----|--------|
| TZ-NX-ROLE-FORM-FACADE | a2859085 |
| TZ-NX-ROLE-FORM-TO-FEATURES | 0e21bfa1 |
| TZ-NX-REGISTRY-FORMS-FACADE | 20ae8800 |
| TZ-NX-REGISTRY-FORMS-TO-FEATURES | 504383d5 (no-op, documented blocker) |

## Successor

None — B4 is the last wave in this DECOMP series per the current prompt
chain. Next work (Studio Phase 5 UI-split, Shipping page, Composition
panel deep split, Deploy/Wipe) is explicitly parked, not started.
