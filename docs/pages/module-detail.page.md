# Страница: Детали модуля (ModuleDetailPage)

**Краткое описание:** Детальная карточка модуля продукции с 4 секциями: основное, фотогалерея, материалы, виды работ.

## Route

```
/modules/:id — «KPPDF — Модуль»
```

## Route params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| `id` | `string` | MongoDB ObjectId модуля |

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/modules/:id` | Детали модуля (populated materials + workTypes) |
| DELETE | `/api/modules/:id` | Удаление модуля |
| GET | `/api/modules/:id/photos` | Список фото |
| PUT | `/api/modules/:id/photos/:photoId/main` | Установить главное фото |
| DELETE | `/api/modules/:id/photos/:photoId` | Удалить фото |
| POST | `/api/modules/:id/photos` | Добавить фото по URL |

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `ModuleFormDialogComponent` | edit | `ProductModule` |
| `ModuleMaterialsFormDialogComponent` | edit materials | `{ moduleId, materials }` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `ProductModulesService` | `findById(id)`, `remove(id)` |
| `ProductModulePhotosService` | `list(moduleId)`, `attach(payload)`, `setMain(photoId)`, `remove(photoId)` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `id` | `Signal<ParamMap>` | Route param `id` |
| `moduleRes` | `HttpResource<ProductModule>` | GET /api/modules/:id |
| `module` | `computed<ProductModule\|null>` | `moduleRes.value()` |
| `photos` | `Signal<ProductModulePhoto[]>` | Фото (загружается через `reloadPhotos()`) |

## Секции страницы

| # | Секция | Eyebrow | Контент |
|---|--------|---------|---------|
| I | Основное | I | name, article, dimensions (W/H/D), weight, sortOrder |
| II | Фотогалерея | II | Сетка фото с isMain, setMain, remove, add by URL |
| III | Материалы | III | Таблица материалов, габариты-override, isPurchased |
| IV | Виды работ | IV | Таблица workTypes с estimatedHours и sortOrder |

## Особенности

- **httpResource с route param** — `idString` computed → GET /api/modules/:id
- **Inline `<table>`** — custom таблицы для материалов и видов работ (не pi-table)
- **Фото:** отдельный сигнал `photos`, загружается через `reloadPhotos()` при mount
- **Populated поля:** `materialId` и `workTypeId` могут быть string (unpopulated) или объект (populated)
- **Материалы editor:** `ModuleMaterialsFormDialogComponent` (широкий `xl`)
- **Delete:** после удаления → навигация `/modules`
- **Back button:** `router.navigate(['/modules'])`

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-83 | Первая реализация (Phase C) |

---

_Создано: 2026-07-19._
