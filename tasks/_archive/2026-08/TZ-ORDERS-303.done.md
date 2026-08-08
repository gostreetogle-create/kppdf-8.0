# TZ-ORDERS-303 — Order party + site + line owner

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (executor self / PO continuous)

## Delivered

- **Site** module: schema/API CRUD; list by counterpartyId
- Order.siteId required; validate site∈counterparty
- OrderItem.ownerUserId + plannedShipDate
- POST /counterparties/quick (name+phone+address → CP+Site)
- convertToOrder + contract.activate → ensureDefault site
- FE: form site + quick-create + line owner/shipDate; detail meta
- Tests: site/order/quotation/counterparty unit; FE site+orders

## НЕ

- Supply/Gantt/KP versions; deploy; desktop; DICT WIP

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T08:00:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (BE+FE tsc)
  - tests: PASS (BE 36 unit zone; FE 12)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: D15 role capability checkboxes — ACCESS later; quick INN is stub checksum
