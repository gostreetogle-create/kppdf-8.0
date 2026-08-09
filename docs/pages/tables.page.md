# Страница: Шаблоны таблиц (TablesPage)

**Chrome:** `PiGroupWorkspace` с тёмным TOC `DOCUMENTS_TOC_CHIPS` и жёлтыми под-табами `TABLES_SECTION_CHIPS` (TZ-DOC-TABLES-301).

**Краткое описание:** Конструктор шаблонов таблиц — задают форму колонок, типы данных и форматирование. Используются в шаблонах документов.

## Route

```
/doc-constructor/tables — «KPPDF — Шаблоны таблиц» (view=all по умолчанию)
/doc-constructor/tables?view=all — список всех шаблонов таблиц
/doc-constructor/tables?view=from-data — открыть режим создания из существующих данных
/doc-constructor/tables?editId=<tableTemplateId> — auto-open диалога (из builder, TZ-DOC-335)
```

## Query params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| `editId` | `string` | ID шаблона таблицы — открывает форму редактирования при навигации из конструктора |
| `view` | `all \| from-data` | Активная жёлтая под-вкладка; `from-data` открывает диалог из реестра |

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/table-templates` | Список шаблонов |
| POST | `/api/table-templates` | Создать |
| PATCH | `/api/table-templates/:id` | Обновить |
| DELETE | `/api/table-templates/:id` | Удалить |

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `TableTemplateFormDialogComponent` | create / edit (new) | `null` / `TableTemplate` |
| `TableTemplateFormDialogComponent` | create from registry | `{ mode: 'from-registry' }` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `TableTemplatesService` | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)`, `duplicate(id)` |
| `RegistryService` | для режима «из существующих данных» |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `search` | `Signal<string>` | Поиск (мгновенный) |
| `sort` | `createSortState<'name'\|'category'\|'sortOrder'>` | Сортировка |
| `listRes` | `HttpResource<TableTemplate[]>` | GET /api/table-templates |

## Особенности

- **Pi page chrome (TZ-DOC-336)** — `PiPageHeader` + `PiToolbar` + `PiSection` + `PiEmptyState` + `PiRowActions`
- **`app-pi-table`** — shared Flat kit with typed columns, active-state cell template, row actions and kit-consistent loading/empty behavior
- **Inline search** — без debounce, мгновенный фильтр
- **Yellow subchips (TZ-DOC-TABLES-301)** — «Все таблицы» (`view=all`) и «Из данных» (`view=from-data`); CTA «+ Новая таблица» остаётся только на `view=all`, а `from-data` открывает registry dialog
- **Dialog selectors (TZ-DOC-TABLES-302)** — источник и тип столбца используют `app-pi-overflow-select` с overlay; native `<select>` в диалоге не используется; поля registry показываются читаемыми строками с явным empty state
- **Product registry fields (TZ-DOC-TABLES-303)** — Product exposes schema-backed print fields (notes, status, RAL, dimensions, purpose, installation, flags) and `photoIds` as the current text photo-slot binding
- **Registry auto-sync (TZ-DOC-TABLES-304)** — Product fields are derived from `ProductSchema.paths` with an explicit deny-list, RU label overrides/fallback, deterministic scalar type mapping, and an explicit entity-source allowlist
- **Copy** — `PiRowActions` `(copy)` / `copyLabel` (не hand-rolled icon)
- **isActive switch** — `<app-pi-switch>` inline
- **Category labels** — readable Russian
- **editId deep-link (TZ-DOC-335)** — `?editId=` auto-opens edit dialog, then clears query
- **Dialog FormField canon (TZ-DOC-336)** — name/description/sortOrder/source via FormField+Input; isActive via pi-switch; без promo aside

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-86 | Первая реализация + registry mode |
| TZ-DOC-TABLES-301 | Documents dark TOC + table yellow subchips; `view=all\|from-data` |
| TZ-DOC-TABLES-302 | Overflow-select dialog controls + readable registry field empty state |
| TZ-DOC-TABLES-303 | Product schema-backed registry fields + `photoIds` text slot |
| TZ-DOC-TABLES-304 | Product field auto-sync from schema paths with deny-list and label/type policy |
| TZ-DOC-335 | `editId` queryParam auto-open from builder |
| TZ-DOC-336 | Pi shell; remove promo; copy slot; dialog FormField/Switch |

---

_Создано: 2026-07-19. Обновлено: 2026-08-02 (DOC-336)._
