# TZ-NAV-301 — Lifecycle menu + stubs

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (executor self / PO continuous)

## Delivered

- Top nav L→R: Справочники → Каталог → Клиенты → Сделки → Проектирование → Снабжение → Производство → Склад → Документы → Админ
- Moves: Люди → Производство; Организации → Админ («Наши организации»); Сделки entry = `/proposals`
- Reference: dropped duplicate top leaves `/categories` + dictionaries «Оформление»; form-profiles TODO until DICT-315 route
- Stubs: `/counterparties` (thin Counterparty list), `/design`, `/supply`, `/shipping` (RU chrome + «скоро»)
- PAGE_KEYS + admin/director/manager seed merge for new pageKeys
- Jest: `app-layout.nav-order.spec.ts`; PAGE-TZ-INDEX + RBAC catalog row

## НЕ (as scoped)

- Full SUPPLY/SHIPPING/READY backend
- Site CRUD (ORDERS-303)
- orders/**, composition-tree, form-profiles BE, deploy, desktop

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T07:45:00Z
closed_by: cursor-composer-nav301
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsc + backend tsc)
  - tests: PASS (jest app-layout.nav-order)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: cursor-composer-nav301
known_limitation: design/supply/shipping stubs empty; counterparties list best-effort; Sites UI in ORDERS-303
