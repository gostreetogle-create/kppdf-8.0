# Страница: Категории (CategoriesPage)

**Краткое описание:** Единый справочник категорий (`type`: material | product | general) на Group Chip Workspace с shared Tree table-kit. Путь в UI: **Справочники → Классификация → Категории**. `fullPath` — name-сегменты («Металлы/Лист»); slug — URL/SKU.

## Route

```
/categories — «KPPDF — Категории»
/categories?type=material — фильтр материалов (deep-link из Снабжения)
/categories?type=product|general — аналогично
```

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/categories/tree` | Дерево категорий |
| POST | `/api/categories` | Создать |
| PATCH | `/api/categories/:id` | Обновить (rename → пересчёт fullPath descendants) |
| DELETE | `/api/categories/:id` | Удалить |
| POST | `/api/categories/reorder` | Переупорядочить корневые |
| POST | `/api/categories/reorder-children` | Переупорядочить подкатегории |

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `CategoryFormDialogComponent` | create / edit | `null` / `Category` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `CategoriesService` | `tree()`, `list(type)`, `create(payload)`, `update(id, payload)`, `remove(id)`, `reorder(ids)`, `reorderChildren(parentId, childIds)` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `search` | `SearchState` | Debounced поиск (300ms) |
| `typeFilter` | `Signal<'all' | Category['type']>` | Фильтр по типу; init из `?type=` |
| `expandedIds` | `Signal<Set<string>>` | Раскрытые узлы дерева |
| `treeRes` | `HttpResource<CategoryTreeNode[]>` | GET `/api/categories/tree` |
| `allTreeData` | `computed` | Сырые данные |
| `treeData` | `computed` | Отфильтрованные данные |
| `totalLabel` | `computed` | Компактный счётчик |

## Chrome and Tree kit (TZ-UI-TABLE-302)

- `PiGroupWorkspace` — внешний chrome: chip «Категории», sticky tools, поиск, фильтр типа, CTA.
- Path hint: `Справочники → Классификация → Категории` (`data-test="categories-path-hint"`).
- `PiTableTreeComponent` (`app-pi-table-tree`) — shared Tree variant: единый header/row visual, nested rows, indent, expand/collapse, loading/empty и capability flag `dragReorder`.
- `CategoriesPage` передаёт только columns, templates, filtered data и callbacks persistence; page-local `<table>`/grid chrome удалён.
- MVP поддерживает два уровня, как исходный экран categories.

## Особенности

- **Tree view** — два уровня: корневые + дети.
- **Expand/collapse** — chevron и `expandedIds`; поиск/фильтр автоматически раскрывает родителей.
- **CDK drag-drop** — Tree kit отдаёт parent-aware drop event; root и child reorder сохраняют прежние API и optimistic update.
- **Client-side search** — фильтрация по name/slug/skuPrefix.
- **Client-side type filter** — `material` / `product` / `general`; `?type=material` с Supply deep-link.
- **Empty (material)** — «Категории материалов используются в Снабжении и карточке материала…».
- **Type badges** — Paper & Ink token classes для material/product/general.
- **Row actions** — copy slug (read-only), edit, delete (с guard на BE).

## Write-through из форм

- Supply / material form: `POST /categories` с `type=material`, затем refresh picker.
- Product form: `POST /categories` с `type=product` (через диалог справочника).

## Known limits

- Reorder при активном поиске/тип-фильтре использует индексы видимого дерева; это прежнее ограничение filtered drag-сценария и не меняет API-контракт.
- Глубина больше двух уровней остаётся отдельным следующим расширением Tree kit.

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-114 | Categories page — drag-reorder UI + optimistic update |
| TZ-DICT-305 | Старый page-local chrome/search/type filter |
| TZ-DICT-310 | Group Chip Workspace classification group |
| TZ-UI-TABLE-302 | Shared Tree kit + migration categories |
| TZ-DOC-308 | Отдельный плоский справочник категорий шаблонов |
| TZ-DOC-316 | Отдельный плоский справочник категорий текстов |
| TZ-CATALOG-377 | name-based fullPath; `?type=` filter; path hint; copy slug; write-through |

---
