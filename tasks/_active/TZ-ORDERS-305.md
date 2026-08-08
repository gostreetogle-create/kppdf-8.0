# TZ-ORDERS-305 — Soft materials gate

STATUS: CLAIMED / IN PROGRESS
WORKSPACE: D:\kppdf-8.0
BRANCH: main
AGENT: Buffy / agent-3e757640b7
CLAIMED_AT: 2026-08-08T11:25:00Z

CONFLICT KEYS:
- backend/src/modules/order/**
- frontend/src/app/pages/orders/**
- docs/agent-checklists/TZ-ORDERS-305.md

NOT TOUCHING:
- desktop/**, Gantt, inventory reservation, procurement auto-PR
- pre-existing products-page/UX WIP

AC:
- Persist materialsSource own|customer on Order.
- Order detail lets users change it.
- own + any ready line shows a non-blocking Russian warning when confirmed supply is absent.
- customer does not show a false stock warning and never hard-blocks PATCH/start.
- BE+FE tsc and targeted tests pass.

CLOSEOUT: gates → archive/lock → commit+push main → next READY TZ-SALES-302.
