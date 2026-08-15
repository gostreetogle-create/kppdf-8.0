# TZ-ORDERS-HUB-304 DONE — readiness + warehouse + shipping stub

```
ARCHIVE_MARKER
task: TZ-ORDERS-HUB-304
outcome: DONE
closed_at: 2026-08-15T14:45:00Z
closed_by: Buffy (Cursor Product Executor)
workspace: D:\kppdf-8.0
implementation_sha: cd0cd867554a4b7621dc6b0f5b56fdcb5124bab1
closeout_sha: PENDING
verification:
  - acceptance criteria: PASS
  - quality score: 98
  - FE tsc: PASS
  - Jest orders.page|pi-reservations: 19/19 PASS
  - checklist: DONE
  - active marker: removed after archive
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/pages/orders/orders.page.ts
  - frontend/src/app/pages/orders/orders.page.spec.ts
  - frontend/src/app/shared/services/pi-reservations.service.ts
  - frontend/src/app/shared/services/pi-reservations.service.spec.ts
  - docs/pages/orders.page.md
  - docs/pages/shipping.page.md
  - docs/pages/PAGE-TZ-INDEX.md
  - docs/agent-checklists/TZ-ORDERS-HUB-304.md
  - tasks/TZ-ORDERS-HUB-304-readiness-warehouse-shipping.md
```

## Delivered

- Orders expand «Готовность»: X/Y + line ready flags; link `/orders/:id`; no toggle/write.
- Thin read-only `ReservationsService.list(orderNumber?)` → `GET /api/reservations?orderId=<Order.number>`.
- Expand «Склад»: lazy by business number; active/total; empty «Нет броней»; error inline; `/storage-items` link; stale ignore.
- Expand «Отгрузка»: stub copy + `/shipping`; no shipments GET.
- Specs flush supply + reservations on expand; HUB-304 coverage.
- Page docs + PAGE-TZ-INDEX updated.

## НЕ

- HUB-303 supply/production/docs behavior removed or changed beyond additive blocks
- Reservation write/create/confirm/delete/release
- Shipping FE implementation beyond stub link
- Backend / ActualCost / deploy / wipe
- Foreign UX-321 / AUTH / products / layout WIP

---

Spec: `tasks/TZ-ORDERS-HUB-304-readiness-warehouse-shipping.md`
Checklist: `docs/agent-checklists/TZ-ORDERS-HUB-304.md`
Lock: `.mimocode/locks/TZ-ORDERS-HUB-304-readiness-warehouse-shipping.lock`
