# TZ-NX-DOCSTUDIO-S8-LIST-TEMPLATES

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-01
closed_by: Claude

## Outcome
- Added `PiDocumentTemplatesService` for `GET /document-templates`.
- Added a document-template picker dialog and `POST /studio-documents/from-template` flow.
- Added duplicate action using the existing studio-document endpoint.
- Added list action test selectors.

## Verification
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio`: PASS, exit 0.
- `cd frontend-nx && pnpm exec nx build kppdf-web`: PASS, exit 0.
- Known existing Angular/JSDOM warnings do not fail the gates.
