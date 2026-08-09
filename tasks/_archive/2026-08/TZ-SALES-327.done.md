# TZ-SALES-327 — PiShowcaseCard md equal-height + photo

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09
closed_by: Buffy / agent-6c3d05b80e

## Result

- Hardened the existing `PiShowcaseCard` md showcase contract without creating a second card system.
- md cards are stretchable flex columns with deterministic two-line title/description clamps and footer actions anchored at the bottom.
- md media keeps 16:9 geometry with explicit `object-fit: cover`; empty media retains a neutral placeholder box.
- Reused/documented the existing `photoListUrl` thumb/list photo pipeline; Create КП wiring remains scoped to TZ-SALES-328.
- Proposal rail/create page, 326, 328, 322/320, Builder/DOC-344, and deploy were untouched.

## Verification

- Acceptance criteria: PASS
- Frontend typecheck: PASS
- Focused PiShowcaseCard tests: PASS, 11/11
- Visual review: optional for this TZ; no blocker
- Canonical landing: pending scoped commit/push
