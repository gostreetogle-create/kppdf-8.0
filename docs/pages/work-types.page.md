# Страница: Виды работ (WorkTypesPage)

**Раздел:** **Цех** · sibling `/production` (Гант). Это не страница «Каталог» и не Справочники; виды работ — рабочий справочник производственного планирования и себестоимости.

**Краткое описание:** Виды работ (сварка, покраска, сборка…) с нормативами
часов, **обязательной** ставкой ₽/час и привязкой к рабочему центру / Ганту.
Реестр доступен на `/registries/work-types`; `/work-types` не является отдельным
NX route.

**Studio chrome SoT:** [`production-gantt-studio-spec.md`](../ux/production-gantt-studio-spec.md). `/production` и `/work-types` должны читаться как единый раздел «Цех».

## Route

```
/registries/work-types — «KPPDF — Виды работ» внутри master table реестров
```

## Query params

Нет — всё через сигналы.

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/work-types` | Список (flat array; поиск, сортировка и пагинация — client-side) |
| POST | `/api/work-types` | Создание (`hourlyRate` обязателен, ≥ 0); **auth:** `production:write` |
| PATCH | `/api/work-types/:id` | Обновление (`hourlyRate` обязателен в теле); **auth:** `production:write` |
| DELETE | `/api/work-types/:id` | Архивирование (soft delete); **auth:** `production:write` |

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `WorkTypeFormDialogComponent` | create / edit | `null` / `WorkType` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `PiWorkTypesService` | `list()`, `getById(id)`, `create(payload)`, `update(id, payload)`, `archive(id)` |
| `createWorkTypesRegistryDefinition` | API data source, client filters/sort/pagination and CRUD actions for `/registries/work-types` |

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
| **TZ-PRODUCTION-STUDIO-A** | Wave A docs-only: IA `Цех`, studio chrome SoT |
| **TZ-NX-REGISTRIES-WORK-TYPES** | NX registry CRUD: API list, create/edit and soft archive; typed days/rate/hue/active fields |
| **TZ-NX-MODULE-WT-DAYS-SOT** | «Дней» renamed to «Дней по умолчанию»: this field is only a seed copied into `ProductModule.workTypes[].days` when a module picks the work type. The Gantt duration SoT is the module↔workType binding, not this catalog value; per-module days no longer round-trip back into the catalog. |

---

_Создано: 2026-07-19. Обновлено: 2026-09-05 (TZ-NX-REGISTRIES-WORK-TYPES)._
