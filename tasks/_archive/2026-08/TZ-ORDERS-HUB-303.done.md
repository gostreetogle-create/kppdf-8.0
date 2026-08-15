# TZ-ORDERS-HUB-303 DONE — supply + production?orderId= + documents expand

```
ARCHIVE_MARKER
task: TZ-ORDERS-HUB-303
outcome: DONE
closed_at: 2026-08-15T11:40:00Z
closed_by: Buffy (Cursor Product Executor)
workspace: D:\kppdf-8.0
implementation_sha: 9eed2860ddadbc4b1daf8d8176dd7345784f3faf
docs_sha: 00603a36d5650ff3800b9c8f63b31d1a19f744ac
closeout_sha: pending
verification:
  - acceptance criteria: PASS
  - quality score: 98
  - FE tsc: PASS
  - Jest orders|supply|production-cockpit: 17/17 PASS
  - checklist: DONE
  - active marker: removed after archive
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/pages/orders/orders.page.ts
  - frontend/src/app/pages/orders/orders.page.spec.ts
  - frontend/src/app/pages/supply/supply.page.ts
  - frontend/src/app/pages/supply/supply.page.spec.ts
  - frontend/src/app/pages/production/production-cockpit.page.ts
  - frontend/src/app/pages/production/production-cockpit.page.spec.ts
  - docs/pages/orders.page.md
  - docs/pages/supply.page.md
  - docs/pages/production-cockpit.page.md
  - docs/pages/PAGE-TZ-INDEX.md
  - docs/agent-checklists/TZ-ORDERS-HUB-303.md
  - tasks/TZ-ORDERS-HUB-303-supply-production-docs.md
```

## Delivered

- Orders expand: lazy `GET /api/supply-tasks?orderId=` with draft/confirmed/ordered/received + total; empty/error isolation; stale ignore.
- Expand blocks Производство («Оценка в цехе») + Документы (templates deep-link) — 0 HTTP.
- `/supply?orderId=` API filter + chip «Фильтр: заказ …» + clear.
- `/production?orderId=` → `ctx.selectOrder`; unknown id → RU hint + all-active fallback.
- Specs: orders HUB-303 + supply.page.spec + production-cockpit.page.spec; page docs + PAGE-TZ-INDEX.

## НЕ

- HUB-304 readiness/warehouse/shipping
- Backend / ActualCost / deploy / wipe
- Foreign UX-321 / layout / products / AUTH WIP

---

Spec: `tasks/TZ-ORDERS-HUB-303-supply-production-docs.md`
Checklist: `docs/agent-checklists/TZ-ORDERS-HUB-303.md`
Lock: `.mimocode/locks/TZ-ORDERS-HUB-303-supply-production-docs.lock`
