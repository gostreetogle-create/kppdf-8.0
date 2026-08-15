# Reservations read contract (ORDERS-HUB-304)

> Docs-only prep. FE `pi-reservations.service` создаёт executor в HUB-304.
> **Не** трогать `orders.page.ts` пока peer на HUB-302.

## SoT

```http
GET /api/reservations?orderId=<Order.number>
```

- Query value = **бизнес-номер** заказа (`Order.number`), не Mongo `_id`.
- Писатель: `order.service` при reserve → `orderId: order.number`.
- **Запрещено** строить сводку hub из `Order.reservationIds[]`.

## Minimal FE type (для HUB-304)

```ts
export type ReservationStatus = 'active' | 'released' | 'fulfilled' | 'cancelled';

export interface Reservation {
  _id: string;
  orderId: string; // Order.number
  productId: string;
  warehouseId: string;
  qty: number;
  status: ReservationStatus;
  isActive?: boolean;
}
```

Service: `list(orderNumber?: string) → SilentResult<Reservation[]>`.

## Hub UI

- `activeCount = filter(status==='active').length`
- `total = list.length`
- Empty / error isolation в блоке; 0 write methods in panel.
