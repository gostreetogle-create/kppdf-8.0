# TZ-CATALOG-332 — Kind-цвета на списках Products / Modules / Materials + picker

> Backlog. После **TZ-CATALOG-331** (или после 330, если только defaults без persist —
> тогда читать пресеты из того же helper).

```
PAGES: /products ; /modules ; /materials ; composition picker dialog
PAGE_DOCS: products.page.md ; modules.page.md ; materials.page.md ; ui-overflow-select.md
```

## РОЛЬ АГЕНТА

Frontend.

## ЗАВИСИМОСТИ

- 330 (helper + defaults) обязательно.
- 331 желательно (live пресеты); если 331 нет — defaults из кода.

## LAYER

2

## CONFLICT KEYS

```
frontend/src/app/pages/products/products.page.ts;
frontend/src/app/pages/modules/modules.page.ts;
frontend/src/app/pages/materials/materials.page.ts;
frontend/src/app/pages/products/product-composition-picker-dialog.component.ts;
frontend/src/app/shared/ui/catalog/catalog-kind-oklch.ts;
docs/pages/products.page.md;
docs/pages/modules.page.md;
docs/pages/materials.page.md
```

## ЧТО ДЕЛАТЬ

1. Списки: тонкая полоска слева или точка у имени по kind (не карточки-радуга).
2. Composition picker: цвет вкладок или строк списка по kind.
3. Контраст light/dark; не ломать dense table chrome.
4. Обновить page docs.
5. Specs + tsc.

## НЕ ИЗМЕНЯТЬ

- Gantt, RAL, BOM tree internals (уже 330)
- Новые сущности Part

## КРИТЕРИИ ПРИЁМКИ

- [ ] На `/products`, `/modules`, `/materials` kind читается цветом без путаницы с RAL
- [ ] Picker вкладок/строк согласованы с деревом
- [ ] Gates FE зелёные; archive + push
