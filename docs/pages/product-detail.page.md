# Страница: Карточка изделия (ProductDetailPage)

**Имя UI:** Карточка изделия · **Route:** `/products/:id`  
**Baseline v1:** [`docs/audits/2026-08-07-product-detail-baseline-v1.md`](../audits/2026-08-07-product-detail-baseline-v1.md)  
**UX-аудит:** [`docs/audits/2026-08-07-product-detail-ux-audit.md`](../audits/2026-08-07-product-detail-ux-audit.md)

**Краткое описание:** интерактивная панель сборки изделия — паспорт + BOM
(дерево + инспектор) + фото + себестоимость на одной странице.
**Module parity:** `/modules/:id` копирует этот A+ layout (TZ-CATALOG-336;
`ProductBomPanel` + `rootKind="module"`).  
**Material A+:** `/materials/:id` — TZ-CATALOG-337 (лист: where-used справа, без BOM).

## Включённость (канон PO)

| Родитель | Можно добавить в состав |
|----------|-------------------------|
| **Изделие** | изделие **или** модуль (материал/«деталь» в пикере — не убирать) |
| **Модуль** | модуль **или** материал |

Один write-path: BomPanel на карточке / QC L. FullEditor = passport + hint (DEDUP-301).

## Route

```
/products/:id — «KPPDF — Изделие»
```

## UI layout (variant A+, 2026-08-08)

1. **Nav:** `Каталог / <имя>` (`PiPageChrome`).
2. **Split xl:** слева sticky-колонка (паспорт + аккордеон **Фото / Себестоимость**);
   справа **связи → состав** (TZ-UX-444B): сверху секция **«Где используется»**
   (родители, в составе которых есть этот товар; таблица Тип | Название | Кол-во | Ед.,
   `GET /products/:id/where-used?page=1&limit=50`, паттерн material-detail), затем
   **BOM** на всю высоту (без `max-h`/внутреннего скролла дерева).
3. **BOM (`ProductBomPanel`):**
   - дерево: **`app-composition-tree`** — клик по всей строке ([канон](./ui-composition-tree.md));
     kind-цвета на бейдже/rail (изд/мод/мат) через `catalogKindOklch` (TZ-330);
     раскрытые дети — в nest-рамках принадлежности (TZ-333), пачки с gap/rail (TZ-334), не в Excel-колонках;
   - легенда kind (точки) над деревом;
   - инспектор справа: qty, **вклад в себест.** (материал: `price×qty`; модуль: `cost-preview×qty`;
     product-line: `unitPriceOverride×qty` иначе `child.costPrice×qty`, TZ-COST-305),
     «+ Из каталога» **в выбранный узел**, убрать, ссылка на карточку;
     **TZ-UX-COMPOSE-301:** если выбран материал/лист (add-into недоступен) —
     кнопка **«+ В корень изделия»** остаётся видимой (`bom-add-root-into`),
     чтобы не было тупика;
   - **матрица включённости (PO):** модуль → модуль **или** материал;
     изделие → изделие **или** модуль (материал/«деталь» в UI остаётся);
   - add в **product** → product composition API; add в **module** → module composition API;
   - picker с `restrictToModule` скрывает вкладку «изделие» и разрешает сырьё;
   - выбор из каталога: **`app-pi-overflow-select`** ([канон](./ui-overflow-select.md));
   - **Add & continue** ([канон](./ui-add-and-continue.md)): «Добавить» пишет строку и
     оставляет диалог открытым; «Закрыть»/✕ — выход; список «Добавлено сейчас»;
   - product-line picker: лейбл **«Цена в составе, ₽»**; default = `costPrice` → `listPrice`;
     пишет только `composition[].unitPriceOverride` (не карточку ребёнка).
4. Паспорт (DETAIL-301): фото, имя (`font-display text-lg sm:text-xl`, TYPE-302), badges, **В составе** (count); габариты/вес/RAL через FactCard. Цены — в блоке Себестоимость (DETAIL-302).
   **TZ-UX-444C:** `app-pi-status-banner` под chrome для `draft`/`archived`/`new` (`active` — без баннера); where-used data-links = `text-info` dotted underline (не gold CTA).
   **TZ-UX-444D:** нет фото → `.pi-thumb-empty` (hero + gallery `@empty`), не «Нет»/spinner.
5. Фото / себестоимость — слева: цены (Прайс/Себест/База + captions) + вертикальный журнал снимков; auto-recalc после mutate состава (DETAIL-302).

## Фото add-and-continue (TZ-UX-DIALOG-304)

Detail intentionally exposes a read-only gallery. To add photos, open the product
edit dialog: its `multiple` file input accepts a batch, keeps all uploaded thumbnails
in the same dialog, and sends the accumulated photo IDs on Save. While files upload,
the dialog shows a visible progress bar + RU status (`data-test="photo-upload-progress"`,
**TZ-UX-PHOTO-301**); exact % depends on browser/proxy (else indeterminate). There is no
one-photo modal to reopen between files; selecting three or more files is one sitting.

## Цена в составе vs себестоимость (канон TZ-COST-305)

| | Поле | Роль |
|--|------|------|
| Диалог вставки изделия | `unitPriceOverride` на линии родителя | Snapshot «цена в этом составе» |
| Карточка ребёнка | `costPrice` / `listPrice` | Не меняются из picker |
| CostCalculation | bucket `productLines` + `totalProductLineCost` | `override×qty` иначе `costPrice×qty`; иначе 0 + `infos` |
| Накладные % | только от materials | product-line **не** в базе overhead |

Аудит решений D1–D5: [`docs/audits/2026-08-09-product-line-cost-vs-override.md`](../audits/2026-08-09-product-line-cost-vs-override.md).

## Бизнес-правила состава (канон)

| Родитель | Можно | Нельзя |
|--------|------|--------|
| Product | module, material≠raw, **product** (комплекс) | raw; self-ref; cycles |
| Module | module, material (в т.ч. raw) | product-линия |

Источник: `docs/compose/plans/2026-08-04-catalog-composition-vision.md` D1–D3.

## API

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/products/:id` | Детали |
| GET | `/api/products/:id/where-used` | Где используется (родители, limit 50) |
| GET/POST/PATCH/DELETE | `/api/products/:id/composition` | Состав изделия |
| GET | `/api/products/:id/tree` | Дерево |
| GET/POST/PATCH/DELETE | `/api/modules/:id/composition` | Состав модуля (add-in-context) |
| GET | `/api/modules/:id/cost-preview` | Read-only rollup модуля (BOM inspector / module detail) |
| GET | `/api/materials/:id` | Цена материала для вклада строки BOM |

## Известные ограничения

- Загрузка фото с detail — Phase E; add-and-continue реализован в multi-file edit dialog.
- Where-used: только прямые родители из API (без «опосредованной связи» вендора,
  §5.1 аудита legacy ERP); лимит 50 строк.
- Глубокое дерево подгружается по expand (depth +2, max 8).
- Список модулей: колонка «Себест.» = hint «см. карточку» (нет batch preview; TZ-COST-303 P0).

---

_Создано: 2026-08-04. Обновлено: 2026-08-08 (TZ-COST-305 product-line · TZ-COST-303 · TZ-333/334 · TZ-UX-DIALOG-304) · 2026-08-26 (TZ-UX-444B where-used)._
