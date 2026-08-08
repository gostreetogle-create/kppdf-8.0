# TZ-ORDERS-302 — Order detail composition-tree (live BOM)

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (executor self / PO continuous)

## Delivered

- Route `/orders/:id` → `OrderDetailPage`
- Chrome «Заказ №…» + `app-composition-tree` (reuse, no fork)
- Line roots → live `GET /products/:id/tree`; qty/name from order snapshot
- Empty: «В заказе нет изделий»; 404 → warn on node
- No deal/КП prices in tree (D4)
- List number → link to detail
- Docs: `orders.page.md`, `ui-composition-tree.md`
- Jest: `order-detail.page.spec.ts` + orders.page PASS

## НЕ (as scoped)

- Snapshot BOM immutability, node statuses, Gantt, reserve, PDF
- Second tree / Excel columns
- desktop, dictionaries, form-profiles, deploy

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T07:40:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsc -p tsconfig.app.json --noEmit)
  - tests: PASS (jest order-detail + orders.page 10/10)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: live catalog BOM — catalog edits after order change what shop sees on detail (D1 intentional)
