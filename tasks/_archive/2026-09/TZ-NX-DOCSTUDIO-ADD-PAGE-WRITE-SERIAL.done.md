# TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL: «+ Страница» снова пишет страницу

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-13
closed_by: claude
verification:
  - acceptance criteria: PASS (4/4)
  - typecheck: PASS
  - tests: PASS (FE 124 suites/856+7skip/863 tests, incl. new studio-editor-write-serial.spec.ts)
  - lint: PASS (0 errors, scoped files)
  - architecture:check: PASS
  - nx build kppdf-web: PASS (last gate)
  - live browser evidence: PASS (Playwright, real backend — 3x add-page → 3x 200, strictly increasing revision/manualPageCount)
  - checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL.md` + evidence/
  - status synchronization: PASS (WAVE-2026-09-13-STUDIO-OPS.md updated)

## Root cause

`addPage`/orientation/background/page-numbering toggles fired `documents.update`
directly, outside the existing `catalogWriteChain` queue — which itself never
covered the on-load hydrate path either (`refreshLiveDataSetsOnLoad` called
`hydrateTablesSerially` directly). Two writes racing the same stale revision
409'd one of them; a repeated conflict while the dialog was already open was a
silent no-op. Separately, 4 block-create/layout-save call sites blindly
incremented the local revision after endpoints that never return the document.

## Fix

1. All 5 ACCEPT-minimum document mutations now queue onto `catalogWriteChain`.
2. `refreshLiveDataSetsOnLoad` now synchronously joins that same queue (the gap
   that made the "minimum 5" alone insufficient — caught by a failing test).
3. The 4 blind `revision + 1` sites now confirm via a follow-up `getById`.
4. `conflict()` toasts once on a repeat conflict instead of silently no-op'ing.

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-write-serial.spec.ts` (new)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-catalog-insert.spec.ts` (fixture fix)
- `docs/pages/document-studio.page.md` (short addendum)
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL.md` + `evidence/TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL.txt` (new)
