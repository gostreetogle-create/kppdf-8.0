# TZ-NX-DOCSTUDIO-S30-SAVE-HONEST

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: claude
verification:
  - acceptance criteria: PASS (code review — see checklist Acceptance section)
  - build: PASS (cd frontend-nx && pnpm exec nx build kppdf-web, exit 0)
  - lint: pre-existing baseline failures unrelated to changed lines (see checklist Gates)
  - tests: N/A — no unit-test harness exists for studio-editor.page.ts (heavy DI surface); AC verified by code reading per TZ п.4 fallback
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-S30-SAVE-HONEST.md)
  - progress.md: NOT UPDATED (root progress.md is a redirect-only stub; tracked via checklist + _archive)
  - status synchronization: CHECKLIST UPDATED

`studio-editor.page.ts`: `saveDocument()` was a fake success toast with no write. Now `async`: sets `saving` signal, `await flushLayouts()` (layout PATCH, only if dirty), bails without a success toast if that reports a revision conflict (existing `conflict()` dialog already surfaced by `saveLayouts`); if `isKpDoc() && quotationId()`, `await syncKpQuotationItems()` (existing private helper, now returns `Promise<boolean>` and shows `toast.error` on failure instead of silently swallowing it) and bails without success on failure; shows `toast.success('Сохранено')` only when both steps succeeded. New `readonly saving` signal disables `data-test="studio-save"` for the duration (same pattern as `templateSaving` on save-as). `flushLayouts`/`saveLayouts` return type changed `Promise<void>` → `Promise<boolean>` so callers can observe the conflict instead of it being silently swallowed; other existing callers (`onDownloadPdf`, `onFinalize`, `enterPreviewMode`, `onLayoutCommit`) keep ignoring the resolved value, unchanged behavior, not in TZ scope. Only `studio-editor.page.ts` changed (sole CONFLICT KEY needed).
