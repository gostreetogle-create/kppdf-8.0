# Страница: Категории текстовых блоков (`TextBlockCategoriesPage`)

**Краткое описание:** плоский справочник категорий текстовых блоков (CRUD через
`/text-block-categories`). Питает select категории в редакторе блока и фильтр
реестра на `/doc-constructor/texts`. Отличается и от дерева `/categories`, и от
`DocumentTemplateCategory` (TZ-DOC-308).

## Route

```
/dictionaries/text-block-categories — «KPPDF — Категории текстов»
```

Группа: TOC «Справочники» → группа `documents-ref` → чип `text-blocks`
(`DICTIONARY_TOC_CHIPS` + `DOCUMENTS_REF_CHIPS`). Соседний чип → категории шаблонов.

## Query params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| — | — | (none — всё через сигналы; search — только input) |

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/text-block-categories?activeOnly&search&parentId&rootsOnly` | Список; `rootsOnly=true` — только корневые, `parentId=<rootId>` — только подкатегории этого корня |
| GET | `/text-block-categories/:id` | Одна категория |
| POST | `/text-block-categories` | Создание (`parentId?` — делает подкатегорией) |
| PATCH | `/text-block-categories/:id` | Редактирование / `isActive` / `parentId` |
| DELETE | `/text-block-categories/:id` | Удаление (в использовании ИЛИ есть подкатегории → 409) |

Контракт ошибок (BE TZ-DOC-315): 409 — дубль slug / системная / в использовании /
есть подкатегории; 403 — IDOR (чужая org); 404 — нет id / нет родителя; 400 —
невалидный slug / неактивная / глубина>1 (`parentId` подкатегории) / `isDefault`
на подкатегории.

**Дерево (TZ-NX-TEXT-CAT-PARENT, 2026-09-11):** `parentId?` — undefined/null = корневая
категория; заполнено = подкатегория. Глубина ограничена **одним уровнем**: родитель
подкатегории обязан сам быть корневой (его `parentId` — null), иначе 400. `isDefault`
поддерживается только на корневых категориях. `TextBlock.categoryId` теперь обязан
указывать на **лист** (подкатегорию) — `assertAssignable` отклоняет корневые id
400-й; при создании TextBlock без `categoryId` — 400 «Укажите подкатегорию» (больше
не молчаливый fallback на «Общее»). Существующие TextBlock, у которых `categoryId`
всё ещё указывает на корень — читаются как есть (без миграции); следующее
редактирование обязано перенести их на лист. NX CRUD для дерева — `TZ-NX-TEXT-CAT-NX-CRUD`
(следующий TZ волны); эта страница пока описывает **legacy** реализацию
(`TextBlockCategoriesService`/`TextBlockCategoryFormDialogComponent` ниже), NX route
`/dictionaries/text-block-categories` появится в следующем TZ.

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `TextBlockCategoryFormDialogComponent` | create / edit | `null` / `TextBlockCategory` (width md) |
| `AlertDialogComponent` | confirm delete | `{ title, message, confirmLabel, variant: destructive }` |

## Services

| Сервис | Методы |
|--------|--------|
| `TextBlockCategoriesService` | `list({activeOnly, search})`, `findById()`, `create()`, `update()`, `remove()` |

Кэш: только `activeOnly`-каталог (для пикеров) кэшируется; словарные/search —
свежие. In-flight dedup через `share()` (не shareReplay), кэш — Map с generation.

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `items` | `Signal<TextBlockCategory[]>` | Полный список с сервера |
| `loading` | `Signal<boolean>` | Загрузка |
| `error` | `Signal<string\|null>` | extractErrorMessage |
| `searchQuery` | `Signal<string>` | Поиск по name **или** slug |
| `visible` | `Computed<...>` | sortOrder → name (ru), фильтр |

## Computed / templates

| Computed | Назначение |
|----------|-----------|
| `visible` | Сортировка `sortOrder` + `localeCompare(ru)`, фильтр name/slug |
| `totalLabel` | «N из M категорий» (родительный падеж, pluralGenitive) |

Колонки pi-table: `name` (бейджи «системная» / «по умолчанию»), `slug` (mono),
`description`, `isActive` (switch, disabled у системных). Empty/loading/error —
через `PiEmptyStateComponent`.

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-DOC-316 | Первая реализация справочника (page + service) |
| TZ-DOC-315 | Backend-контракт `/text-block-categories` |
| TZ-DOC-334 | Route + nav (page из DOC-316) |
| TZ-DICT-307 / DICT-310 | Group Chip Workspace (documents-ref, чип «Категории текстов») |
| TZ-UX-304 | pi-table column definitions |

## Особенности

- Системные категории («Общее»): `isSystem` — показаны, но **не** edit/delete
  (UI disable + backend 409).
- Удаление категории, используемой блоками → 409 (подсказка в deleteTitle).
- Клиентская сортировка/поиск; пагинации нет (список маленький).
- Кэш активного каталога инвалидируется только успешными мутациями.

---

_Создано: 2026-08-09. Последнее обновление: 2026-08-09._
