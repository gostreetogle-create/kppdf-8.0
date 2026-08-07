# TZ-CATALOG-332 — Kind-цвета на списках Products / Modules / Materials + picker

> **IN WORK** · claimed `agent-3e757640b7` · 2026-08-07T22:45:54Z  
> Checklist: `docs/agent-checklists/TZ-CATALOG-332.md`  
> Source: `tasks/_backlog/catalog/TZ-CATALOG-332-kind-colors-lists-picker.md`

```
PAGES: /products ; /modules ; /materials ; composition picker dialog
PAGE_DOCS: products.page.md ; modules.page.md ; materials.page.md ; ui-overflow-select.md
```

## РОЛЬ АГЕНТА

Frontend.

## ЗАВИСИМОСТИ

- 330 DONE · 331 DONE (`d70461d`)

## LAYER

2

## CONFLICT KEYS

```
frontend/src/app/pages/products/products.page.ts;
frontend/src/app/pages/modules/modules.page.ts;
frontend/src/app/pages/materials/materials.page.ts;
frontend/src/app/pages/products/product-composition-picker-dialog.component.ts;
frontend/src/app/shared/ui/catalog/catalog-kind-oklch.ts;
frontend/src/app/shared/ui/catalog/catalog-kind-marker.component.ts;
docs/pages/products.page.md;
docs/pages/modules.page.md;
docs/pages/materials.page.md
```

## ЧТО ДЕЛАТЬ

1. Списки: тонкая полоска слева или точка у имени по kind (не карточки-радуга).
2. Composition picker: цвет вкладок или строк списка по kind.
3. Контраст light/dark; не ломать dense table chrome.
4. Обновить page docs.
5. Specs + tsc → READY FOR REVIEW → Cursor PASS → archive.

## НЕ ИЗМЕНЯТЬ

- Gantt, RAL, BOM tree internals (уже 330)
- Новые сущности Part
- desktop/**, COST-*, mass page-chrome unrelated
