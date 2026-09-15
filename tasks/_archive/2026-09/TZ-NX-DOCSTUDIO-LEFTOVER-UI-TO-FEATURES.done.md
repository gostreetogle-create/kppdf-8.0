# TZ-NX-DOCSTUDIO-LEFTOVER-UI-TO-FEATURES

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (studio* specs green, no-op; nx build last 0)
  - typecheck: PASS (kppdf-web app + features lib, clean after revert)
  - tests: PASS (kppdf-web studio* pattern 25/25 suites, 157/157 tests — unchanged)
  - architecture check: PASS (1545 files; baseline 17; 2 resolved since baseline)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB)
  - checklist: docs/agent-checklists/TZ-NX-DOCSTUDIO-LEFTOVER-UI-TO-FEATURES.md
  - commit: 14c2139a
  - status synchronization: PASS (tracker updated)

## Root cause

Studio Phase 3 (`TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE`) left 4 UI components in
the app due to TipTap/registries coupling. This wave asked to finish
moving them into `@kppdf/features/doc-studio`.

## Fix (investigation; net zero code change)

Two independent, confirmed hard blockers, one per pair:

- `studio-data-panel.component.ts` + `studio-data-vitrina.component.ts`:
  call into `createCatalogRegistryDialogHost`/`createMaterialRegistryDialogHost`,
  the real registries row-action infrastructure shared by ~15 other app
  files — moving them would mean relocating a slice of the registries
  data layer, out of this TZ's as-is scope.
- `studio-text-properties.component.ts` + `studio-properties-panel.component.ts`:
  moved cleanly through `tsc`/`jest`, but the real `nx build kppdf-web`
  failed — `@kppdf/ui/rich-text`'s TipTap dependency needs
  `moduleResolution: "bundler"`, which `libs/features/tsconfig.json`
  lacks and can't gain without also changing `module` (`commonjs` →
  `preserve`) for the entire lib. Verified directly (ran the real build
  with the move in place, got the exact `TS2307`, tried the fix, hit a
  second blocking error, reverted) rather than assumed.

All 4 components stay in `apps/kppdf-web` exactly as Phase 3 left them.

## Files changed

- None (product code) — both attempted moves were fully reverted.
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-LEFTOVER-UI-TO-FEATURES.md` (new, investigation write-up)

## Successor

None named by this wave. A future TZ could tackle
`libs/features/tsconfig.json`'s `module`/`moduleResolution` mismatch with
the app (verified against the full `nx build` + `nx test features`, not
just one file) before retrying `studio-text-properties`/
`studio-properties-panel`. `studio-data-panel`/`studio-data-vitrina`
would need the registries dialog-host infrastructure itself relocated
first — a separate, larger piece of work.
