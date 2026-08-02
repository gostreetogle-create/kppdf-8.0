# /people — «Люди» (TZ-WORKERS-302)

**Route:** `/people`
**Capability gate:** `material:read` (новое использование готового ключа — поскольку /people используется для владельцев материалов без admin role)
**Layer:** 3 (frontend)
**Source-of-truth:** `tasks/TZ-WORKERS-302-people-page-and-person-card.md`

## Описание

Каталог «Люди» хранит сотрудников, контактных лиц, привязанных к поставщикам. Это единая сущность для всего проекта — продавцы, проектировщики, контактные лица организаций живут здесь.

Используется в карточках:
- Материалов (владелец)
- Поставщиков (контактное лицо)
- Заказов (ответственный)
- Документов (автор)

## Колонки таблицы

| Колонка | Тип | Источник |
|---|---|---|
| Имя | string | `Person.name` |
| Должность | string | `Person.position` |
| Email | string | `Person.email` |
| Активен | bool | `Person.isActive` |

## Фильтры

- Поиск по `name + email + position` (case-insensitive)
- Только активные (`activeOnly=true`) — дефолт `true`

## Диалог редактирования

Содержимое: content-диалог 1000px (по Paper & Ink DSL), секции:

| Секция | Поля |
|---|---|
| Основное | `name` (required, 2–120), `email` (optional, ≤120), `position` (optional, ≤120) |
| Заметки | `notes` (optional, ≤500) |

Footer: «Отмена» + «Сохранить» (double-submit guard).

## Сервисы

| Сервис | Backend endpoint | Назначение |
|---|---|---|
| `PiWorkersService.list(activeOnly?, supplierId?, q?)` | `GET /api/workers` | Список с фильтрами |
| `PiWorkersService.get(id)` | `GET /api/workers/:id` | Одна запись |
| `PiWorkersService.create(payload)` | `POST /api/workers` | Создать |
| `PiWorkersService.update(id, patch)` | `PATCH /api/workers/:id` | Частичное обновление |
| `PiWorkersService.remove(id)` | `DELETE /api/workers/:id` | Soft-delete |

## Известные ограничения

- Backend `/api/workers` endpoint зависит от TZ-WORKERS-301 (предполагался closed в архиве, но на момент этой реализации фактическая дисковая реплика пустая). Frontend готов; backend stub остаётся отдельной TZ-WORKERS-301 follow-up задачей.
- При запуске без backend — list вернёт 404, форма save рейзит error toast (нельзя создать запись). Navigation работает.
- WerckerEditor / WorkTypeIntegration не в этом TZ — будут в TZ-WORKTYPES-301/302.

## Files

```
frontend/src/app/pages/people/people.page.ts                              (page)
frontend/src/app/pages/people/people-form-dialog.component.ts             (dialog)
frontend/src/app/shared/services/pi-workers.service.ts                    (service)
frontend/src/app/shared/services/pi-workers.service.spec.ts               (service spec)
frontend/src/app/app.routes.ts                                            (route added)
frontend/src/app/layout/app-layout.component.ts                           (nav entry added)
docs/pages/people.page.md                                                 (this file)
```
