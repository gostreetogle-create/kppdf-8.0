# Страница: Склады (WarehousesPage) + форма (WarehouseFormDialogComponent)

**Краткое описание:** Реестр складов цеха (W1 READY gate): создание / переименование / тип / зоны / активность. Тип — фиксированная классификация (как status), не справочник для переименования.

## Route

```
/warehouses — «KPPDF — Склады»
```

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/warehouses` | Список складов |
| POST | `/api/warehouses` | Создать склад |
| PATCH | `/api/warehouses/:id` | Обновить склад |
| DELETE | `/api/warehouses/:id` | Удалить склад |

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `WarehouseFormDialogComponent` | create / edit | `null` / `Warehouse` |
| `AlertDialogComponent` | confirm delete | `{ title, message, confirmLabel, variant: destructive }` |

## Services

| Сервис | Методы |
|--------|--------|
| `WarehousesService` | `list()`, `create()`, `update()`, `remove()` (silent-http) |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `searchQuery` | `Signal<string>` | Клиентский поиск по названию |
| `listRes` | `HttpResource<Warehouse[]>` | GET /api/warehouses |
| `filtered` | `computed` | Фильтр по `searchQuery` (lowercase includes) |

## Поля формы (create/edit)

| Поле | Контрол | Примечание |
|------|---------|-----------|
| Название | `name` | required, max 128 |
| Тип | `type` | select из `WAREHOUSE_TYPES`; **default create = `main`** (совпадает с BE); RU-подсказка под полем |
| Адрес | `address` | опционально |
| Зоны | `zonesText` | строка «через запятую: А, Б», парсится в `zoneNames` |
| Описание | `description` | опционально, max 512 |
| Активен | `isActive` | switch |

## Особенности

- **Тип склада — фиксированная классификация** (TZ-WAREHOUSE-UX-301): `main / production / branch / transit / other`; не редактируемый словарь типов; поле нужно для CRUD-schema и будущих подписей/workshop ACL
- **RU-подсказка** под `type`: «Основной — главный склад; Производство/цех — запасы в цехе; Транзит — перевалочная точка; Филиал — удалённый склад; Другой — прочее. На движения не влияет.»
- **Табличные labels** — `TYPE_LABELS`: Производство / Основной / Филиал / Транзит / Другой
- Client-side поиск; delete с confirm-диалогом; OnPush + signals

## TZ reference

| TZ | Что сделано |
|----|------------|
| Warehouse pack B | Реестр CRUD (W1) |
| **TZ-WAREHOUSE-UX-301** | **Default type=main + RU hint под полем type; page doc создан** |

---

_Создано: 2026-08-06 (TZ-WAREHOUSE-UX-301)._
