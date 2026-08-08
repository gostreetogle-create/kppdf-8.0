═══════════════════════════════════════════════════════════════
TZ-ORDERS-303: Заказ — заказчик+объект, quick-create, ответственный линии
═══════════════════════════════════════════════════════════════

> READY после ORDERS-302 · канон D18/D20:  
> `docs/audits/2026-08-08-sales-to-shop-flow-canon.md`

STATUS: READY (RESERVED — CLAIM после DONE 302 или ∥ только если не трогает те же order detail files)

РОЛЬ АГЕНТА: Backend + Frontend

ЗАВИСИМОСТИ: ORDERS-301 DONE; ORDERS-302 желателен (detail shell); Counterparty module exists

LAYER: 3

PAGES: `/orders`, `/orders/:id` (или detail)
PAGE_DOCS: orders.page.md; audit sales-to-shop-flow-canon §5

CONFLICT KEYS:
backend/src/modules/order/**;
backend/src/modules/counterparty/**;
backend/src/modules/site/** (new — или counterparty/sites nested);
frontend/src/app/pages/orders/**;
frontend/src/app/shared/services/pi-orders*.ts;
frontend/src/app/shared/services/pi-counterpart*.ts;
docs/pages/orders.page.md;
docs/agent-checklists/TZ-ORDERS-303.md;
docs/agent-checklists/_active-map.md;

---

## Domain preflight

| Слово PO | Код |
|----------|-----|
| Заказчик | `Counterparty` |
| Объект (адрес/площадка) | **`Site`** (`counterpartyId`, name?, address) — новая тонкая сущность |
| Ответственный за изделие в заказе | `OrderLine.ownerUserId` → User/Worker display |
| Дата отгрузки позиции | `OrderLine.plannedShipDate?` (D16) |

Кардинальность: 1 Counterparty → N Site; 1 Order → 1 counterpartyId + 1 siteId (обязательны при create); 1 Order → N lines each optional owner.

Проверено: Order уже имеет `counterpartyId`; Site в коде **нет** — создать тонко.

---

## ЧТО ДЕЛАТЬ

1. **Site** schema/API: CRUD под counterparty; list by counterpartyId.  
2. Order create/update: require `counterpartyId` + `siteId`; validate site belongs to counterparty.  
3. Quick-create с UI заказа: thin Counterparty (name + phone) + thin Site (address) одним действием → подставить в заказ.  
4. OrderLine: `ownerUserId?` + UI аватар/выбор; `plannedShipDate?` (date).  
5. Docs RU; tests; не ломать convert КП→заказ (site: если нет — создать default site «Основной» из адреса клиента или потребовать выбрать — **default:** при convert создать Site «Объект по умолчанию» если у counterparty нет sites).

## НЕ

- Снабжение / Гант / версии КП / split order  
- Полная карточка юрлица в quick-create (дозаполнение later)  
- Deploy; desktop; DICT dictionaries WIP  

## AC

- [ ] Нельзя сохранить заказ без заказчика и объекта  
- [ ] Quick-create: имя+тел+адрес → counterparty+site+order fields  
- [ ] Линия: назначить ответственного; видно в detail  
- [ ] plannedShipDate на линии сохраняется  
- [ ] BE+FE tsc/tests зоны PASS; archive  

known_limitation: role capability checkboxes (D15) — отдельная ACCESS TZ; здесь только данные.

---

## Промпт (после 302)

```text
CLAIM TZ-ORDERS-303 → canon D18/D20 + этот файл → Site + order party + line owner/shipDate → gates → archive.
```
