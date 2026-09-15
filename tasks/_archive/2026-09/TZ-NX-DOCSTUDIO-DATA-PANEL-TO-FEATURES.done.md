# TZ-NX-DOCSTUDIO-DATA-PANEL-TO-FEATURES

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (data-panel/vitrina specs green; studio-editor specs green; nx build last 0)
  - typecheck: PASS (features lib + kppdf-web app, both clean on first run)
  - tests: PASS (features 47/47 suites 419/419; kppdf-web studio pattern 21/21 suites 117/117; registries pattern 31/31 suites 185/192, 7 skipped; full suite 84/84 suites 573/580, 7 skipped, 0 failed)
  - architecture check: PASS (1546 files; baseline 17; 2 resolved since baseline)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB)
  - checklist: docs/agent-checklists/TZ-NX-DOCSTUDIO-DATA-PANEL-TO-FEATURES.md
  - commit: 928bd75a
  - status synchronization: PASS (tracker updated)

## Root cause

Last of the 4 Studio Phase 3 leftovers (B6). Blocked by
`studio-data-vitrina.component.ts`'s dependency on the registries
dialog-host factories, resolved by TZ 3 of this same wave.

## Fix

Moved `studio-data-panel.component.ts` + `studio-data-vitrina.component.ts`
(+ 3 specs) into `libs/features/src/lib/doc-studio/ui/`. TZ 3 had already
duplicated the two remaining type dependencies
(`RegistryActionContext`/`MaterialRegistryDialogConfig`) into
`@kppdf/features/registry-forms`, so no new duplication was needed here —
just two self-referential barrel-import fixes
(`StudioShowcaseKind`/`StudioCatalogSelections`,
`StudioDataCategory`/`StudioDataPanelCategoryJump`, both actually defined
in `studio-editor.facade.ts`).

## Files changed

- `studio-data-panel.component.ts` (+spec), `studio-data-vitrina.component.ts` (+2 specs) → `libs/features/src/lib/doc-studio/ui/`
- `ui/index.ts` (+2 exports)
- `studio-editor.page.ts` (import consolidation)
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-DATA-PANEL-TO-FEATURES.md` (new)

## B6→B7 chain — COMPLETE

| Wave | TZ | Commit |
|------|----|--------|
| B6 | DOCSTUDIO-LEFTOVER-UI-TO-FEATURES (investigated, blocked, reverted) | `14c2139a` |
| B7 | FEATURES-TIPTAP-TSCONFIG | `f67ba41b` |
| B7 | DOCSTUDIO-TEXT-PROPS-TO-FEATURES | `21ee1faa` |
| B7 | REGISTRIES-DIALOG-HOSTS-TO-FEATURES | `5bbd000c` |
| B7 | DOCSTUDIO-DATA-PANEL-TO-FEATURES | `928bd75a` |

All 4 originally-parked Studio Phase 3 components now live in
`@kppdf/features/doc-studio`. Only `studio-editor.page.ts`,
`studio.routes.ts`, `studio-dirty.guard.ts`, and the
`studio-editor-*.spec.ts` files remain in the app — the original Phase
1-4 target layout, now fully realized.

## Successor

None named by this wave. STOP per the wave prompt.
