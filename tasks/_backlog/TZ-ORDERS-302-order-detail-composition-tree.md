═══════════════════════════════════════════════════════════════
TZ-ORDERS-302: Карточка заказа — composition-tree (live BOM)
═══════════════════════════════════════════════════════════════

> **UN-PARKED** 2026-08-08 · канон: `docs/audits/2026-08-08-business-logic-rails-check.md` D1–D4  
> START после DICT-314 (или ∥ если keys не пересекаются; не параллелить с 315 на том же FE god-file без проверки)

STATUS: READY (RESERVED until map slot; не CLAIM пока 314 в `_active` на пересекающихся keys — обычно keys чисты)

РОЛЬ АГЕНТА: Frontend (+ тонкий BE read aggregate только если без N+1 не обойтись)

ЗАВИСИМОСТИ:
- ORDERS-301 DONE (lines + productId + name/sku snapshot)
- CATALOG composition-tree 330–335 DONE
- Audit rails D1: **live** catalog composition

LAYER: 2 (order page wrapper) — shared tree **не** форкать; править tree только если баг reuse

PAGES: `/orders` detail (роуте `/orders/:id` или существующий detail — выбрать меньший diff)
PAGE_DOCS: `docs/pages/orders.page.md`; `docs/pages/ui-composition-tree.md`; audit rails

CONFLICT KEYS:
frontend/src/app/pages/orders/**;
frontend/src/app/shared/ui/composition/composition-tree.component.ts;
docs/pages/orders.page.md;
docs/pages/ui-composition-tree.md;
docs/agent-checklists/TZ-ORDERS-302.md;
docs/agent-checklists/_active-map.md;

---

## Domain preflight (зафиксировано)

| Вопрос | Канон |
|--------|--------|
| Корень дерева | Order → lines[] → узел изделия (`productId`, qty, label из snapshot name) |
| Children | **Live** GET composition продукта (как ProductBomPanel), не snapshot BOM в P0 |
| Цены на заказе | **Не** возвращать strip-commerce прайс (D4) |
| Статусы узлов | Out of scope P0 |
| Нет productId / 404 каталог | Честный empty/warn на узле, не падать |

Проверено: lifecycle snapshot полного BOM = этап спецификации (successor); 301 уже даёт name/sku на линии.

---

## ЧТО ДЕЛАТЬ

1. Detail «Заказ №…»: chrome + `app-composition-tree` (не копипаста CSS).
2. Map lines → root nodes; expand = live children (module/material/product).
3. RU empty: «В заказе нет изделий» / «Изделие не найдено в каталоге».
4. Docs: orders.page.md + строка reuse в ui-composition-tree.md.
5. Jest smoke + tsc FE.

## НЕ

- Гант, статусы узлов, reserve, PDF  
- Второе дерево / Excel-колонки  
- Писать цены сделки обратно в Order  
- Snapshot-immutability полного BOM (CORE successor)  
- Deploy; desktop; DICT-314 keys (`form-profiles`)

## AC

- [ ] Открыть заказ с ≥1 линией → каскад как на изделии (visual canon tree)
- [ ] Expand показывает live модули/материалы; product-child тоже
- [ ] Нет прайса КП в этом дереве
- [ ] FE tsc + релевантный jest PASS
- [ ] Docs обновлены; archive + lock

known_limitation: правка каталога после заказа меняет то, что видит цех на detail — осознанно (D1); заморозка = later SPEC.

---

## Промпт (когда map NEXT)

```text
CLAIM TZ-ORDERS-302 → audit rails D1 + этот TZ → live BOM tree на заказе → gates → archive.
Не трогать DICT form-profiles / deploy.
```
