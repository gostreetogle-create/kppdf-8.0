# TZ-SALES-329 — Deals → Create КП default landing

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T12:13:28Z
closed_by: Buffy / agent-6c3d05b80e

## Result

- The Deals top-nav entry now opens `/proposals/create` by default.
- The dark TOC «КП» chip follows `/proposals/create`.
- The yellow «Все КП» action remains `/proposals`; `/proposals` remains an active Deals alias so list navigation does not lose the active category.
- Create/list page docs record the landing behavior.

## Verification

- Frontend typecheck: PASS
- Focused deals-group-chips tests: PASS, 2/2
- `git diff --check`: PASS
- Scope exclusions preserved: 325, 326/328 product work, 322/320, DOC-344, deploy
