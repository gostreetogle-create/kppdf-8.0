# TZ-UX-444B: Where-used на изделии и модуле (reuse API)

PAGES: `/products/:id` ; `/modules/:id`
PAGE_DOCS: product-detail.page.md ; module-detail.page.md

РОЛЬ АГЕНТА: Frontend UI Engineer  
ЗАВИСИМОСТИ: Нет (disjoint с 444A / DOC-443)  
LAYER: 3

### Preflight Check Output
- **Context read:** `material-detail.page.ts` where-used блок; `product.controller` / `product-module.controller` `GET :id/where-used`; `catalog-graph.service.ts`; audit §5.1+§8
- **Key Constraints:** только FE wire; BE уже есть; mirror material UX; плотность наша
- **Planned Deliverable:** секции «Где используется» на product-detail + module-detail
- **Validation Path:** page.md + jest + tsc · FIC N/A

CONFLICT KEYS:
`frontend/src/app/pages/products/product-detail.page.ts`;
`frontend/src/app/pages/products/product-detail.page.spec.ts`;
`frontend/src/app/pages/modules/module-detail.page.ts`;
`frontend/src/app/pages/modules/module-detail.page.spec.ts`;
`docs/pages/product-detail.page.md`;
`docs/pages/module-detail.page.md`

## Domain preflight

- **Проверено:** `GET /products/:id/where-used` и `GET /modules/:id/where-used` → `catalogGraph.getWhereUsed`.
- **Проверено:** material FE использует `limit=50`; BE default limit часто 20 — **взять limit=50** как у материала.
- **НЕ:** менять catalog-graph; не 3-панельный вендорский drill-down; не status-banner (444A/C).

## ИСХОДНОЕ

Where-used UI только на `material-detail`. Product/module detail без секции, хотя API живой.

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Product detail

Добавить секцию `data-test="product-where-used"` по образцу material:

- Заголовок «Где используется» + краткий hint (заказы / родители — **фактически то, что отдаёт API**: kind/name/qty/unit).
- `httpResource` → `${API}/products/${id}/where-used?page=1&limit=50`.
- Таблица: Тип | Название (routerLink) | Кол-во | Ед.
- Loading / error / empty RU copy.
- Ссылка: `text-info` если класс уже канон; иначе временно тот же dotted underline, что у material — **не** invent gold hover как единственный data-link (444C выровняет).

Размещение: правая/main колонка рядом с BOM (как material stacks where-used + stock) — **не ломать** существующий hero/BOM layout; добавить секцию под/рядом с BOM panel без reflow law КП.

### ШАГ 2 — Module detail

То же для `GET /modules/:id/where-used`, `data-test="module-where-used"`.

Main column сейчас = только `app-product-bom-panel` — обернуть в `space-y-4` и добавить секцию where-used (под или над BOM — **предпочтительно над BOM** как у material «сначала связи, потом состав»? Material: where-used в main, BOM нет. У module BOM = состав. Логика: **where-used под BOM** или сверху — взять **сверху main column** (связи → состав), чтобы оператор видел «куда входит» до редактирования состава.

### ШАГ 3 — Docs + tests

- Обновить `product-detail.page.md` / `module-detail.page.md`.
- Specs: flush where-used mock; empty state; link present.

## НЕ ИЗМЕНЯТЬ

- Backend / catalog-graph
- material-detail (эталон — только читать)
- order-detail / status-banner
- styles.css

## КРИТЕРИИ ПРИЁМКИ

1. На `/products/:id` и `/modules/:id` видна секция where-used с данными API.
2. Empty/loading/error без сырого EN.
3. Page docs обновлены.
4. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
5. `cd frontend && pnpm exec jest src/app/pages/products/product-detail.page.spec.ts src/app/pages/modules/module-detail.page.spec.ts --no-coverage --runInBand`

## Archive

`tasks/_archive/2026-08/` + checklist + PAGE-TZ-INDEX.
