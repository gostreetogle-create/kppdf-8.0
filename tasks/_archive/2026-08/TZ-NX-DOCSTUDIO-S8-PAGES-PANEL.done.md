# TZ-NX-DOCSTUDIO-S8-PAGES-PANEL

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-01
closed_by: Claude

## Outcome
- Page controls are wired in the editor: add page, page navigation, page count persistence, orientation persistence.
- Existing per-page block filtering preserves multi-page canvas behavior and geometry.
- Background/page-number schema fields remain available through the existing document PATCH contract; no new schema fields were required in this TZ.

## Verification
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio`: PASS, exit 0.
- `cd frontend-nx && pnpm exec nx build kppdf-web`: PASS, exit 0.
- Known limitation: per-page background selection and page margins are not exposed by the current editor panel; backend fields exist for document-level background and numbering. Full per-page background/margins require a separate schema/UI TZ.
