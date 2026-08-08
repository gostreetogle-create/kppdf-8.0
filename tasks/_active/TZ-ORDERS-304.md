# TZ-ORDERS-304 — Ready-for-work on order line

STATUS: CLAIMED / IN PROGRESS
WORKSPACE: D:\kppdf-8.0
BRANCH: main
AGENT: Buffy / agent-3e757640b7
CLAIMED_AT: 2026-08-08T11:05:00Z

CONFLICT KEYS:
- backend/src/modules/order/**
- frontend/src/app/pages/orders/**
- docs/agent-checklists/TZ-ORDERS-304.md

NOT TOUCHING:
- desktop/** (including desktop/mcp-runtime WIP)
- Gantt / production-cockpit / composition-tree implementation
- unrelated products-page WIP and other worktrees

AC:
- Persist readyForWork/readyAt/readyByUserId on order lines.
- PATCH line readiness independently of whole order.
- Order detail shows and toggles readiness; F5 reads persisted state.
- BE+FE tsc and targeted tests pass.

CLOSEOUT: gates → review → archive/lock → commit+push main → next READY TZ-ORDERS-305.
