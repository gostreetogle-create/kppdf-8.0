# Аудит — цена product-line (`unitPriceOverride`) vs себестоимость

**Дата:** 2026-08-08 (файл `2026-08-09` — слот COST-304)  
**TZ:** `tasks/_backlog/cost/TZ-COST-304-product-line-cost-audit.md` → docs-DONE  
**Successor:** `tasks/_backlog/cost/TZ-COST-305-product-line-in-cost.md`

---

## 1. Вердикт (одной фразой)

Сумма в диалоге **сохраняется** на строке состава (`unitPriceOverride`), но **CostCalculation её не читает** — отсюда «материалы 0 / работа 0». Канон после 305: вклад product-line = `override×qty`, иначе `child.costPrice×qty`; карточка ребёнка не трогаем.

---

## 2. Было → Стало (канон)

| | Было (сейчас) | Стало (после 305) |
|--|---------------|-------------------|
| Поле в диалоге | «Цена переопределения, ₽», пустой default | «Цена в составе, ₽»; default = `costPrice` → fallback `listPrice` |
| Хранение | `composition[].unitPriceOverride` (только `lineType=product`) | то же |
| Карточка ребёнка | не меняется | не меняется |
| CostCalculation | только `material` + `module`; **product пропускается** | + вклад product-line по формуле ниже |
| Менеджер видит | вписал сумму → пересчёт ≈ 0 | сумма (или себест. ребёнка) входит в totalCost родителя |

---

## 3. Три пути (что пишет / читает)

```text
(A) Карточка Product
    listPrice  — коммерция / КП
    costPrice  — результат activate CostCalculation (себест. каталога)

(B) Строка состава родителя
    unitPriceOverride? × quantity  — snapshot «цена в этом составе»
    НЕ пишет в (A) ребёнка

(C) CostCalculation → totalCost → activate → Product.costPrice родителя
    Сейчас: materials + labor(+module walk) + overhead(materials)
    После 305: + productLineContribution (отдельная строка/bucket в snapshot или в materials-like infos)
```

| UI / API | Mongo path | В (C) сейчас | В (C) после 305 |
|----------|------------|--------------|-----------------|
| Picker «Цена…» | `Product.composition[i].unitPriceOverride` | нет | да, если задан |
| qty линии | `composition[i].quantity` | нет (для product) | да |
| Себест. ребёнка | `Product(child).costPrice` | нет | да, если override пуст |
| Прайс ребёнка | `Product(child).listPrice` | нет | только default в диалоге, **не** в cost |

---

## 4. Evidence (код)

| Факт | Cite |
|------|------|
| Create cost: filter `lineType === 'material'` + `'module'`; product lines не обходятся | `backend/src/modules/cost-calculation/cost-calculation.service.ts` ~100–113 |
| Schema: `unitPriceOverride?` на CompositionLine; `lineType` incl. `product` | `backend/src/modules/catalog/composition-line.schema.ts` |
| FE picker: label «Цена переопределения, ₽»; `unitPriceOverride.set('')` при открытии — **без** prefill | `frontend/.../product-composition-picker-dialog.component.ts` ~129–190, 279 |
| Аудит-база: product→product в cost = later | `docs/audits/2026-08-08-catalog-cost-pricing-hierarchy.md` §3/§5 |

**Поведение:** parent с **только** product-line + override → create calculation → materials/labor пустые → total ≈ overhead-only/0. Override при этом остаётся в GET composition.

---

## 5. Decision table (зафиксировано)

| # | Вопрос | Решение | Почему |
|---|--------|---------|--------|
| **D1** | Product-line в себест. родителя | **(b)** `override×qty` если задан, иначе `child.costPrice×qty` | PO: не «тихо 0». Рекурсия BOM ребёнка **(c)** — later (дороже; `costPrice` уже rollup ребёнка) |
| **D2** | Где живёт цена вставки | **(a)** только `unitPriceOverride` на линии родителя | Спеццена комплекса ≠ прайс каталога ребёнка |
| **D3** | Default в диалоге | **(d)** `child.costPrice`, fallback `listPrice`, иначе пусто | «Уже есть цена — подставить»; для cost ближе себест. |
| **D4** | Копирайт | **«Цена в составе, ₽»** + hint: влияет на себест. родителя; не меняет карточку ребёнка | Убрать путаницу «переопределение» |
| **D5** | Module-line override | **Нет** | Канон: модуль = расчётный preview, без ручной цены |

Если override и `child.costPrice` оба пусты → вклад 0 + `infos[]` warn (честно, не silent).

---

## 6. Риски

| Риск | Митигация |
|------|-----------|
| Две «цены» (карточка vs линия) | Copy + hint; D2=a жёстко |
| Устаревший `child.costPrice` | После activate ребёнка — пересчёт родителя вручную; live-рекурсия = later |
| Overhead только от materials | Product-line вклад **не** раздувает overhead% в P0 305 (как labor); зафиксировать в AC 305 |
| Путать с прайсом КП/заказа | 305 не трогает Order / strip-commerce |

---

## 7. НЕ делать

- Ручная цена модуля / `unitPriceOverride` на module|material  
- Автозапись в `listPrice`/`costPrice` ребёнка из диалога  
- Авто `listPrice = costPrice × markup`  
- Рекурсивный walk composition ребёнка в P0 (D1≠c)  
- StorageItem price, Order commerce, deploy в рамках 304/305  
- Трогать CLAIMED CATALOG-336 / composition-tree dark 335 без нужды

---

## 8. Successor

**TZ-COST-305** — BE: учесть product-lines в `create` (+ tests); FE: prefill + RU copy; BOM inspector показать вклад строки.  
Очередь: после CATALOG-336/335 или ∥ если CONFLICT KEYS не пересекаются с module-detail.
