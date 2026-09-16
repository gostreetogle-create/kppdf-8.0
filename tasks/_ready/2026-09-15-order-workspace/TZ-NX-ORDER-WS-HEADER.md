# TZ-NX-ORDER-WS-HEADER: шапка workspace

> **SIZE:** S · Depends: FACADE-SHELL archived  
> **CONFLICT KEYS:** `order-workspace/ui/order-ws-header*`; `order-detail.page.ts`; facade; `orders.page.md`

**IMPLICIT CONFLICT:** `nx build kppdf-web` · **LAYER:** 3

## ЧТО ДЕЛАТЬ

1. Dumb `OrderWsHeaderComponent` в features: номер, `PiStatusBanner`/status label, даты, isPaid checkbox, grid Заказчик / Объект / Наша фирма / КП.
2. Links: counterparty → живой route; КП → `/studio?quotationId=` или текст «Без КП» (без stub-create).
3. CTA (только живые):
   - `draft` → «Подтвердить заказ» → PATCH `status:'confirmed'` (+ confirm dialog)
   - «Отменить заказ» → существующий soft-delete **или** status cancelled — **только** если API уже есть; иначе omit + note в known_limitation
   - «← К списку» `/orders`, «На Главную» `/home`
4. Primary actions ≤3 visible; destructive confirm.
5. Wire page slot; facade methods; specs.

## НЕ
- Free dropdown всех lifecycle статусов
- Save toast без PATCH
- Composition/lines

## AC
Header заполнен из Order populate; paid не regress; confirm draft→confirmed работает; build LAST PASS.
