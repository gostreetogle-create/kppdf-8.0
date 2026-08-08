# TZ-ORDERS-304 — Ready-for-work on order line

**Outcome:** DONE
**Date:** 2026-08-08
**Wave:** SHOP-NORTH-B #2
**Executor:** Buffy / agent-3e757640b7

## Delivered

- Added line fields `readyForWork`, `readyAt`, `readyByUserId`.
- Added validated `PATCH /orders/:id/items/:lineIndex/ready` with role/audit protection.
- Order detail exposes per-line «Отметить готовым» / «Готово к работе» and refreshes persisted state.
- Ordinary order item edits preserve readiness metadata unless explicitly toggled off.

## Gates

- BE tsc: PASS
- FE tsc: PASS
- BE order tests: PASS (14/14)
- FE order tests: PASS (9/9)
- Targeted ESLint: PASS
- `git diff --check`: PASS

## Scope guard

- Desktop/TZD, Gantt, production-cockpit, composition-tree implementation untouched.
- Pre-existing products/docs and desktop/mcp-runtime changes excluded.
- No deploy performed.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T11:20:00Z
closed_by: agent-3e757640b7
cursor_verdict: PASS (code review no blocking issue after metadata/DTO fixes)
