═══════════════════════════════════════════════════════════════
TZ-COST-304: Аудит — цена при вставке изделия в состав vs себестоимость
═══════════════════════════════════════════════════════════════

> READY · **аудит + решения** (документы) · код продукта **не** трогать  
> На завтра (после TZD-24 / по слоту PO) · LAYER docs  
>
> Триггер PO (2026-08-08 вечер): на сайте добавил изделия в состав другого
> изделия → диалог просит «сумму» → вписал → пересчитал себестоимость →
> **материалы 0, работа 0**. Ожидал, что введённая сумма войдёт в себест.
> Второй вопрос: если у модуля/изделия уже есть цена — подставлять её в
> диалог по умолчанию; **где хранить** правку — на карточке или в строке состава.
>
> Это **не** «баг калькулятора случайно», а **разрыв канона**: волна COST-301…303
> сознательно отложила `product→product` в cost (`later` в аудите 08-08).
> UI уже умеет `unitPriceOverride` на product-line (CATALOG-305), cost — нет.

STATUS: READY (выдавать Cursor Mode A / аудитору; **не** executor-код)

РОЛЬ АГЕНТА: Cursor architect — аудит + decision table + successor TZ.
Исполнитель кода **не** стартует, пока нет решений в §Deliverable.

ЗАВИСИМОСТИ:
- TZ-COST-301…303 DONE (hourlyRate, recursive module rollup, UI visibility)
- CATALOG product-lines + `unitPriceOverride` (schema/DTO уже есть)
- Аудит-база: `docs/audits/2026-08-08-catalog-cost-pricing-hierarchy.md`

LAYER: docs (1)

PAGES: `/products/:id` (BOM picker + Себестоимость); опц. module detail
PAGE_DOCS: `docs/pages/product-detail.page.md`; `docs/audits/2026-08-08-catalog-cost-pricing-hierarchy.md`

CONFLICT KEYS (только docs / TZ; код — read-only):
docs/audits/2026-08-09-product-line-cost-vs-override.md;
docs/audits/2026-08-08-catalog-cost-pricing-hierarchy.md (добавить § successor);
tasks/_backlog/cost/TZ-COST-304-product-line-cost-audit.md;
tasks/_backlog/cost/TZ-COST-305-*.md (создать черновик после решений);
tasks/_backlog/cost/README.md;
docs/agent-checklists/TZ-COST-304.md;
docs/agent-checklists/_active-map.md;
docs/pages/PAGE-TZ-INDEX.md;
docs/PO-DIARY.md (§2 одна строка канона + §5 если нужно);
ARCHITECTURE.md (одна фраза зоны cost — только если канон сменился);

---

## Domain preflight

| Слово PO | Код-канон |
|----------|-----------|
| «Сумма» / «цена» при добавлении изделия в состав | Скорее всего **`composition[].unitPriceOverride`** (строка родителя), не `Product.listPrice` / `costPrice` ребёнка |
| Себестоимость / пересчёт | `CostCalculation` → materials + labor (+ overhead); activate → `Product.costPrice` |
| Прайс на карточке | `Product.listPrice` (КП/продажа) — **не** то же, что override в составе |
| Модуль «цена» | Расчётный preview (COST-302/303), **без** ручного price на карточке модуля |

Кардинальность: 1 parent Product → N composition lines; одна линия `product`
может иметь свой override; карточка ребёнка при этом **не** обязана меняться.

Проверено (факты для аудита — подтвердить file:line при прогоне):
- `cost-calculation.service.ts`: обход только `lineType === 'material'|'module'`;
  **`product` lines пропускаются** → вклад 0 в materials/labor
- `composition-line.schema.ts` / DTO: `unitPriceOverride?` только для product-lines
- `product-composition-picker-dialog.component.ts`: поле
  «Цена переопределения, ₽», placeholder «необязательно», **без** prefill
  из `costPrice`/`listPrice` выбранного изделия
- Аудит 08-08 §5: `later | product→product в cost` — PARK

---

## ИСХОДНОЕ СОСТОЯНИЕ (боль менеджера)

1. Добавил изделие B в состав изделия A, вписал сумму в диалог.
2. Нажал пересчёт себестоимости на A → видит материалы/работа **0**
   (если нет module/material линий с ценами/ставками).
3. Непонятно: сумма «пропала» или «лежит не там»?
4. Хочет: при выборе B с уже известной ценой — default в диалоге;
   править можно; вопрос истины — карточка B vs строка в A.

---

## ЧТО ДЕЛАТЬ (аудит, 1 сессия)

### 1. Карта потоков (схема в audit-доке)
Нарисовать 3 пути и что пишет/читает каждый:

```text
(A) Карточка Product.listPrice / costPrice
(B) Строка состава unitPriceOverride × qty
(C) CostCalculation.totalCost → activate → costPrice родителя
```

Для сценария «B в составе A» — таблица: UI поле → API → Mongo path →
участвует ли в (C).

### 2. Воспроизведение / evidence
- На стенде или локально: parent с **только** product-line + override →
  create cost-calculation → snapshot materials/labor/total (+ infos).
- Parent с module+material (известные цены) → убедиться, что rollup жив.
- Зафиксировать: override **хранится** (GET composition) даже когда cost = 0.

### 3. Decision table (обязательные ответы PO/архитектора)

| # | Вопрос | Варианты (выбрать 1) |
|---|--------|----------------------|
| D1 | Product-line в **себестоимости** родителя | **(a)** ignore (как сейчас) + честный UI/infos; **(b)** `override × qty` если задан, иначе `child.costPrice × qty`; **(c)** рекурсия в composition ребёнка (как «взорвать» BOM); **(d)** другое — описать |
| D2 | Где живёт цена «при вставке» | **(a)** только `unitPriceOverride` на строке родителя (карточка ребёнка не трогаем); **(b)** правка пишет в `listPrice`/`costPrice` ребёнка; **(c)** оба (запрещено без крайней нужды) |
| D3 | Default в диалоге | **(a)** пусто; **(b)** `child.costPrice`; **(c)** `child.listPrice`; **(d)** costPrice с fallback listPrice; подпись RU уточнить |
| D4 | Копирайт поля | Переименовать так, чтобы не путать с «себест. пересчёта» (напр. «Цена в составе (₽)» / «Вклад в прайс комплекса») |
| D5 | Модуль в том же диалоге | Override на module-line — **нет** (канон PO diary: не ручная цена модуля). Только product-line. |

Рекомендация архитектора (стартовая, можно сменить в аудите):

- **D2 = (a)** — цена вставки = snapshot на линии родителя (комплекс/спеццена
  сделки внутри BOM), карточка ребёнка остаётся общей истиной каталога.
- **D1 = (b)** для себестоимости комплекса: иначе менеджер снова получит 0.
  Рекурсия (c) — только если PO хочет «себест. = полный разворот», дороже
  и дублирует смысл override.
- **D3 = (b) или (d)** — default из себест. ребёнка; override правит **линию**.
- Не смешивать override с автозаписью в `listPrice` ребёнка.

### 4. Deliverable
1. Новый файл: `docs/audits/2026-08-09-product-line-cost-vs-override.md`
   (вердикт, схема, decision table с выбранными D1–D5, риски, НЕ делать).
2. Обновить §5/волна в `2026-08-08-catalog-cost-pricing-hierarchy.md`
   (COST-304 audit → COST-305 impl).
3. Черновик **TZ-COST-305** (executable, CONFLICT KEYS на cost-calculation +
   picker dialog + BOM inspector) — **STATUS READY только после** заполненных D1–D5.
4. Одна строка в `docs/PO-DIARY.md` §2 канон, если решение стабильно
   (состав: override на линии ≠ прайс карточки; cost учитывает product-line
   по выбранному D1).
5. Checklist closeout + archive COST-304 как docs-DONE; active-map → 305.

### 5. НЕ делать в 304
- Патчи `cost-calculation.service.ts` / FE picker (это 305)
- Авто `listPrice = costPrice × markup`
- StorageItem price, Order strip-commerce
- Deploy
- TZD-21 / TZD-24 scope

---

## ИЗМЕНЯТЬ

Только файлы из CONFLICT KEYS (docs/TZ/checklist/map/diary).

## НЕ ИЗМЕНЯТЬ

`backend/**/*.ts`, `frontend/**/*.ts` (кроме чтения), desktop, deploy scripts.

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] Audit-док 2026-08-09 существует; D1–D5 **явно выбраны** (не «на усмотрение»)
- [ ] Evidence: product-line+override не входит в current CostCalculation (cite)
- [ ] Рекомендация vs альтернативы + риск «две цены» описаны
- [ ] TZ-COST-305 черновик с AC и CONFLICT KEYS под выбранный D1/D2/D3
- [ ] active-map: 304 DONE (docs) → 305 READY; cost/README обновлён
- [ ] Нет product-code diff в коммите 304

known_limitation:
- Пока 305 не сделан — на стенде поведение «вписал сумму → себест. 0» остаётся;
  после 304 можно честно сказать PO «так задумано до 305» + дата/очередь.

---

## Промпт (завтра, Cursor)

```text
Прочитай docs/PO-DIARY.md §1–§4, docs/TZ-AUTHORING.md и
tasks/_backlog/cost/TZ-COST-304-product-line-cost-audit.md.
Сделай checklist docs/agent-checklists/TZ-COST-304.md.
Выполни аудит (только docs). Зафиксируй D1–D5, напиши
docs/audits/2026-08-09-product-line-cost-vs-override.md и черновик TZ-COST-305.
Код продукта не трогай. Commit+push docs.
```
