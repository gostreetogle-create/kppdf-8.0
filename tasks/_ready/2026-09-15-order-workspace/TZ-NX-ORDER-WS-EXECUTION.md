# TZ-NX-ORDER-WS-EXECUTION: снабжение + производство

> **SIZE:** S · Depends: COMPOSITION archived  
> **CONFLICT KEYS:** `order-workspace/ui/order-ws-execution*`; facade; order-detail page

**IMPLICIT CONFLICT:** `nx build kppdf-web`

## ЧТО ДЕЛАТЬ

1. Секция «Исполнение» 2 колонки (xl) / 1 col mobile — как hub:
   - **Снабжение:** counters из `PiSupplyRequestsService.list({orderId})`; empty/error honest; CTA «Подтвердить материалы» → **reuse** `KitReserveConfirmDialog` из order-hub; link `/supply?orderId=`
   - **Дефицит:** показать short-list **только** если kit-availability/supply даёт short; иначе не рисовать зелёный «всё ОК» и не fake 2 дефицита
   - **Производство:** plannedDate / краткая готовность X/Y; link `/production?orderId=`; без mini progress bars участков
2. Facade load supply on page init (or section visible) — stale-safe как hub.
3. Specs counters + kit button opens dialog path.

## НЕ
- Mini kanban boardLanes / % bars
- Excel supply OPS
- Fake audit

## AC
Счётчики живые; kit-reserve работает; deep-links верные (`_id` orderId); build LAST PASS.
