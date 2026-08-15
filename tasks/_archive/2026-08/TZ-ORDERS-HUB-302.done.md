# TZ-ORDERS-HUB-302 DONE — orders expand columns + Deal/Composition

```
ARCHIVE_MARKER
task: TZ-ORDERS-HUB-302
outcome: DONE
closed_at: 2026-08-15T11:30:00Z
closed_by: Buffy (Cursor Product Executor; FreeBuffy unavailable)
workspace: D:\kppdf-8.0
implementation_sha: 71446d6bfb37434913450449678ce4b78e26be37
closeout_sha: f8b96d4e9b386802c42b002b60edfb619ce709d6
verification:
  - acceptance criteria: PASS
  - quality score: 98
  - Cursor functional PASS: 98/100
  - OrdersPage Jest: 11/11 PASS
  - checklist: DONE
  - active marker: removed after archive
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/pages/orders/orders.page.ts
  - frontend/src/app/pages/orders/orders.page.spec.ts
  - frontend/src/app/pages/orders/order-detail.page.ts
  - frontend/src/app/pages/orders/orders.service.ts
  - docs/pages/orders.page.md
  - docs/pages/PAGE-TZ-INDEX.md
  - docs/agent-checklists/TZ-ORDERS-HUB-302.md
  - tasks/TZ-ORDERS-HUB-302-orders-expand-columns.md
```

## Delivered

- Orders list columns without commercial `total`; readiness `X из Y`.
- Read-only expand: Сделка + Состав (products/UX-319 chrome).
- stopPropagation on row links; keyboard via pi-table; `/proposals` fix on detail.
- Specs + page docs.

## НЕ

- Supply / production / warehouse / shipping expand blocks (HUB-303/304)
- Backend / ActualCost / deploy / wipe
- Foreign CATALOG / AUTH / layout WIP

---

Spec: `tasks/TZ-ORDERS-HUB-302-orders-expand-columns.md`
Checklist: `docs/agent-checklists/TZ-ORDERS-HUB-302.md`
