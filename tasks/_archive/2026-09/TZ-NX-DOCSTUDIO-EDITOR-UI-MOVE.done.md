# TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE: Phase 3 — dumb UI → features

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: claude
verification:
  - acceptance criteria: PASS (6/6, with a documented app-retained exception — see below)
  - typecheck: PASS
  - tests: PASS (kppdf-web studio- 840/847, 7 pre-existing skip; features 14/14 suites, 152/152 tests)
  - nx build kppdf-web: PASS (last gate, exit 0)
  - checklist: docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE.md
  - commit: 9f50403d (pushed origin/main)
  - status synchronization: PASS (WAVE-MAP.md + tracker updated)

## Root cause

Dumb/presentational studio UI components still lived under
`apps/kppdf-web/.../pages/studio/` after Phase 2's util move.

## Fix

14 components/dialogs + specs + `.html`/`.css` moved to
`libs/features/src/lib/doc-studio/ui/`, selectors/`data-test` untouched.
New `ui/index.ts` barrel; `doc-studio/index.ts` now exports both
`./util` and `./ui`. All consumer imports updated.

**Four components stayed in app** — found by actually reading their
imports / running the build, not predictable from the TZ text:
- `studio-data-vitrina.component` (+specs): imports real functions
  (`createCatalogRegistryDialogHost`, `createMaterialRegistryDialogHost`)
  from the unrelated `registries` feature — same class of exclusion the
  TZ's own "НЕ ИЗМЕНЯТЬ" already carves out for registries-touching code.
- `studio-data-panel.component` (+spec): renders `<pi-studio-data-vitrina>`
  as a child, inheriting that coupling.
- `studio-text-properties.component` (+spec): renders
  `PiRichTextEditorComponent` (`@kppdf/ui/rich-text`) — see the build-config
  finding below for why this one specifically couldn't move.
- `studio-properties-panel.component`: composes `studio-text-properties` as
  a child. (Its other child, `studio-table-properties`, has no such issue
  and did move.)

**Two Nx build-config gaps**, found only by running `nx build kppdf-web`
(previously untested — Phase 2 only ever pulled a pure string function out
of paper-and-ink, never a whole Angular component):
1. `@nx/js:tsc`'s executor silently defaults `rootDir` to the *project*
   root regardless of the tsconfig's own `rootDir` setting — any moved
   component importing `@kppdf/ui/button`/`dialog`/`select`/`toast`/etc.
   (i.e. nearly all of them) pulled paper-and-ink source across that
   boundary and failed `TS6059`. Fixed via the executor's own `rootDir`
   option in `libs/features/project.json`'s build target (workspace root).
2. The `@tiptap/extensions/placeholder` subpath-type gap (same class as
   Phase 2's spec-only issue) hits the **production** library build here,
   where `isolatedModules` isn't an option. `apps/kppdf-web` avoids it via
   `moduleResolution: "bundler"`; mirroring that in `libs/features` needs
   `module: "preserve"/"es2015"+`, incompatible with this lib's deliberate
   `module: "commonjs"` (Node-consumption target) — reverted that attempt
   rather than touch `module`. `studio-text-properties.component.ts` (the
   only file importing `PiRichTextEditorComponent` itself, not just the
   already-inlined pure helper) staying in app sidesteps this without
   touching shared module settings.

Also: `on-dialog-close-once` duplicated locally (same rationale as Phase
2's `migratePlainTokensToNodes` — ~30 unrelated app-wide consumers of the
original, out of scope to move); `StudioWsLucideIcon`/`StudioWsRailItem`
self-import in `studio-workspace-shell.component.ts` fixed (was importing
back from the barrel it's now itself part of — TS2303 circular alias) by
pointing at the sibling util module directly and dropping the now-redundant
re-export.

## Files changed

- 14 components/dialogs + 8 specs + 3 assets moved to `libs/features/src/lib/doc-studio/ui/`
- `libs/features/src/lib/doc-studio/{index.ts,ui/index.ts,ui/on-dialog-close-once.ts}`
- `libs/features/project.json` (rootDir build option), `tsconfig.lib.json`
- Import updates: `studio-editor.{page,facade}.ts`, `studio-properties-panel.component.ts`,
  `studio-text-properties.component.ts`(+spec), `studio-editor-text-library-insert.spec.ts`,
  `studio-list.page.ts`+`.spec.ts` (import lines only — unrelated bulk-delete
  WIP in those two files left untouched, staged surgically)
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE.md` (new)

## Successor

Phase 4 `TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES` (facade itself → `libs/features/src/lib/doc-studio/`).
