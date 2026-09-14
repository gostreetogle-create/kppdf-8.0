# TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE: Phase 2 — pure utils → features

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: claude
verification:
  - acceptance criteria: PASS (5/5)
  - typecheck: PASS
  - tests: PASS (kppdf-web studio- 123/123 suites, 900/907; features 8/8 suites, 92/92)
  - nx build kppdf-web: PASS (last gate, exit 0)
  - checklist: docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE.md
  - commit: b4169eec (pushed origin/main)
  - status synchronization: PASS (WAVE-MAP.md + tracker updated)

## Root cause

8 pure helper files still lived under `apps/kppdf-web/.../pages/studio/`
after Phase 1's facade extraction; the wave's target layout puts framework-
agnostic helpers under `libs/features/src/lib/doc-studio/util/`.

## Fix

`git mv` all 8 files + their specs, zero logic change. New
`@kppdf/features/doc-studio` secondary tsconfig path (mirrors
`@kppdf/data-access/auth`), two-level barrel. Updated every consumer import.

Two adaptations forced by the app→lib move direction (found by running the
specs/build, not predictable from the TZ text alone):
- `StudioWsRailItem`/`StudioWsLucideIcon` relocated into the moved
  `studio-workspace-chrome.ts` (their only sensible owner now — a lib
  can't import a type from an app file); `studio-workspace-shell.component.ts`
  imports both back from `@kppdf/features/doc-studio`.
- `migratePlainTokensToNodes` inlined into `studio-block-helpers.ts` instead
  of importing it from `@kppdf/ui/rich-text` — that import transitively
  pulled in an Angular component (`pi-rich-text-editor.component.ts`) that
  `libs/features`'s plain `@nx/js:tsc` build can't compile (rootDir
  violation + an unresolvable `@tiptap/extensions/placeholder` subpath
  type). The function itself is pure string manipulation with no
  Angular/TipTap dependency; touching paper-and-ink's rich-text barrel to
  fix this "properly" was outside this TZ's conflict keys.

Also added `isolatedModules: true` to `libs/features/tsconfig.spec.json`
(matching `apps/kppdf-web/tsconfig.json`'s existing setting) — without it,
Jest's ts-jest transform full-type-checks moved specs and surfaces two
pre-existing, previously-silent gaps (a test fixture's `sampleRows` literal
not matching its own declared type; the same tiptap subpath gap) that were
never caught before because kppdf-web's spec compilation has always been
transpile-only.

## Files changed

- 8 util files + 6 specs: moved to `libs/features/src/lib/doc-studio/util/`
- `libs/features/src/lib/doc-studio/{index.ts,util/index.ts}` (new barrels)
- `libs/features/tsconfig.spec.json`, `frontend-nx/tsconfig.base.json`
- Import updates across `studio-editor.facade.ts`, `.page.ts`,
  `studio-blocks-canvas.component.ts`, `studio-table-properties.component.ts`,
  `studio-properties-panel.component.ts`, `studio-workspace-shell.component.ts`,
  `proposals-list.page.ts`, `studio-templates-list.page.ts`,
  `studio-list.page.ts` (import line only — a pre-existing, unrelated
  bulk-delete feature's WIP in that same file was left untouched, staged
  surgically via a hand-built git blob so only this one line landed in the
  commit)
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE.md` (new)

## Successor

Phase 3 `TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE` (dumb UI components → `libs/features/src/lib/doc-studio/ui/`).
