# TZ-CATALOG-375: Материалы — expandable строка с превью карточки

> PO: на `/materials` клик не только по названию — по строке (как `/products` и `/modules`)
> раскрывает tray с полезной информацией о материале (поставщик, габариты, цена…)
> блоками/категориями. Detail остаётся через имя-ссылку / «Открыть карточку».

РОЛЬ АГЕНТА: Frontend

ЗАВИСИМОСТИ: TZ-CATALOG-373 DONE (vitrine); эталон UX — `products.page` / `modules.page` expand (CATALOG-374)

LAYER: 3 (`materials.page.ts` — один агент)

CONFLICT KEYS: `frontend/src/app/pages/materials/materials.page.ts` ; `frontend/src/app/pages/materials/materials.page.spec.ts` ; `frontend/src/app/pages/materials/materials.page-373.spec.ts` (если трогает list/grid) ; `docs/pages/materials.page.md`

PAGES: `/materials`  
PAGE_DOCS: `docs/pages/materials.page.md`

CHECKLIST: `docs/agent-checklists/TZ-CATALOG-375.md`  
REVIEW: required

---

## Domain preflight

| Говорят | Канон |
|---------|--------|
| Материал | **Material** (`/api/materials`) |
| Поставщик | **Organization** type `supplier` (`supplierId` → lookup на странице) |
| Клиент | Counterparty — **не** трогать |
| «Меню внизу» | expandable row tray (`pi-table` `[expandedRow]`), не bottom sheet |

Проверено:

- `materials.page.ts`: `app-pi-table` **без** `(rowClick)` / `[expandedRow]` — открытие только через имя-ссылку `/materials/:id`.
- Имя: `#nameTpl` → `routerLink` (добавить `stopPropagation` как у modules).
- Склад-ссылка `#stockTpl` и `pi-row-actions` — не должны триггерить expand (stopPropagation / pi-table уже гасит actions).
- Поля на list-строке уже есть в `Material`: article, sku, unit, materialKind, supplierId, dimensions, pricePerUnit, stockQty, description, notes, assortment, standardRef, materialGrade, weightKg, photoIds.
- Lookup поставщиков: `supplierNameOf(row)` уже на странице.
- Эталон tray: modules CATALOG-374 — `border-l-gold` + `bg-[var(--color-gold-soft)]`, `expandedId`, «Открыть карточку».

Loose wording PO «меню» → **expand tray** под строкой с блоками read-only preview.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Клик по пустым ячейкам строки ничего не делает; только имя ведёт на detail.
2. На продукции/модулях row-click → gold tray с составом; на материалах состава нет — нужен **preview атрибутов**.
3. Нужен паритет поведения + блоки полезной инфы, без полного редактора в списке.

---

## ЧТО ДЕЛАТЬ

### 1. Expand вместо «тишины» на row-click

1. `expandedId = signal<string | null>(null)`.
2. `(rowClick)="onRowClick($event)"` на `app-pi-table`: toggle expand; **не** `router.navigate`.
3. Подключить `[expandedRow]`, `[expandedRowWhen]`, `[expandedRowLabel]` (RU: «Материал: {name}»).
4. В `#nameTpl` ссылке: `(click)="$event.stopPropagation()"` + `data-test="open-row-link"` (detail без toggle).
5. В `#stockTpl` ссылке: `stopPropagation` (склад ≠ expand).
6. `pi-row-actions` edit/copy/delete — не открывают expand.

### 2. Tray UI — блоки (read-only)

В `#expandedTpl` визуал как products/modules: `border-l-[3px] border-l-gold` + `bg-[var(--color-gold-soft)]`, `data-test="expanded-content"`.

Шапка tray:

- Заголовок «Обзор» (или «Материал») + ссылка «Открыть карточку» → `/materials/:id` (`data-test="material-expand-open-detail"`, stopPropagation).
- Код: `expandedSection: 'overview'` (+ комментарий successor); **не** рисовать пустые вкладки «Скоро».

Блоки (`data-test="material-expand-sections"`), каждый — компактная секция с eyebrow-заголовком; пустые поля секции **не** раздувать (скрыть весь блок если все поля пусты, или показать «—» только в заполненных блоках — предпочтение: **скрыть пустой блок**):

| Блок (RU) | Поля |
|-----------|------|
| **Идентификация** | артикул, внутренний код (sku), тип (`kindLabelOf`), ед. |
| **Поставщик** | `supplierNameOf`; если нет — одна строка «Поставщик не указан» |
| **Геометрия и сортамент** | `dimensionsSummary`, assortment, materialGrade, standardRef, weightKg |
| **Цена и склад** | pricePerUnit (+ unit), stockQty если есть; ссылка «Склад →» с stopPropagation |
| **Описание** | description, notes — только если непустые |

Данные брать из **уже загруженной** строки list (без обязательного lazy GET). Если какого-то поля нет в list payload — не выдумывать API; known_limitation + показать то, что есть.

Сетка блоков: `grid` 1→2 колонки на `sm+`, аккуратные `hairline` / `bg-paper/70` карточки внутри tray (как preview-child у modules) — не «dashboard из 10 карточек».

### 3. Grid

List-only expand. Grid: клик по карточке = detail (как сейчас). known_limitation в checklist.

### 4. Тесты

В `materials.page.spec.ts` (и/или 373 spec без ломания):

- row click → `expandedId` + tray visible;
- второй клик → collapse;
- другая строка → switch;
- name link → `/materials/:id`, expand не обязателен;
- stock link / edit action → expand не открывается;
- tray показывает хотя бы один блок при типичном fixture с supplier/dims.

### 5. Docs

`materials.page.md`: row-click → expand preview; detail через имя / «Открыть карточку».  
`PAGE-TZ-INDEX`: CATALOG-375.

---

## НЕ

- Chrome filters-rail / UX-328 migrate  
- Backend schema / новый endpoint  
- Полный BomPanel / edit в tray  
- Grid expand  
- Deploy / wipe  
- products.page / modules.page (кроме чтения эталона)

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] List: клик по строке (не только имя) toggle expand tray
- [ ] Tray: gold-soft + блоки RU; «Открыть карточку»; пустые блоки скрыты
- [ ] Имя / склад / row-actions не ломают expand-контракт
- [ ] Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="materials.page" --coverage=false
```

---

## Финализация

READY FOR REVIEW → Cursor PASS → archive `tasks/_archive/2026-08/TZ-CATALOG-375.done.md` + lock.  
Deploy нет.
