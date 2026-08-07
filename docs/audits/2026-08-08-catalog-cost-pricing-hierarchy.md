# Аудит — ценообразование / себестоимость по иерархии каталога

**Дата:** 2026-08-08  
**Запрос PO:** у модуля нет цены; материал есть; модуль = материалы + виды работ;
вид работ — почасовая расценка; у изделия и выше — сумма вложенного;
виды работ → возможно в справочники.

**Валюта:** только RUB.

---

## 1. Вердикт: идея PO верная, с двумя поправками

| PO сказал | Канон |
|-----------|--------|
| Материал / деталь имеет цену | Да. Деталь = Material (`kind`), поле `pricePerUnit` |
| Модуль «должен иметь цену» | Да как **расчётную себестоимость**, не как вторую ручную прайс-карточку. Цена модуля = Σ(мат×qty) + Σ(ставка×часы) (+ вложенные модули) |
| Вид работ — обязательная ₽/час | Да. Сейчас поле `hourlyRate` **есть, но optional** — дыра |
| Изделие = сумма состава | Да для **себестоимости**. У изделия отдельно ещё **прайс** (`listPrice`) для КП/продажи — не путать |
| Несколько изделий в заказе | Σ строк заказа. Сейчас КП→Заказ **срезает** цены (ORDERS-301) — коммерция vs цех; не ломать в P0 |
| Виды работ в «Справочники» | **Нет.** Оставить в **Каталог** (рядом с модулями/Гантом). Справочники = классификация/ед./цвета. Settings — нет |

**Не упустил:** иерархия parent = sum(children) — правильный север **себестоимости**.  
**Поправка:** «цена» в разговоре = две вещи:

1. **Себестоимость (cost)** — из каталога, rollup.  
2. **Прайс / сделка (list / deal)** — что пишем в КП клиенту.

P0 чинит cost-иерархию. Прайс заказа — successor.

---

## 2. Как сейчас в коде

| Сущность | Поле | UI | Rollup |
|----------|------|-----|--------|
| Material | `pricePerUnit` | «Цена» | лист |
| ProductModule | **нет** stored price; есть `workTypes[].estimatedHours` + materials | часы есть, цены модуля нет | только внутри CostCalculation изделия |
| WorkType | `hourlyRate?` optional | «Ставка ₽/час» optional | лист labor |
| Product | `listPrice` (UI), `basePrice`/`costPrice` (почти не правятся) | Прайс в форме; Себест. на detail | CostCalculation snapshot |
| CostCalculation | materials + labor + overhead% **только от материалов** | «Себестоимость» на карточке изделия | **1 уровень** модулей; nested module→module **нет**; activate **не** пишет `Product.costPrice` |
| StorageItem | без цены | остаток | — |
| Order | `unitPrice` на строках | есть; после КП часто 0 | Σ строк |

Nav: **Каталог** → Виды работ (`/work-types`). Не Справочники.

---

## 3. Формула (канон после волны)

```
moduleCost(M) =
  Σ material.pricePerUnit × qty
  + Σ workType.hourlyRate × estimatedHours
  + Σ moduleCost(child) × qty   // рекурсия, защита от циклов

productCost(P) =
  Σ direct materials
  + Σ moduleCost(moduleLine) × qty
  + (опц. product-lines: child.costPrice × qty — later)

overhead = f(materials[, labor])   // зафиксировать в TZ-COST-302
totalCost = materials + labor + overhead

При activate CostCalculation → Product.costPrice = totalCost
listPrice остаётся коммерческим (не авто=себест.)
```

Модуль: **read-only cost preview** (API или computed на detail), без ручного «price» поля, чтобы не было двух истин.

---

## 4. IA: куда класть виды работ

**Решение:** оставить **Каталог / Виды работ**.  
Группировка «справочником» = категории/теги при необходимости, не перенос раздела.  
Отдельный экран «настройки расценок» — не нужен.

---

## 5. Волна TZ

| TZ | Scope | Status |
|----|--------|--------|
| **TZ-COST-301** | `hourlyRate` обязателен (BE+FE); backfill 0; список показывает ставку | READY |
| **TZ-COST-302** | Рекурсивный rollup модулей; activate → `costPrice`; module cost-preview; overhead канон | после 301 |
| **TZ-COST-303** | UI: цена/себест. в списках модуля+изделия; BOM inspector показывает вклад строки | после 302 |
| later | product→product в cost; КП defaults; revisit strip-commerce | PARK |

Скрипт дня: `tasks/_backlog/cost/TZ-DAY-2026-08-08-cost-hierarchy-301-303.md`

---

## 6. НЕ делать в этой волне

- Покупная vs продажная цена материала (хватает одного `pricePerUnit` для цеха)
- Цена на StorageItem
- Авто `listPrice = costPrice × markup` без явного PO
- Перенос Виды работ → Справочники
- Deploy
