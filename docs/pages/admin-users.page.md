# Страница: Пользователи (админ) (`UsersAdminPage`)

**Краткое описание:** админ-реестр аккаунтов (login/пароль/роль/активность).
Полная поверхность мутаций: create / edit / activate / deactivate /
reset-password / delete с confirmation-диалогами. **Не путать: `User`
(аккаунт/логин) ≠ `Worker` (People, сотрудник цеха); FE `admin/*` route —
это только UI, API живёт в BE `admin` module.**

## Route

```
/admin/users — «KPPDF — Пользователи»
```

Group Chip TOC: Пользователи | Роли (`ADMIN_TOC_CHIPS`), активный чип `users`.
`/admin` (bare) → redirect на `/admin/users` (TZ-ADMIN-306).

## Capabilities gate

- Route `canMatch: capabilityRouteGuard`, `capabilities: ['user:admin']`,
  `systemRoles: ['admin']` — зеркалит BE `GET /api/admin/users`.
- `user:read` зарезервирован для self-service и **не** проходит гейт → /forbidden
  (TZ-262).
- Кнопки в UI дополнительно скрыты по `caps.hasAny(...)`: create/toggle/edit —
  `user:write`, reset-password/delete — `user:admin`.

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/admin/users?page&limit&search` | Список (server-side пагинация, PAGE_SIZE=10) |
| POST | `/admin/users` | Создание (username/password/role/isActive/email/displayName) |
| PATCH | `/admin/users/:id` | Редактирование (username/role/isActive/email/displayName) |
| POST | `/admin/users/:id/activate` · `/deactivate` | Активация / деактивация |
| POST | `/admin/users/:id/reset-password` | Сброс пароля `{ newPassword }` |
| DELETE | `/admin/users/:id` | Удаление |

403 `LAST_ADMIN_INVARIANT` → «Нельзя удалить/понизить последнего админа».

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `UserFormDialogComponent` | create / edit | `UserFormData { mode, user?, submit }` |
| `ResetPasswordDialogComponent` | reset | `{ username, submit }` |
| `AlertDialogComponent` | confirm activate/deactivate/delete | `{ title, description, confirmLabel, variant }` (width sm) |

## Services

| Сервис | Методы |
|--------|--------|
| `PiUsersService` | `list({ page, limit, search })` |
| (direct) `HttpClient` + `silent-*` | POST/PATCH/DELETE мутации через `silentPost`/`silentPatch`/`silentDelete` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `users` | `Signal<AdminUser[]>` | Строки текущей страницы |
| `page` / `total` / `pageSize` | `Signal<number>` | Пагинация (PAGE_SIZE=10) |
| `searchQuery` | `Signal<string>` | Поиск (сброс page → 1) |
| `loading` / `error` | `Signal<boolean>` / `Signal<string\|null>` | Загрузка / ошибка |
| `loadingRowId` | `Signal<string\|null>` | Per-row loading (мутации) |

`requestVersion` guard отбрасывает устаревшие ответы при быстрых поисках.

## Computed / templates

| Computed | Назначение |
|----------|-----------|
| `cols` | username (sticky), displayName, email, role (mono), isActive (да/нет) |
| rowActions | reset ⚿, toggle ⏸/▶, edit/delete (по capabilities) |

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-257.A.1 §5 | users-admin page — полная поверхность мутаций |
| TZ-262 | Capability-гейт выровнен с backend (`user:admin`) |
| TZ-ADMIN-306 | `/admin` redirect → `/admin/users` |

## Особенности

- Server-side пагинация + search; все HTTP через `silent-*` (4xx без шума в RxJS).
- Сброс пароля не требует старого пароля (админ-операция, `user:admin`).
- 403 LAST_ADMIN_INVARIANT мапится в человекочитаемое сообщение.

---

_Создано: 2026-08-09. Последнее обновление: 2026-08-09._
