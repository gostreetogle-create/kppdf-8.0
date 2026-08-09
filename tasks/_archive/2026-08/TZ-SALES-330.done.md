# TZ-SALES-330 — Create КП table layout instance

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T15:01:58Z

## Implementation

- Full implementation commit: `8c5662fe5783631c5b352d5a5e8bad8547a5dd59`
- `kpTableLayout` is request-only, copy-on-write session state.
- Create КП «Таблица» panel supports reorder and show/hide.
- Build applies order/visibility only to the designated live line-items table.
- `index` maps to 1-based row numbering; snapshots and shared TableTemplate are unchanged.

## Gates

- Backend tsc: PASS
- document-templates-build e2e: PASS 10/10
- Frontend tsc: PASS
- proposal-create Jest: PASS 12/12
- diff-check: PASS
- Frontend Prettier: PASS

## Visual

- Cursor/PO visual PASS received: panel is understandable, A4 preview reflects layout changes, and the frozen rails/center/A4 geometry remains intact without regression.

## Scope

- Foreign DOC-343 / dirty `document-template.service.ts` orientation WIP excluded.
- No discount column, quotation persistence, 317 shell rewrite, 320/322, or deploy.
