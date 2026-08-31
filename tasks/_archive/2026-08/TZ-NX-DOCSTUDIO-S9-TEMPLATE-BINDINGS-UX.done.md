# TZ-NX-DOCSTUDIO-S9-TEMPLATE-BINDINGS-UX

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-01
closed_by: Claude

## Outcome
- Double-clicking an unlocked text block opens the Properties section.
- Single click remains selection-only.
- Preview and locked blocks remain non-editable.

## Verification
- `nx test kppdf-web --testPathPattern=studio`: PASS.
- `nx build kppdf-web`: PASS.
