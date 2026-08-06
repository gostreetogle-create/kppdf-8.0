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
| DELETE | `/api/modules/:id` | Hard delete модуля (см. modules.page.md) |
| GET | `/api/product-module-photos?productModuleId=` | Список фото модуля |
| POST | `/api/product-module-photos` | Привязать фото (`productModuleId`, `photoId` / url) |
| POST | `/api/product-module-photos/:id/main` | Сделать главным |
| PATCH | `/api/product-module-photos/:id` | Обновить метаданные (не isMain) |
| DELETE | `/api/product-module-photos/:id` | Отвязать/удалить запись фото |

> **TZ-CATALOG-319:** старые пути `/api/modules/:id/photos*` в коде **нет**.
> Живой API — коллекция `ProductModulePhoto` + `ProductModulePhotosService`
> → `/product-module-photos`. Унификация с `photoIds` на Product/Material — **313**.


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

## Состав модуля (TZ-CATALOG-320)

Редактор состава (dialog «Состав модуля») умеет **материал + дочерний модуль**, RU kind на материалах, self-id родителя недоступен. Save — composition API.

## Дерево состава (TZ-CATALOG-311)

Секция состава использует общий `CompositionEditor`: `GET /modules/:id/tree?maxDepth=8` строит вложенное дерево module/material, а quick-edit добавляет, изменяет количество и удаляет линии через существующий composition API. Product-линии для модуля недоступны; material-узлы показывают русские kind labels. При глубине более 5 отображается предупреждение, ошибки depth/cycle/self-reference не замалчиваются.

Полный hard limit дерева — 8 уровней (`tasks/TZ-CATALOG-300.md` §3.1); cost/mass rollup и order snapshot остаются вне scope.

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
| TZ-CATALOG-319 | Docs: photo API → `/product-module-photos` |

---

_Создано: 2026-07-19. Обновлено: 2026-08-06 (TZ-CATALOG-320)._
