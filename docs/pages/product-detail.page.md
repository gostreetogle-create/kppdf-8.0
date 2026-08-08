# Страница: Карточка изделия (ProductDetailPage)

**Имя UI:** Карточка изделия · **Route:** `/products/:id`  
**Baseline v1:** [`docs/audits/2026-08-07-product-detail-baseline-v1.md`](../audits/2026-08-07-product-detail-baseline-v1.md)  
**UX-аудит:** [`docs/audits/2026-08-07-product-detail-ux-audit.md`](../audits/2026-08-07-product-detail-ux-audit.md)

**Краткое описание:** интерактивная панель сборки изделия — паспорт + BOM
(дерево + инспектор) + фото + себестоимость на одной странице.
**Module parity:** `/modules/:id` копирует этот A+ layout (TZ-CATALOG-336;
`ProductBomPanel` + `rootKind="module"`).

## Route

```
/products/:id — «KPPDF — Изделие»
```

## UI layout (variant A+, 2026-08-08)

1. **Nav:** `Каталог / <имя>` (`PiPageChrome`).
2. **Split xl:** слева sticky-колонка (паспорт + аккордеон **Фото / Себестоимость**);
   справа **только BOM** на всю высоту (без `max-h`/внутреннего скролла дерева).
3. **BOM (`ProductBomPanel`):**
   - дерево: **`app-composition-tree`** — клик по всей строке ([канон](./ui-composition-tree.md));
     kind-цвета на бейдже/rail (изд/мод/мат) через `catalogKindOklch` (TZ-330);
     раскрытые дети — в nest-рамках принадлежности (TZ-333), пачки с gap/rail (TZ-334), не в Excel-колонках;
   - легенда kind (точки) над деревом;
   - инспектор справа: qty, **вклад в себест.** (материал: `price×qty`; модуль: `cost-preview×qty`, TZ-COST-303),
     «+ Из каталога» **в выбранный узел**, убрать, ссылка на карточку;
   - add в **product** → product composition API; add в **module** → module composition API;
   - picker с `restrictToModule` скрывает вкладку «изделие» и разрешает сырьё;
   - выбор из каталога: **`app-pi-overflow-select`** ([канон](./ui-overflow-select.md)).
4. Паспорт: **Прайс** (`listPrice`) рядом с **Себест.** (`costPrice`); База отдельно.
5. Фото / себестоимость (журнал расчётов) — слева под паспортом, не под деревом.

## Бизнес-правила состава (канон)

| Родитель | Можно | Нельзя |
|----------|-------|--------|
| Product | module, material≠raw, **product** (комплекс) | raw; self-ref; cycles |
| Module | module, material (в т.ч. raw) | product-линия |

Источник: `docs/compose/plans/2026-08-04-catalog-composition-vision.md` D1–D3.

## API

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/products/:id` | Детали |
| GET/POST/PATCH/DELETE | `/api/products/:id/composition` | Состав изделия |
| GET | `/api/products/:id/tree` | Дерево |
| GET/POST/PATCH/DELETE | `/api/modules/:id/composition` | Состав модуля (add-in-context) |
| GET | `/api/modules/:id/cost-preview` | Read-only rollup модуля (BOM inspector / module detail) |
| GET | `/api/materials/:id` | Цена материала для вклада строки BOM |

## Известные ограничения

- Загрузка фото с detail — Phase E.
- Where-used на изделии — не в UI.
- Глубокое дерево подгружается по expand (depth +2, max 8).
- Список модулей: колонка «Себест.» = hint «см. карточку» (нет batch preview; TZ-COST-303 P0).

---

_Создано: 2026-08-04. Обновлено: 2026-08-08 (TZ-COST-303 cost visibility · TZ-333/334)._
