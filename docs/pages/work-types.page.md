# Страница: Виды работ (WorkTypesPage)

**Краткое описание:** Каталог видов работ (сварка, покраска, сборка…) с нормативами
часов, **обязательной** ставкой ₽/час и привязкой к рабочему центру / Ганту.
Раздел остаётся в **Каталоге** (не Справочники) — канон cost-аудита 2026-08-08.

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
| POST | `/api/work-types` | Создание (`hourlyRate` обязателен, ≥ 0) |
| PATCH | `/api/work-types/:id` | Обновление (`hourlyRate` обязателен в теле) |
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
- **Колонка «₽/час»** — ставка видна без открытия карточки (TZ-COST-301)
- **Ставка обязательна** в форме (Validators.required + min 0); `0` = явный «бесплатно»
- **isActive switch** — inline toggle → `PATCH` с `isActive` **и** `hourlyRate`
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
| TZ-COST-301 | `hourlyRate` required BE+FE; backfill 0; колонка «₽/час»; Виды работ остаются в Каталоге |

---

_Создано: 2026-07-19. Обновлено: 2026-08-08 (TZ-COST-301)._
