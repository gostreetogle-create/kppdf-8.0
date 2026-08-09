# TZ-SALES-326 — Wider products flyout + outside dismiss

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T12:52:45Z
closed_by: Buffy / agent-6c3d05b80e

## Result

- Products flyout is capped at `min(40rem, available studio width)` while template/right panels retain the base width.
- Transparent backdrop captures center and sandboxed iframe clicks and closes both left and right flyouts.
- Rails remain above the backdrop, flyouts remain interactive, CDK overlays are excluded, and Escape remains supported.
- `closeFlyouts()` is `protected`, fixing the Angular template compile error.
- Cursor visual PASS confirmed 40rem width, L+R close on backdrop/center, and unchanged rails|center|rails A4 geometry.

## Verification

- Frontend typecheck: PASS
- Frontend build: PASS; existing Angular budget warnings only
- Proposal-create tests: PASS, 11/11
- `git diff --check`: PASS
- Implementation: `f816f2e0` + compile fix `adee07b8`
- Scope exclusions preserved: 325, 328, DOC-344, 322/320, deploy
