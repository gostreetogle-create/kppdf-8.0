# Страница: Модули (ModulesPage)

**Краткое описание:** Справочник модулей продукции — составные части, переиспользуемые между товарами. Витрина как у Продукции (TZ-CATALOG-372): фото, filters-rail, list↔grid, клиентская пагинация/поиск/сортировка. **TZ-CATALOG-374:** клик по строке в list раскрывает tray состава (как `/products`); detail — через имя-ссылку / «Открыть карточку».

## TZ-CATALOG-372 — витрина как у Продукции

Паритет chrome с `/products` (`products.page.ts`, канон `docs/audits/2026-08-15-catalog-list-vitrine-parity.md`):

- **Фото-колонка** первая: thumb 5.5rem или `app-pi-empty-tile`; фото резолвится по паттерну материалов — `PhotosService` + `createLookupTable` + `photoListUrl` (list-эндпоинт отдаёт id, не populate).
- **Имя-ссылка**: `catalog-kind-marker` + `<a routerLink="/modules/:id">` с `stopPropagation` (detail без expand).
- **Row-click (TZ-CATALOG-374)**: toggle expand tray состава под строкой (`expandedId` + `getModuleTree`); **не** navigate. Grid: клик по карточке → detail (list-only expand).
- **Toolbar** (порядок как у products): поиск · Select «Состав» (Все / С материалами / Пустые) · «+ Создать» · ghost «Обновить» · toggle list/grid (`view-list-button` / `view-grid-button`, `aria-pressed`) · счётчик справа.
- **Filters rail** (канон оверлея): узкая полоска `w-12` + панель `filters-rail-panel` absolute left-full поверх колонки контента; backdrop **только** на контенте; клик/`change` внутри панели не закрывают. Панель: Состав · Сортировка (name↑↓, article↑↓) · «Сбросить» (`clear-filters`) · «Закрыть`.
- **Grid**: `app-pi-showcase-card size="md"` в сетке `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`; `mediaUrl` из main/first фото; `title` = name, `eyebrow` = article или «Модуль», `description` = габариты или «N мат. · M раб.»; `sc-actions-md` — hint «Себест. см. карточку» (без batch cost-preview, TZ-COST-303); grid slice = `paginatedRows()`; pager = `<app-pi-pagination>` (канон TZ-UX-341 / UX-340).
- **View mode persistence**: `localStorage['pi-modules-view-mode']` (`list` | `grid`), load/save в try/catch (паттерн products).
- **Фильтр «Состав»** — client-side, dual-read: непустой `composition` (material-линии) приоритетнее legacy `materials[]`.

## TZ-CATALOG-332 — визуальный маркер типа

В колонке «Название» каждая строка получает тонкую вертикальную полоску `module` из общей палитры `catalogKindOklch`. Это помогает отличать узел каталога от изделия и материала, не смешивая цвет с `WorkType.accentHue` Ганта.

## Route

```
/modules — «KPPDF — Модули»
```

## Query params

Нет — всё через сигналы.

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/modules` | Список (flat array) |
| GET | `/api/modules/:id/composition` | Состав модуля (dual-read: composition, иначе legacy materials[]) |
| POST | `/api/modules/:id/composition` | Добавить линию состава (lineType=material) |
| PATCH | `/api/modules/:id/composition/:lineId` | Обновить линию (quantity/unit/…) |
| DELETE | `/api/modules/:id/composition/:lineId` | Удалить линию состава |
| DELETE | `/api/modules/:id` | **Hard delete** (`deleteOne`) — soft-delete Module = TZ-CATALOG-314 |

> **TZ-CATALOG-317:** материалы модуля читаются dual-read (непустой
> `composition` → material-линии, иначе legacy `materials[]`); редактирование
> «Изменить состав» пишет через composition-эндпоинты. Legacy `PATCH materials[]`
> остаётся best-effort зеркалом до миграции 304.

> **TZ-CATALOG-319:** раньше в docs ошибочно писали «soft delete». Факт кода:
> `ProductModuleService.remove` → `doc.deleteOne()`. Material/Product пишут
> `deletedAt`, но list-фильтр удалённых — тоже зона 314.

## Идентификация модуля (TZ-CATALOG-338)

`article` — обязательный внешний артикул модуля, уникальный в пределах организации. Пустое значение отклоняется с сообщением «Артикул модуля обязателен», а конфликт индекса возвращается с RU-ошибкой «Артикул уже используется». Legacy-строки без артикула остаются читаемыми до backfill; новые create/update их не допускают.

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `QuickCreateDialogComponent` | **create** (TZ-DICT-316) | `{ entity: 'module', size?: 'S'\|'M'\|'L' }` — default M; profile from `/form-profiles` |
| `ModuleFormDialogComponent` | **edit** (FullEditor) | `ProductModule` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `ProductModulesService` | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)`, `getModuleTree(id, maxDepth?)` |
| `ProductModulesService` | `getModuleComposition(id)`, `addModuleCompositionLine(id, dto)`, `updateModuleCompositionLine(id, lineId, dto)`, `removeModuleCompositionLine(id, lineId)` (composition CRUD) |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `pageSig` | `Signal<number>` | Текущая страница (1-indexed) |
| `sortKeySig` | `Signal<'name'\|'article'\|null>` | Ключ сортировки |
| `sortDirSig` | `Signal<'asc'\|'desc'\|null>` | Направление сортировки |
| `search` | `SearchState` | Debounced поиск (300ms) |
| `compositionFilterSig` | `Signal<'all'\|'with-materials'\|'empty'>` | Фильтр «Состав» (client-side, dual-read) — TZ-CATALOG-372 |
| `viewMode` | `Signal<'list'\|'grid'>` | Вид каталога; persistence `pi-modules-view-mode` — TZ-CATALOG-372 |
| `filtersOpen` | `Signal<boolean>` | Оверлей filters-rail — TZ-CATALOG-372 |
| `photosLookup` | `LookupTable<Photo>` | Фото-лукап (PhotosService) — TZ-CATALOG-372 |
| `listRes` | `HttpResource<ProductModule[]>` | GET /api/modules |
| `expandedId` | `Signal<string \| null>` | Развёрнутая строка list — TZ-CATALOG-374 |
| `expandedSection` | `Signal<'composition'>` | Секция tray (задел successor) — TZ-CATALOG-374 |
| `treeCache` / loading / error | maps/sets | Lazy `getModuleTree` cache — TZ-CATALOG-374 |

## Computed chain

```
listRes → data → filteredRows (поиск + «Состав») → sortedRows → paginatedRows
```

## Column definitions (7 колонок)

`photoIds` (Фото, template) → `name` (sticky, sortable, имя-ссылка) → `article` (sortable) → `dimensions` (formatted: W×H×D) → `materials` (count) → `workTypes` (count) → `weight` (Себест., hint «см. карточку»)

## Состав модуля (TZ-CATALOG-320)

Редактор состава допускает `material` и дочерний `module`; текущий модуль исключается из списка. Материал в пикере получает kind-лейбл: сырьё, деталь, метиз, покупное, другое. Каноническая запись идёт через `/modules/:id/composition`; полный lazy CompositionTree остаётся в `TZ-CATALOG-311`.

## Особенности

- **Client-side pagination** — flat array от backend
- **Client-side sort** — только `name` + `article` (sortable), остальное display-only
- **Row-click (list)** → expand tray состава (TZ-CATALOG-374); detail через имя / «Открыть карточку»
- **Dimensions formatter** — `moduleDimensions()`: `W 300 × H 200 × D 50 мм`
- **Sort only by name/article** — materials/workTypes count typesystem-forbidden (key must be `keyof ProductModule`)
- **Lockstep sort signals** — seeded to `name`/`asc`

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-104.3 | Миграция на pi-table (batch-2-B-flat) |
| TZ-104.4.2 | Typed TemplateRef + lockstep sort |
| TZ-CATALOG-319 | Docs: hard-delete Module (не soft) |
| TZ-CATALOG-372 | Витрина как у Продукции: фото, имя-ссылка, toolbar (Состав/Обновить/toggle), filters-rail, grid `PiShowcaseCard` md, `pi-modules-view-mode` |
| TZ-CATALOG-374 | List expandable состав (`expandedId` + `getModuleTree`); detail через имя / «Открыть карточку» |

---

_Создано: 2026-07-19. Обновлено: 2026-08-16 (TZ-CATALOG-374)._
