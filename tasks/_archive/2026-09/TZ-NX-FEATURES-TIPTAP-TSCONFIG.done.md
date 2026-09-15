# TZ-NX-FEATURES-TIPTAP-TSCONFIG

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (probe-verified tiptap import compiles; nx test features green; nx build last 0)
  - typecheck: PASS (features lib + kppdf-web app, both clean)
  - tests: PASS (features 42/42 suites 377/377; kppdf-web full suite 89/89 suites, 615/622 passed, 7 skipped, 0 failed — both unchanged)
  - architecture check: PASS (1545 files; baseline 17; 2 resolved since baseline)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB)
  - checklist: docs/agent-checklists/TZ-NX-FEATURES-TIPTAP-TSCONFIG.md
  - commit: f67ba41b
  - status synchronization: PASS (tracker updated)

## Root cause

B6 found that moving `studio-text-properties.component.ts` into
`libs/features` broke the real `nx build kppdf-web` with a `TS2307`:
`@kppdf/ui/rich-text`'s TipTap dependency
(`@tiptap/extensions/placeholder`) needs `moduleResolution: "bundler"`
to resolve its package-exports subpath, which `libs/features/tsconfig.json`
didn't have. Adding just `moduleResolution` alone failed with `TS5095`
(requires `module` to be `"preserve"` or ES2015+; the lib had `"commonjs"`).

## Fix

Changed `libs/features/tsconfig.json`: `module: "commonjs"` →
`"preserve"`, added `moduleResolution: "bundler"` — the exact override
`apps/kppdf-web/tsconfig.json` already uses. Verified jest is unaffected
(`tsconfig.spec.json` independently pins its own `commonjs`/`node10`,
same as the app). Verified the fix directly with a throwaway probe file
importing `PiRichTextEditorComponent`, not just assumed.

## Files changed

- `libs/features/tsconfig.json`
- `docs/agent-checklists/TZ-NX-FEATURES-TIPTAP-TSCONFIG.md` (new)

## Successor

`TZ-NX-DOCSTUDIO-TEXT-PROPS-TO-FEATURES` — retry moving
`studio-text-properties`/`studio-properties-panel` now that the build
blocker is fixed.
