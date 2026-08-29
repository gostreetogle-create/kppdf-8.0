# TZ-DOC-STUDIO-1601: ERP live table rows + hybrid draft data — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
agent_id: gemini-executor

## Delivered

- `StudioDataResolverService` — live-read `quotation-items` / `order-items` for draft docs (org-scoped)
- Preview/PDF inject table HTML from resolved `dataSets`
- `finalize` → `bakeSnapshot()` → `status: frozen` → archive → `status: final`
- FE data rail: quotation + order pickers; table panel ERP live indicator + link buttons
- Preview refresh on context change

## Gates

- backend tsc PASS
- `pnpm test studio-document` — 36 passed
- frontend tsc PASS

## Files

- `backend/src/modules/studio-document/studio-data-resolver.ts` (+ spec)
- `backend/src/modules/studio-document/studio-output.service.ts` (+ spec)
- `backend/src/modules/studio-document/studio-document.module.ts`
- `frontend/src/app/pages/doc-constructor/studio/document-studio-editor.page.ts`
