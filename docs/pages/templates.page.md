# Страница: Реестр шаблонов (TemplatesPage)

**Краткое описание:** Реестр шаблонов документов. Создание, дублирование, настройка активности, переход в конструктор.

## Route

```
/doc-constructor/templates — «KPPDF — Реестр шаблонов»
```

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/document-templates?categoryId=` | Список шаблонов (фильтр по категории через `categoryId`) |
| POST | `/api/document-templates` | Создать шаблон |
| PATCH | `/api/document-templates/:id` | Обновить (isActive) |
| DELETE | `/api/document-templates/:id` | Удалить |
| POST | `/api/document-templates/:id/duplicate` | Дублировать |
| POST | `/api/document-templates/:id/set-default` | Сделать шаблоном по умолчанию |
| GET | `/api/organizations?limit=1` | Получить первую организацию (для создания) |
| GET | `/api/doc-types` | Список типов документов |

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `AlertDialogComponent` | confirm delete | `{ title, message, confirmLabel, variant }` |
| `TemplateSetupDialogComponent` | create / duplicate | `{ mode: 'create' \| 'duplicate' }` — результат `{ pageSize, orientation, categoryId }` |

## Services

| Сервис | Методы |
|--------|--------|
| `DocumentTemplatesService` | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)`, `duplicate(id)` |
| `DocumentTemplateCategoriesService` | `list({ activeOnly })`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `items` | `Signal<DocumentTemplate[]>` | Список (через RxJS subscribe) |
| `searchQuery` | `Signal<string>` | Поиск (мгновенный) |
| `pageIndex` | `Signal<number>` | Пагинация (0-indexed) |
| `creating` | `Signal<boolean>` | Флаг создания |
| `loading` | `Signal<boolean>` | Флаг загрузки |
| `categoryId` | `Signal<string \| null>` | Фильтр реестра по категории шаблона |

## Особенности

- **Inline `<table>`** — НЕ pi-table, кастомная таблица
- **Client-side pagination** — pageSize = 10
- **Create flow** — forkJoin: org + docType → create → navigate to builder
- **Duplicate** — POST /duplicate → navigate to builder
- **isActive switch** — inline toggle + optimistic update
- **Default star** — ★ (активен) / ☆ (кнопка для set-default)
- **Doc type resolution** — `docTypeName()`: populated object or '—'
- **RxJS subscription** — manual subscribe (не httpResource)
- **Category column** — отображает имя категории (populated `categoryId`); «—» если нет
- **Category filter** — `<select>` активных категорий из `DocumentTemplateCategoriesService`; фильтр уходит в API `categoryId`
- **Setup dialog (create/duplicate)** — обязательный выбор категории; активная default-категория подставляется автоматически; неактивные не отображаются; без валидной `categoryId` submit заблокирован
- **Duplicate** — сохраняет исходную `categoryId` исходного шаблона (сервер валидирует; fallback на default)

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-86 | Первая реализация (Phase D) |
| TZ-DOC-308 | Категория шаблона: колонка в реестре, фильтр по категории, выбор категории в setup-диалоге (default auto-select, required, duplicate сохраняет категорию) |

---

_Создано: 2026-07-19._
