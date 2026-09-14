# TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES: Phase 4 — facade → features

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: claude
verification:
  - acceptance criteria: PASS (7/7)
  - typecheck: PASS
  - tests: PASS (kppdf-web studio-editor suite 117/117 suites, 840/847 tests, 7 pre-existing skip; features 14/14 suites, 152/152 tests)
  - nx build kppdf-web: PASS (last gate, exit 0)
  - rg "from '.*apps/kppdf-web" libs/features/src/lib/doc-studio: 0 hits
  - checklist: docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES.md
  - commit: e0b64de5 (pushed origin/main)
  - status synchronization: PASS (WAVE-MAP.md all 1-4 DONE, tracker all rows DONE, _NOW.md updated)

## Root cause

`studio-editor.facade.ts` (the domain brain Phase 1 extracted) still lived
under `apps/kppdf-web/.../pages/studio/`, the last piece of the editor not
yet under `@kppdf/features/doc-studio`.

## Fix

Moved the facade file to `libs/features/src/lib/doc-studio/`, exported from
the barrel, page keeps providing it via `providers: [StudioEditorFacade]`.

Per the TZ's own ШАГ2, split the two shared-registry-dialog flows
(`TableTemplateFormDialogComponent`, `TextBlockFormDialogComponent` — both
app-only, under `app/doc-studio/dialogs/`) into a facade-side prefill
builder + result-applier, with the actual `PiDialogService.open(...)` call
moved to two new page methods — zero change to the underlying prefill/save
logic, only where the dialog-open call lives.

Two things beyond the TZ's text, found only by reading the facade's full
import list / running the build:
- The facade also imported 4 plain types from `studio-data-panel`/
  `studio-data-vitrina` — the two components Phase 3 had to leave in-app
  for their own unrelated coupling. Relocated the type definitions into the
  facade itself; those app-resident components now import them back from
  `@kppdf/features/doc-studio` (same `StudioWsRailItem`-style pattern as
  Phase 2/3).
- Once the facade lived inside `libs/features/doc-studio` itself, its own
  re-exports pointing at the `@kppdf/features/doc-studio` package alias
  became a circular self-import (`TS2303`) — switched to relative `./ui` /
  `./util` imports.

## Files changed

- `libs/features/src/lib/doc-studio/studio-editor.facade.ts` (moved)
- `libs/features/src/lib/doc-studio/index.ts`
- `apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`
- `apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.ts`, `studio-data-vitrina.component.ts`
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES.md` (new)

## Wave status

**WAVE-DOCSTUDIO-EDITOR-DECOMP is complete — Phases 1-4 all DONE:**

| # | TASK-ID | commit |
|---|---------|--------|
| 1 | TZ-NX-DOCSTUDIO-EDITOR-FACADE | 142d66e4 |
| 2 | TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE | b4169eec |
| 3 | TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE | 9f50403d |
| 4 | TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES | e0b64de5 |

Phase 5 (canvas/table-properties split) stays PARK — not started, per WAVE-MAP;
only starts on explicit PO command.
