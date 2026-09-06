# WAVE Doc Studio S9 — контекст, якоря, витрина каталога

> **Статус:** READY FOR EXECUTOR (после S8)  
> **Master-промпт (S8+S9):** `tasks/PROMPT-FREEBUFF-DOCSTUDIO-S8-S9-MASTER.md`  
> **Предусловие:** S8 DONE или включено в master-волну с S8 первым

## Решения PO (2026-08-31)

1. **Витрина → таблица напрямую:** выбор в витрине **сразу** формирует строки таблицы с matching source (без второго «подтверди в сводке»).
2. **Категории витрины (4 вкладки):**

| Вкладка RU | entity | API / фильтр |
|------------|--------|--------------|
| Изделия | `product` | `GET /products` + photoIds |
| Модули | `product-module` | `GET /modules` |
| Детали | `material` | `materialKind=part` |
| Материалы | `material` | `materialKind` ∈ raw, purchased, fastener, other (≠ part) |

3. **Якоря** (client/payer/supplier) — S9-A; **витрина** — S9-B; **dblclick текст** — S9-C.

## context.catalogSelections

```typescript
catalogSelections: {
  products: string[];   // Product _id
  modules: string[];    // ProductModule _id
  parts: string[];      // Material _id (kind=part)
  materials: string[];  // Material _id (non-part)
}
```

PATCH атомарно с revision gate. Сводка «Выбрано» — read-only chips + удаление; **не** gate для таблицы.

## dataSet source.type (новые)

| source.type | rows from |
|-------------|-----------|
| `catalog-products` | context.catalogSelections.products |
| `catalog-modules` | context.catalogSelections.modules |
| `catalog-parts` | context.catalogSelections.parts |
| `catalog-materials` | context.catalogSelections.materials |

Таблица: свойство «Источник строк» = одно из ↑ | КП | Заказ | Вручную.

**Sync rule:** при toggle в витрине → PATCH context → **пересборка rows** связанных dataSets того же source → debounced preview.

## Очередь S9

| # | TZ | Файл |
|---|-----|------|
| A | Anchors + «Выбрано» + PiSelect label | `TZ-NX-DOCSTUDIO-S9-ANCHORS-MODEL.md` |
| B | Витрина 4 категории + resolver + table sync | `TZ-NX-DOCSTUDIO-S9-CATALOG-VITRINA.md` |
| C | Dblclick + picker по anchor | `TZ-NX-DOCSTUDIO-S9-TEMPLATE-BINDINGS-UX.md` |

## Подводные камни

- Material **part** vs **material** — один collection, разные вкладки по `materialKind`.
- Module без фото — placeholder как у Product.
- Несколько таблиц с одним source — все обновляются.
- Таблица source=manual — витрина её не трогает.
- org-scope на все list API.
