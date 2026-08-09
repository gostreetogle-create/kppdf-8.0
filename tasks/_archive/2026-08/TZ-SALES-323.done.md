# TZ-SALES-323 — Create КП A4 fit без scrollbar

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T12:07:23Z
closed_by: Buffy / agent-6c3d05b80e

## Result

- FE preview keeps the intrinsic A4 iframe and uses proportional contain scaling with a small safety inset and ResizeObserver.
- Build HTML emits bounded portrait/landscape A4 page boxes with hidden document overflow, avoiding the body-padding/doc-content min-height overflow conflict.
- PO visual PASS confirmed the canonical `main` Create КП sheet has no horizontal or vertical scrollbar; measured document dimensions stayed within client dimensions (+1px tolerance).

## Verification

- Backend typecheck: PASS
- Document build e2e: PASS, 8/8
- Frontend typecheck: PASS
- Proposal-create tests: PASS, 9/9
- Canonical code commit: `a270fa09`
- Scope exclusions preserved: 324/325, 322/320, Builder/DOC-344, deploy
