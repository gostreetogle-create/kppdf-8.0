═══════════════════════════════════════════════════════════════
TZ-CATALOG-320: FE composition gap — каскад + «детали» в текущих диалогах
═══════════════════════════════════════════════════════════════

> Быстрый FE-gap **до** полного CompositionTree (311).
> Канон: `tasks/TZ-CATALOG-300.md` §1–§3, D1–D4.
> Backend composition + Product→Product уже DONE (302…305).
> FE client cutover DONE (317), но UI всё ещё только module↔material.

РОЛЬ АГЕНТА: Frontend UI Engineer (Angular 20, Signals, Paper & Ink)

ЗАВИСИМОСТИ:
- TZ-CATALOG-305 DONE (lineType=product API)
- TZ-CATALOG-317 DONE (composition client)
- TZ-CATALOG-316 DONE (materialKind в материалах)
- TZ-CATALOG-314 — **закрыть / не параллелить** на тех же product/module страницах
- НЕ ждать 311

LAYER: 3

PAGES: /products ; /products/:id ; /modules ; /modules/:id
PAGE_DOCS: products.page.md ; product-detail.page.md ; modules.page.md ; module-detail.page.md

CONFLICT KEYS:
frontend/src/app/shared/services/pi-product-modules.service.ts;
frontend/src/app/shared/services/pi-product-modules.service.spec.ts;
frontend/src/app/pages/products/product-form-dialog.component.ts;
frontend/src/app/pages/products/product-form-dialog.component.spec.ts;
frontend/src/app/pages/products/product-detail.page.ts;
frontend/src/app/pages/products/product-module-picker-dialog.component.ts;
frontend/src/app/pages/modules/module-materials-form-dialog.component.ts;
frontend/src/app/pages/modules/module-materials-form-dialog.component.spec.ts;
frontend/src/app/pages/modules/module-form-dialog.component.ts;
docs/pages/products.page.md;
docs/pages/product-detail.page.md;
docs/pages/modules.page.md;
docs/pages/module-detail.page.md

Проверено:
- `tasks/TZ-CATALOG-300.md` §1 glossary + §3 composition rules
- `frontend/.../pi-product-modules.service.ts` — `CompositionLine.lineType` только `'module' | 'material'` (нет `product`, нет `unitPriceOverride`)
- Product UI: attach только модулей (`ProductModulePickerDialog`)
- Module materials dialog: seed/save только `lineType=material`
- BE: Product composition = `module | material(≠raw) | product`; Module = `module | material`
- `materialKind`: `raw|part|fastener|purchased|other` (D3 — «детали» = Material, не отдельная Part)

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Backend умеет каскад и комплексы; UI менеджера — нет.
2. «Детали / метизы / покупные» живут в `Material.materialKind`, но composition-пикеры
   не показывают kind и не помогают выбрать non-raw для изделия.
3. `module-form-dialog`: шаблон биндит `formControlName="width|height|depth|unit"`
   на корневой `form`, а controls лежат в `form.controls.dimensions` —
   runtime `Cannot find control with name: 'width'` (и height/depth/unit).
   В этом TZ **исправить** обёрткой `formGroupName="dimensions"` (тот же файл в CONFLICT KEYS).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Расширить FE composition types

- `CompositionLine` / Upsert / Update: `lineType: 'module' | 'material' | 'product'`
- Опционально `unitPriceOverride?: number` (≥0) — только для `lineType=product`
- Методы service уже есть; обновить типы + unit-тесты на POST body с `product`

ШАГ 2: Модуль — дочерние модули + материалы (каскад)

- Расширить `module-materials-form-dialog` (или переименовать UX-заголовок в «Состав модуля»)
  так, чтобы строки были двух типов: material **и** module.
- Add: picker материалов (как сейчас) + picker модулей (исключить self-id родителя).
- Save: POST/PATCH/DELETE composition с корректным `lineType`.
- RU: «Материал» / «Модуль»; для material показать короткий kind-лейбл
  (сырьё / деталь / метиз / покупное / другое) если есть в каталоге.
- `isPurchased` на линии — оставить как сейчас (контекст линии ≠ materialKind).

ШАГ 3: Изделие — модули + non-raw материалы + изделия (комплекс)

- Product form / detail: помимо модулей —
  - add `lineType=product` (picker изделий, исключить self-id);
  - add `lineType=material` только с `materialKind ≠ raw` (фильтр пикера / reject + toast если raw).
- Для product-линии: опциональное поле «Цена переопределения» → `unitPriceOverride`.
- Бейдж/метка **«Комплекс»** на detail (и в form header при edit), если в composition
  есть ≥1 `lineType=product` (derived `isComplex`, не писать в Mongo).

ШАГ 4: Баг габаритов module-form

- Обернуть блок габаритов в `[formGroupName]="'dimensions'"` (или эквивалент),
  чтобы width/height/depth/unit резолвились.

ШАГ 5: Page docs

- Обновить 4 page docs: какие lineType доступны в UI; комплекс; детали=materialKind;
  ссылка на successor 311 (полное дерево).

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: CONFLICT KEYS выше (+ при необходимости новый тонкий product-picker dialog
рядом с `product-module-picker-dialog`, если переиспользовать picker модулей нельзя).

НЕ ИЗМЕНЯТЬ:
- backend/** (composition API уже готов)
- полный CompositionTree / lazy tree UI → **311**
- cost rollup, BOM write, Excel import
- чужие _active TZ (314)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Module composition UI может добавить дочерний **модуль** и **материал**; save через composition API.
2. Product composition UI может добавить **модуль**, **material≠raw**, **product**; raw → понятная ошибка/блок.
3. Изделие с ≥1 product-линией показывает «Комплекс» (derived).
4. `unitPriceOverride` уходит только на product-линиях.
5. Пикер/таблица материалов в составе показывает RU kind (деталь/покупное/…).
6. Module form: открытие create/edit **без** GlobalErrorHandler про missing width/height/depth/unit.
7. Jest: типы + form/dialog сценарии add module-in-module и product-in-product (минимум по одному).
8. Docs pages обновлены; known_limitation указывает на 311.

Verification:
```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="pi-product-modules|product-form|module-materials|module-form|product-detail"
```

═══════════════════════════════════════════════════════════════
KNOWN LIMITATIONS
═══════════════════════════════════════════════════════════════

- Нет единого lazy CompositionTree / GET `/:id/tree` UI → **TZ-CATALOG-311**.
- Depth warn >5 и визуальный граф → 311.
- Cost rollup / snapshot заказа → Wave 3.
- Отдельной сущности Part нет и не вводить (D3).

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

Checklist: `docs/agent-checklists/TZ-CATALOG-320.md` (из `_TEMPLATE.md`) до кода.
Archive: `tasks/_archive/2026-08/TZ-CATALOG-320.done.md` + lock после Cursor/PO PASS.
Обновить `tasks/_backlog/catalog/README.md` и `_active-map` (320 DONE → next 311).
