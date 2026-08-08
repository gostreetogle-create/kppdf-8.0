# TZ-SUPPLY-302 — Auto SupplyTasks from order/module BOM

**Outcome:** DONE
**Date:** 2026-08-08
**Wave:** SHOP-NORTH-B #1
**Executor:** Buffy / agent-3e757640b7

## Delivered

- Added `POST /api/supply-tasks/explode` for order and explicit module BOM traversal.
- Recursively expands canonical product/module composition and legacy module materials/product module links.
- Aggregates material quantities and creates draft SupplyTasks, deduped by order/material.
- Added open-task unique index and duplicate-key handling for concurrent requests.
- Added `/supply` order selector and «Создать из заказа» action with reload/toast feedback.
- Added backend and frontend service coverage for explode and repeat idempotency.

## Gates

- BE tsc: PASS
- FE tsc: PASS
- BE supply tests: PASS (7/7)
- FE supply service tests: PASS (3/3)
- Targeted ESLint: PASS
- `git diff --check`: PASS

## Scope guard

- Desktop/TZD untouched; pre-existing `desktop/mcp-runtime/` remains untracked and excluded.
- Pre-existing unrelated frontend changes were not staged.
- No deploy performed.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T11:00:00Z
closed_by: agent-3e757640b7
cursor_verdict: PASS (code review: no remaining blocking issue after fixes)
