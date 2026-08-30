# TZ-BACKEND-PDF-FONT-READY

Status: CLAIMED / IN PROGRESS
Source: `tasks/_backlog/doc-studio/TZ-BACKEND-PDF-FONT-READY.md`
Conflict keys: `backend/src/modules/generated-document/quotation-output.service.ts`; `backend/src/modules/document-render/**` (font-display only); `docs/pages/document-studio.page.md`

Acceptance:
- PDF waits for `document.fonts.ready` with bounded timeout and warning.
- Print font-face uses `font-display: block`.
- Regression test proves PDF is not called before font readiness.
- Live PDF evidence contains a whitelisted embedded font.

ARCHIVE_MARKER: ACTIVE
