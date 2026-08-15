# Страница: Виды работ (WorkTypesPage)

**Раздел:** **Цех** · sibling `/production` (Гант). Это не страница «Каталог» и не Справочники; виды работ — рабочий справочник производственного планирования и себестоимости.

**Краткое описание:** Виды работ (сварка, покраска, сборка…) с нормативами
часов, **обязательной** ставкой ₽/час и привязкой к рабочему центру / Ганту.
В Wave A меняется только IA-документация; CRUD и product-код не меняются.

**Studio chrome SoT:** [`production-gantt-studio-spec.md`](../ux/production-gantt-studio-spec.md). `/production` и `/work-types` должны читаться как единый раздел «Цех».

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
| POST | `/api/work-types` | Создание (`hourlyRate` обязателен, ≥ 0); **auth:** `production:write` |
| PATCH | `/api/work-types/:id` | Обновление (`hourlyRate` обязателен в теле); **auth:** `production:write` |
| DELETE | `/api/work-types/:id` | Удаление (soft delete); **auth:** `production:write` |

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
| TZ-COST-301 | `hourlyRate` required BE+FE; backfill 0; колонка «₽/час»; Виды работ принадлежат разделу **Цех** |
| **TZ-PRODUCTION-STUDIO-A** | Wave A docs-only: IA `Цех`, studio chrome SoT; CRUD не меняется |

---

_Создано: 2026-07-19. Обновлено: 2026-08-08 (TZ-COST-301)._
