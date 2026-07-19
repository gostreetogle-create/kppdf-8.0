# Страница: Категории (CategoriesPage)

**Краткое описание:** Древовидный справочник категорий (материалы/продукция/общие) с CDK drag-drop reorder на двух уровнях (корневые + подкатегории).

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
| `expandedIds` | `Signal<Set<string>>` | Раскрытые узлы дерева |
| `treeRes` | `HttpResource<CategoryTreeNode[]>` | GET /api/categories/tree |
| `allTreeData` | `computed` | Сырые данные |
| `treeData` | `computed` | Отфильтрованные (поиск) |

## Особенности

- **Tree view** — два уровня: корневые + дети (nested)
- **CDK drag-drop** — `CdkDropList` + `CdkDrag` на двух уровнях
- **Drag handle** — grip-иконка (6 точек SVG)
- **Optimistic update** — reorder сразу обновляет UI, затем API
- **Expand/collapse** — chevron icons с rotate-90 анимацией
- **Client-side search** — фильтрует дерево по name/slug/skuPrefix; auto-expand родителей
- **Type badges** — цветные badge: material (warm), product (cool), general (muted)
- **Row actions** — edit/delete через pi-icon-btn (не pi-row-actions)

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-114 | Categories page — drag-reorder UI + optimistic update |

---

_Создано: 2026-07-19._
