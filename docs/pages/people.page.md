# «Люди» — Workers registry (TZ-NX-REGISTRIES-WORKERS)

**Route:** `/registries/workers`
**pageKey:** `workers` (строка внутри NX master table `/registries`)
**Layer:** 2 (frontend-nx)
**API:** `GET/POST/PATCH/DELETE /api/workers` (TZ-WORKERS-301)

## Описание

Единый реестр людей поверх сущности `Worker`: ФИО (`lastName` /
`firstName` / `patronymic`), должность, отдел, email, телефон, notes,
isActive и навыки `workTypeIds[]`. Реестр «Люди» находится в разделе
**Цех** и является источником правды для подписей исполнителей на Ганте.

Отдельный NX route `/people` не добавляется: существующие production-ссылки
ведут на `/registries/workers`, без дублирования legacy-страницы.

## Колонки

| Колонка | Источник |
|---------|----------|
| ФИО | `personDisplayName(lastName, firstName, patronymic)` |
| Должность | `position` |
| Отдел | `department` |
| Статус | `isActive` |
| Виды работ | `workTypeIds.length` |

Пагинация и фильтры выполняются сервером: `page`, `limit` (не более 100),
`search`, `isActive`.

## Диалог

`WorkerFormDialogComponent` использует page-scoped `parentDestroyRef`.
Фамилия и имя обязательны; доступны отчество, должность, отдел, email,
телефон, заметки и активность. Чекбоксы `workTypeIds[]` загружаются из
`PiWorkTypesService.list({ activeOnly: true })` и передаются в Worker API без
потери выбранных навыков. Create/edit защищены double-submit guard; удаление
через реестр — soft archive с подтверждением.

## Gantt integration

`ProductionReadFacade` читает активных людей через `PiPeopleService` и строит
map `workTypeId → personDisplayName[]`. Поэтому человек с навыком «Сварка»
остаётся доступен в лейблах Ганта после reload/refresh. Баннер «Без исполнителя»
ссылается на `/registries/workers` и не приводит к 404.

## Files

```
frontend-nx/apps/kppdf-web/src/app/pages/registries/data/workers.registry.ts
frontend-nx/apps/kppdf-web/src/app/pages/registries/data/workers-http-data-source.ts
frontend-nx/apps/kppdf-web/src/app/pages/registries/data/worker-registry-actions.ts
frontend-nx/apps/kppdf-web/src/app/pages/registries/data/worker-registry-dialog-host.ts
frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/worker-form-dialog.component.ts
frontend-nx/libs/data-access/src/lib/people/pi-people.service.ts
frontend-nx/libs/data-access/src/lib/people/person.types.ts
```

## API contract

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/workers` | Server-paged list; `search`, `isActive`, `supplierId`, `workTypeId` |
| GET | `/api/workers/:id` | Полная запись перед edit |
| POST | `/api/workers` | Создание; `lastName`, `firstName`, `workTypeIds[]` |
| PATCH | `/api/workers/:id` | Обновление, включая `workTypeIds[]` |
| DELETE | `/api/workers/:id` | Soft-delete; manager/admin |

## History

- **TZ-UX-306 / WORKERS-302.FOLLOWUP** — legacy `/people` page and initial worker form.
- **TZ-NX-REGISTRIES-WORKERS (2026-09-05)** — NX API-backed registry, CRUD dialog, skills selection, and Gantt deep-link correction.

---

_Обновлено: 2026-09-05 (TZ-NX-REGISTRIES-WORKERS)._
