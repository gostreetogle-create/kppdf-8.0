# Страница: Роли (админ) (`RolesAdminPage`)

**Краткое описание:** админ-реестр ролей с правами (`permissions`) и
страницами (`pages[]` — nav pageKey ACL). CRUD поверх `/admin/roles`.
**Не путать: `User` (аккаунт) ≠ `Worker` (People); FE `admin/*` route — только
UI, API живёт в BE `admin` module; `role:read` ≠ `user:admin`.**

## Route

```
/admin/roles — «KPPDF — Роли»
```

Group Chip TOC: Пользователи | Роли (`ADMIN_TOC_CHIPS`), активный чип `roles`.

## Capabilities gate

- Route `canMatch: capabilityRouteGuard`, `capabilities: ['role:read']`,
  `systemRoles: ['admin']`.
- Кнопки в UI: create/edit — `role:write`, delete — `role:admin`.

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/admin/roles?page&limit&search` | Список (server-side пагинация, PAGE_SIZE=10) |
| POST | `/admin/roles` | Создание роли |
| PATCH | `/admin/roles/:id` | Обновление `{ label, description, permissions, pages }` |
| DELETE | `/admin/roles/:id` | Удаление (пользователи сохраняются, права теряются) |

403 `SYSTEM_ROLE_FROZEN` / `SYSTEM_ROLE_ESCALATION` → «Системные роли доступны
только для чтения».

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `RoleFormDialogComponent` | create / edit / **view** | `RoleFormData { mode, role?, submit }` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant: destructive }` (width sm) |

RU-лейблы прав и summary — из `permission-labels.ru.ts` (`roleLabelRu`,
`permissionsSummary`, `ROLE_FORM_COPY`).

## Services

| Сервис | Методы |
|--------|--------|
| `PiRolesService` | `list({ page, limit, search })` |
| (direct) `HttpClient` + `silent-*` | POST/PATCH/DELETE через `silentPost`/`silentPatch`/`silentDelete` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `roles` | `Signal<AdminRole[]>` | Строки текущей страницы |
| `page` / `total` / `pageSize` | `Signal<number>` | Пагинация (PAGE_SIZE=10) |
| `searchQuery` | `Signal<string>` | Поиск (сброс page → 1) |
| `loading` / `error` | `Signal<boolean>` / `Signal<string\|null>` | Загрузка / ошибка |
| `loadingRowId` | `Signal<string\|null>` | Per-row loading |

`requestVersion` guard отбрасывает устаревшие ответы.

## Computed / templates

| Computed | Назначение |
|----------|-----------|
| `cols` | name (mono, sticky), label (RU), permissions (summary), isSystem (бейдж) |
| rowActions | system → бейдж + «Смотреть» (view); custom → edit/delete |

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-256.B | roles-admin page — полная CRUD-поверхность |
| TZ-ADMIN-301 | Системные роли: RU-бейдж + read-only view; кастомные — edit pages[]+permissions |
| TZ-ADMIN-302 | «Смотреть» у системных показывает полный каталог прав (не пустое `*`) |
| TZ-ADMIN-306 | `/admin` redirect → `/admin/users` |

## Особенности

- Системные роли (`isSystem: true`) **заморожены**: только view; backend
  SystemRoleGuard → 403 (SYSTEM_ROLE_FROZEN / SYSTEM_ROLE_ESCALATION).
- Удаление роли не удаляет пользователей — они теряют связанные права
  (предупреждение в confirm-диалоге).
- Server-side пагинация + search; все HTTP через `silent-*`.

---

_Создано: 2026-08-09. Последнее обновление: 2026-08-09._
