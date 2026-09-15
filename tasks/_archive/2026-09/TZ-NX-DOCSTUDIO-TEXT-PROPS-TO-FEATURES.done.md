# TZ-NX-DOCSTUDIO-TEXT-PROPS-TO-FEATURES

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (text/properties specs green, studio-editor gates green, nx build last 0)
  - typecheck: PASS (features lib + kppdf-web app, both clean on first run)
  - tests: PASS (features 43/43 suites 382/382; kppdf-web studio* pattern 24/24 suites 152/152; full kppdf-web suite 88/88 suites, 610/617 passed, 7 skipped, 0 failed)
  - architecture check: PASS (1545 files; baseline 17; 2 resolved since baseline)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB) — the exact gate that failed during B6's reverted attempt
  - checklist: docs/agent-checklists/TZ-NX-DOCSTUDIO-TEXT-PROPS-TO-FEATURES.md
  - commit: 21ee1faa
  - status synchronization: PASS (tracker updated)

## Root cause

B6 attempted this exact move, passed every local gate, but failed the
real `nx build kppdf-web` (TipTap package-exports resolution). TZ 1 of
this wave fixed `libs/features/tsconfig.json`'s module system to match
the app.

## Fix

Re-moved `studio-text-properties.component.ts` (+spec) and
`studio-properties-panel.component.ts` into
`libs/features/src/lib/doc-studio/ui/`. Same import fixes as the B6
attempt (on-dialog-close-once duplicate, self-referential barrel imports
switched to relative sibling paths). All gates — including the one that
failed before — now pass clean.

## Files changed

- `studio-text-properties.component.ts` (+spec) → `libs/features/src/lib/doc-studio/ui/`
- `studio-properties-panel.component.ts` → `libs/features/src/lib/doc-studio/ui/`
- `libs/features/src/lib/doc-studio/ui/index.ts` (+2 exports)
- `studio-editor.page.ts` (1 import path)
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-TEXT-PROPS-TO-FEATURES.md` (new)

## Successor

`TZ-NX-REGISTRIES-DIALOG-HOSTS-TO-FEATURES` — move the registries
dialog-host factories that still block `studio-data-panel`/
`studio-data-vitrina`.
