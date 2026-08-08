═══════════════════════════════════════════════════════════════
TZ-SUPPLY-301: Снабжение — задачи закупки + confirm (скелет)
═══════════════════════════════════════════════════════════════

> READY после **TZ-NAV-301** stub `/supply` · канон D9/D18/D19  
> `docs/audits/2026-08-08-sales-to-shop-flow-canon.md`

STATUS: READY (RESERVED — CLAIM после NAV-301 DONE)

РОЛЬ АГЕНТА: Backend + thin FE на `/supply`

ЗАВИСИМОСТИ: NAV-301 stub route; Order lines exist

LAYER: 2–3

PAGES: `/supply`
PAGE_DOCS: nav-ia audit; flow canon

CONFLICT KEYS:
backend/src/modules/supply/** (new);
backend/src/app.module.ts;
frontend/src/app/pages/supply/**;
docs/agent-checklists/TZ-SUPPLY-301.md;
docs/agent-checklists/_active-map.md;

---

## Domain preflight

Задача снабжения = потребность материала (или модуль) по **линии заказа**;  
`confirmCanOrder { userId, at }` = зелёный флаг; снабженец закупает после confirm.  
Soft materials (D19) — не блокировать цех в этом TZ.

---

## ЧТО ДЕЛАТЬ

1. Schema `SupplyTask`: orderId, orderLineId?, materialId?, moduleId?, qty, status (`draft`\|`confirmed`\|`ordered`\|`received`), confirmedBy?, confirmedAt?, notes.  
2. API auth+org: list/filter, confirm, mark ordered/received.  
3. FE `/supply`: таблица задач (не empty stub); кнопки Подтвердить / Заказано.  
4. Генерация задач из состава — **best-effort** thin (или manual create в P0); full auto-explode → successor.  
5. Tests + docs.

## НЕ

- Полный MRP / тендер  
- Жёсткий блок Ганта  
- ORDERS-302 tree; desktop; deploy  

## AC

- [ ] CRUD/list SupplyTask + confirm audit fields  
- [ ] `/supply` показывает задачи  
- [ ] tsc + jest зоны PASS; archive  

known_limitation: автосоздание из BOM может быть SUPPLY-302.
