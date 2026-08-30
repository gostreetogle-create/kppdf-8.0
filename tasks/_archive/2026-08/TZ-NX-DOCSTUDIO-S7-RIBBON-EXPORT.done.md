# TZ-NX-DOCSTUDIO-S7-RIBBON-EXPORT - DONE

**agent_id:** freebuff-s7-ribbon-export  
**claimed_at:** 2026-08-30T19:45:00Z  
**completed_at:** 2026-08-30T22:58:00+03:00

## Outcome

- Ribbon PDF: `onDownloadPdf` via `PiStudioDocumentsService.downloadPdf` + `consumePdfBlob` (empty/non-PDF blob guard, anchor append for save, error toast).
- Finalize: draft-only confirm, `studio-finalize` disabled when not draft or while `finalizing()`, document refresh + toast on success.
- Preview: `refreshPreviewIfActive()` after layout/block/context/document mutations; editor|preview switch still calls `fetchPreview()`.
- Ribbon: PDF only disabled while `pdfLoading()` (not blocked on draft with blocks).

## Gates (exit 0)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` -> 0
- `cd frontend-nx && pnpm nx test kppdf-web --testPathPattern=studio` -> 0 (54 suites; nx cache)
- `cd frontend-nx && pnpm nx build kppdf-web` -> 0 (warnings only)

## Live smoke

- **SKIP** — `POST /api/auth/login` with `admin@kppdf.local` / `admin123` returned 401 on localhost:4201 proxy (credentials/env mismatch). FE returned 200.

## Files

- frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts

## S7-6 blockers (PASSPORT-BG)

- Needs image layer `settings.overlay` / letterhead index parity with legacy doc-studio wave 17.
- Canvas stacking: doc-bg under blocks; full-page image must not break drag on foreground layers.
- Preview/PDF must match z-index stacking (may touch backend render).
- **PARK:** `TZ-NX-DOCSTUDIO-S7-DOCTYPE-PICKER` (docTypeId guard on save-as-template).
- Conflict keys overlap: `studio-editor.page.ts`, `studio-blocks-canvas.component.ts`.