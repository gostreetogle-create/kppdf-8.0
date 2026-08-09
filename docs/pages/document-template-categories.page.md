# Страница: Категории шаблонов документов (`DocumentTemplateCategoriesPage`)

**Краткое описание:** плоский справочник категорий для шаблонов документов
(CRUD через `/document-template-categories`). Питает выпадающий список категорий
в диалоге настройки шаблона и фильтр реестра шаблонов. Это **не** дерево
`/categories` (материалы/изделия) и **не** TableTemplate.

## Route

```
/doc-template-categories — «KPPDF — Категории шаблонов»
```

Группа: TOC «Справочники» → группа `documents-ref` → чип `doc-templates`
(`DICTIONARY_TOC_CHIPS` + `DOCUMENTS_REF_CHIPS`). Соседний чип → категории текстов.

## Query params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| — | — | (none — всё через сигналы; search — только input) |

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/document-template-categories?activeOnly&search` | Список; `activeOnly=true` — только активные (кэш) |
| GET | `/document-template-categories/:id` | Одна категория |
| POST | `/document-template-categories` | Создание |
| PATCH | `/document-template-categories/:id` | Переименование / `isActive` / `isDefault` |
| DELETE | `/document-template-categories/:id` | Удаление (в использовании → 409) |

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `DocumentTemplateCategoryFormDialogComponent` | create / edit | `null` / `DocumentTemplateCategory` (width md) |
| `AlertDialogComponent` | confirm delete | `{ title, message, confirmLabel, variant: destructive }` |

## Services

| Сервис | Методы |
|--------|--------|
| `DocumentTemplateCategoriesService` | `list({activeOnly, search})`, `findById()`, `create()`, `update()`, `remove()` |

Кэш: только `activeOnly`-каталог (стабильный, для template setup) кэшируется на
время жизни приложения; словарные/search-запросы всегда свежие. Успешная мутация
инвалидирует кэш (generation-guard, shareReplay).

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `items` | `Signal<DocumentTemplateCategory[]>` | Полный список с сервера |
| `loading` | `Signal<boolean>` | Загрузка |
| `error` | `Signal<string\|null>` | extractErrorMessage |
| `searchQuery` | `Signal<string>` | Текстовый поиск (input) |
| `visible` | `Computed<...>` | sortOrder → name (ru), фильтр по name |

## Computed / templates

| Computed | Назначение |
|----------|-----------|
| `visible` | Сортировка `sortOrder` + `localeCompare(ru)`, фильтр по названию |
| `totalLabel` | «N из M категорий» (родительный падеж, pluralGenitive) |

Колонки pi-table: `name` (sticky left, бейдж «системная»), `slug` (mono),
`isActive` (switch, disabled у системных), `isDefault` (★/☆).

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-DOC-308 | Первая реализация справочника (page + service) |
| TZ-DICT-307 / DICT-310 | Group Chip Workspace (documents-ref, чип «Категории шаблонов») |
| TZ-UX-304 | pi-table column definitions вместо raw `<table>` |

## Особенности

- Системные категории («Общее», seed-managed): `isSystem` — показаны, но **не**
  edit/delete (UI disable + backend 409).
- Удаление категории, используемой шаблонами → 409 (подсказка в deleteTitle).
- Клиентская сортировка/поиск; server-side пагинации нет (список маленький).
- Search и реестр шаблонов ходят в свежий GET; активный каталог — из кэша.

---

_Создано: 2026-08-09. Последнее обновление: 2026-08-09._
