# TZ-ORDERS-305 — Soft materials gate

**Outcome:** DONE
**Date:** 2026-08-08
**Wave:** SHOP-NORTH-B #3
**Executor:** Buffy / agent-3e757640b7

## Delivered

- Added persisted Order `materialsSource: own|customer` with default `own`.
- Order detail source selector saves through existing PATCH without hard-blocking lifecycle.
- Added best-effort confirmed supply lookup and a non-blocking Russian warning for own materials + ready lines.
- Customer-sourced materials suppress the stock warning.

## Gates

- BE tsc: PASS
- FE tsc: PASS
- BE order tests: PASS (15/15)
- FE order tests: PASS (9/9)
- Targeted ESLint: PASS
- `git diff --check`: PASS

## Scope guard

- Inventory, procurement, Gantt, desktop/TZD, and products-page WIP excluded.
- No deploy performed.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T11:35:00Z
closed_by: agent-3e757640b7
cursor_verdict: PASS (warning scope and soft behavior reviewed)
