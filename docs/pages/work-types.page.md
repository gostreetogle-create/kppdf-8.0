# Страница: Виды работ (WorkTypesPage)

**Краткое описание:** Справочник видов работ (сварка, покраска, сборка...) с нормативами часов, ставкой и привязкой к рабочему центру.

## Route

```
/work-types — «KPPDF — Виды работ»
```

## Query params

Нет — всё через сигналы.

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/work-types` | Список (flat array) |
| PATCH | `/api/work-types/:id` | Обновление (isActive toggle) |
| DELETE | `/api/work-types/:id` | Удаление (soft delete) |

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `WorkTypeFormDialogComponent` | create / edit | `null` / `WorkType` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `WorkTypesService` | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `sort` | `SortState<'name'\|'section'\|'department'\|'hourlyRate'\|'days'>` | Клиентская сортировка |
| `searchQuery` | `Signal<string>` | Поиск (без debounce, через `createClientSearchState`) |
| `listRes` | `HttpResource<WorkType[]>` | GET /api/work-types |

## Особенности

- **`app-pi-table`** + client-side search/sort/paginate (flat array с бэка)
- **isActive switch** — inline toggle → `PATCH /api/work-types/:id`
- **Цвет на Ганте (`accentHue`)** — пресеты в форме; OKLCH на полосках кокпита
  (`workTypeOklch`). После смены цвета обновить страницу Производства (каталог
  видов в facade кэшируется до reload).
- **Диалог:** кнопка «Сохранить» в footer вызывает `(click)="onSubmit()"` —
  она **вне** `<form>`, поэтому `type="submit"` не срабатывает (баг 2026-08-07).

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-83 | Первая реализация |
| TZ-PRODUCTION-302 | Поле `days` (календарные дни) — schema/DTO/service + FE-диалог + колонка «Дней»; >0 или null (stuck path) |
| — | `accentHue` для цвета на Ганте; фикс Save вне form (2026-08-07) |

---

_Создано: 2026-07-19. Обновлено: 2026-08-02 (TZ-PRODUCTION-302)._
