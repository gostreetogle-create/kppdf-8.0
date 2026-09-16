# TZ-NX-ORDER-WS-LOGISTICS: склад + отгрузка

> **SIZE:** S · Depends: EXECUTION archived  
> **CONFLICT KEYS:** `order-workspace/ui/order-ws-logistics*`; facade; order-detail page

**IMPLICIT CONFLICT:** `nx build kppdf-web`

## ЧТО ДЕЛАТЬ

1. Секция «Логистика»:
   - **Склад:** reservation counters (`order.number`); link `/storage-items` (или действующий warehouse route); **без ячеек**
   - **Отгрузка:** summary active shipment; «Отгружено» → reuse `ShipConfirmDialog`; «Отменить отгрузку» gate как hub; link `/shipping?orderId=`
   - Badge/hint: «Отгрузка целым заказом»
2. Facade: reuse ship/cancel services already used in OrderHubFacade (shared helpers OK, no second write-path).
3. Specs ship/cancel/disabled states.

## НЕ
- TTN/driver fake meta если API не возвращает — только реальные поля shipment
- Per-line ship

## AC
Ship/cancel с карточки = тот же API что tray; counters честные; build LAST PASS.
