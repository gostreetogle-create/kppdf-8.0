# Страница: Категории (CategoriesPage)

**Краткое описание:** Древовидный справочник категорий (материалы/продукция/общие) на Group Chip Workspace с shared Tree table-kit, двумя уровнями (корневые + подкатегории), CDK drag-drop reorder и фильтрами.

## Route

```
/categories — «KPPDF — Категории»
```

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/categories/tree` | Дерево категорий |
| POST | `/api/categories` | Создать |
| PATCH | `/api/categories/:id` | Обновить |
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
| `CategoriesService` | `tree()`, `create(payload)`, `update(id, payload)`, `remove(id)`, `reorder(ids)`, `reorderChildren(parentId, childIds)` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `search` | `SearchState` | Debounced поиск (300ms) |
| `typeFilter` | `Signal<'all' | Category['type']>` | Фильтр по типу |
| `expandedIds` | `Signal<Set<string>>` | Раскрытые узлы дерева |
| `treeRes` | `HttpResource<CategoryTreeNode[]>` | GET `/api/categories/tree` |
| `allTreeData` | `computed` | Сырые данные |
| `treeData` | `computed` | Отфильтрованные данные |
| `totalLabel` | `computed` | Компактный счётчик |

## Chrome and Tree kit (TZ-UI-TABLE-302)

- `PiGroupWorkspace` — внешний chrome: chip «Категории», sticky tools, поиск, фильтр типа, CTA.
- `PiTableTreeComponent` (`app-pi-table-tree`) — shared Tree variant: единый header/row visual, nested rows, indent, expand/collapse, loading/empty и capability flag `dragReorder`.
- `CategoriesPage` передаёт только columns, templates, filtered data и callbacks persistence; page-local `<table>`/grid chrome удалён.
- MVP поддерживает два уровня, как исходный экран categories.

## Особенности

- **Tree view** — два уровня: корневые + дети.
- **Expand/collapse** — chevron и `expandedIds`; поиск/фильтр автоматически раскрывает родителей.
- **CDK drag-drop** — Tree kit отдаёт parent-aware drop event; root и child reorder сохраняют прежние API и optimistic update.
- **Client-side search** — фильтрация по name/slug/skuPrefix.
- **Client-side type filter** — `material` / `product` / `general`; пустой результат → «Ничего не найдено.»
- **Type badges** — Paper & Ink token classes для material/product/general.
- **Row actions** — shared kit slot с edit/delete кнопками.

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

---

_Обновлено: 2026-08-05 (TZ-UI-TABLE-302 READY FOR REVIEW)._