# /people — «Люди» (TZ-UX-306 / WORKERS-302.FOLLOWUP)

**Route:** `/people`  
**pageKey:** `people` (seeded in admin/manager/user)  
**Layer:** 3 (frontend)  
**API:** `GET/POST/PATCH/DELETE /api/workers` (TZ-WORKERS-301)

## Описание

Единый справочник людей поверх сущности `Worker`: ФИО (`lastName` /
`firstName` / `patronymic`), должность, отдел, email, телефон, notes,
isActive.

## Колонки

| Колонка | Источник |
|---------|----------|
| ФИО | `personDisplayName(lastName, firstName, patronymic)` |
| Должность | `position` |
| Email | `email` |
| Активен | `isActive` (inline switch) |

## Диалог

PiDialog `width=lg`, `parentDestroyRef` обязателен. Поля: ФИО, должность,
отдел, email, телефон, заметки, активен. Double-submit guard.

## Файлы

```
frontend/src/app/pages/people/people.page.ts
frontend/src/app/pages/people/people-form-dialog.component.ts
frontend/src/app/shared/services/pi-workers.service.ts
frontend/src/app/app.routes.ts
frontend/src/app/layout/app-layout.component.ts
```

## Известные ограничения

- supplierId / workTypeIds / ratePerHour не в форме Phase 1 (можно добавить
  successor-TZ).
- List limit=100 client-side; server pagination envelope уже есть.
