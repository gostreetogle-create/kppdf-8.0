# Страница: Категории (CategoriesPage)

**Краткое описание:** Древовидный справочник категорий (материалы/продукция/общие) с CDK drag-drop reorder на двух уровнях (корневые + подкатегории). Chrome по канону D1–D2: PiDictionaryShell — компактный H1 + sticky-бар (поиск + фильтр по типу + CTA).

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
| `typeFilter` | `Signal<'all' | Category['type']>` | Фильтр по типу (Все типы / Материал / Продукция / Общая) |
| `expandedIds` | `Signal<Set<string>>` | Раскрытые узлы дерева |
| `treeRes` | `HttpResource<CategoryTreeNode[]>` | GET /api/categories/tree |
| `allTreeData` | `computed` | Сырые данные |
| `treeData` | `computed` | Отфильтрованные (поиск + тип) |
| `totalLabel` | `computed` | Компактный счётчик для shell (totalLabel) |

## Chrome (TZ-DICT-305)

- **PiDictionaryShell** — компактный H1 «Категории» + muted `totalLabel`; без eyebrow/description.
- **Sticky tools** — search + select «Тип» (all/material/product/general) + CTA «+ Создать»; прилипают под header (top-14).
- **Убран bloat** — нет `pi-section` «Каталог» с title/hint/eyebrow, нет дублирующего счётчика в toolbar (переехал в `totalLabel`).
- **CDK drag сохранён** — root + nested child reorder с optimistic update (без изменений).

## Особенности

- **Tree view** — два уровня: корневые + дети (nested)
- **CDK drag-drop** — `CdkDropList` + `CdkDrag` на двух уровнях
- **Drag handle** — grip-иконка (6 точек SVG)
- **Optimistic update** — reorder сразу обновляет UI, затем API
- **Expand/collapse** — chevron icons с rotate-90 анимацией
- **Client-side search** — фильтрует дерево по name/slug/skuPrefix; auto-expand родителей
- **Client-side type filter** — фильтрует дерево по `type`; при активном фильтре (или поиске) родители авто-раскрываются; пустой результат → «Ничего не найдено.»
- **Type badges** — цветные badge: material (warm), product (cool), general (muted)
- **Row actions** — edit/delete через pi-icon-btn (не pi-row-actions)

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-114 | Categories page — drag-reorder UI + optimistic update |
| TZ-DICT-305 | Cutover на PiDictionaryShell (D1–D2): sticky tools search + type filter + CTA; bloat убран; CDK drag сохранён |
| TZ-DOC-308 | Новый справочник «Категории шаблонов» (`/doc-template-categories`, `DocumentTemplateCategoriesPage`) — плоский CRUD категорий шаблонов документов, ОТДЕЛЬНО от этого дерева; материалы/продукция не затронуты |
| TZ-DOC-316 | Ещё один плоский справочник «Категории текстов» (`/dictionaries/text-block-categories`, `TextBlockCategoriesPage`) — категории текстовых блоков, питает select в редакторе блока и фильтр `/doc-constructor/texts`; от этого дерева и от TZ-DOC-308 не зависит |

---

_Создано: 2026-07-19._
