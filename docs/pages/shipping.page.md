# Страница: Отгрузка (`ShippingPage`) — stub

**Краткое описание:** заглушка «Частичные отгрузки» с привязкой к заказу.
**Статус: STUB (TZ-NAV-301), не READY-продукт.** Полный SHIPPING — отдельная TZ
(later). API **не** инвентаризировать — его нет.

## Route

```
/shipping — «KPPDF — Отгрузка»
```

Group Chip: `LOGISTICS_SECTION_CHIPS` (`PiGroupWorkspace`, activeId `shipping`).

## UI (stub)

- Tools-строка: подпись «Частичные отгрузки».
- Дашборд-панель `data-test="shipping-stub"` `role="status"`: бейдж «скоро» +
  текст-заглушка (полный поток — отдельная TZ). Никаких данных/API/dialogs.

## Hub expand (HUB-304)

From `/orders` expand «Отгрузка»:

- Copy: «Отгрузка пока не ведётся в интерфейсе. Открыть раздел „Отгрузка“.»
- Link → `/shipping`
- **Не** вызывать `GET /shipments`, не показывать counts из заказов.

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-NAV-301 | Stub-страница (поток L→R в меню цельный) |
| TZ-UX-309 | PiGroupWorkspace chrome (логистика chips) |
| **TZ-ORDERS-HUB-304** | Hub expand stub link → `/shipping` (0 HTTP) |

## Особенности

- Только зафиксировать факт: stub «скоро», детальный page.md появится вместе с
  реальным функционалом (отдельная TZ, не эта волна).
- Не изобретать API/фичи — продукта пока нет.

---

_Создано: 2026-08-09. Последнее обновление: 2026-08-15 (HUB-304)._
