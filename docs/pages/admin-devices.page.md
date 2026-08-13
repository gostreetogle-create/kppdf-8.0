# Страница: Устройства (админ) (`DevicesAdminPage`)

**Краткое описание:** список именованных компьютеров (устройства-аккаунты,
TZ-AUTH-303), создание одноразовой regular-ссылки с заранее выбранной
активной ролью, owner-only «Добавить мой компьютер» (15 минут, password
step-up), изменение роли/срока и отзыв конкретного компьютера.

## Route

```
/admin/devices — «KPPDF — Устройства»
```

Group Chip TOC: Устройства | Пользователи | Роли (`ADMIN_TOC_CHIPS`),
активный чип `devices`.

## Capabilities gate

- Route `canMatch: capabilityRouteGuard`, `capabilities: ['user:admin']`,
  `systemRoles: ['admin']` — зеркалит BE `GET /api/admin/devices`
  (`@Permissions('user:admin')` + `@Roles('admin')`).
- pageKey переиспользуется `admin-users` (страница устройств — часть той же
  admin page-ACL; отдельный backend PAGE_KEY не вводился).
- Кнопка «Создать ссылку» — по `caps.hasAny(['user:admin'])`.

## Владелец (TZ-AUTH-306/303)

- «Добавить мой компьютер» видна ТОЛЬКО владельцу (`auth.isOwner()`).
  Диалог запрашивает текущий пароль владельца (step-up) → одноразовая
  ссылка на 15 минут БЕЗ выбора роли; новый браузер привязывается к тому же
  единственному owner (второй owner не создаётся).
- Обычный админ не видит owner-кнопку; owner-устройства не появляются в его
  списке (BE фильтрует `inviteKind: 'regular'`, TZ-AUTH-303) — UI ничего не
  скрывает сам.
- Выбор роли `admin` в regular-инвайтах и device PATCH в/из `admin` — только
  владелец (BE 403 `OWNER_ONLY`).

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/admin/devices` | Список устройств (для owner — включая owner-device) |
| POST | `/admin/devices/invites` | Regular-ссылка `{ role, ttlDays?, deviceTtlDays? }` → `{ url, ... }` |
| POST | `/admin/devices/owner-invite` | Owner-ссылка `{ password }` → `{ url }` (15 мин) |
| PATCH | `/admin/devices/:id` | `{ role? }` или `{ expiresInDays? }` |
| POST | `/admin/devices/:id/revoke` | Отзыв устройства (soft revoke, аудит) |

Срок ссылки: 1 / 3 / 7 дней (default 3). Срок доступа компьютера:
30 / 90 / 365 дней (default 365).

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `DeviceInviteDialogComponent` | create regular link | роль (обязательно) + TTL ссылки + TTL устройства → показать URL + «Копировать» |
| `OwnerDeviceInviteDialogComponent` | owner self-link | пароль владельца (step-up) → показать URL + «Копировать» |
| `DeviceRoleDialogComponent` | change role / ttl | `DeviceEditData { device, mode: 'role'\|'ttl' }` |
| `AlertDialogComponent` | confirm revoke | «Отключить этот компьютер?» (другие компьютеры не затронуты) |

## Services

| Сервис | Методы |
|--------|--------|
| `PiDeviceEnrollmentService` | `listDevices`, `createInvite`, `createOwnerInvite`, `updateDevice`, `revokeDevice`, `listRoles` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `devicesList` | `Signal<AdminDevice[]>` | Строки списка |
| `loading` / `error` | `Signal<boolean>` / `Signal<string\|null>` | Загрузка / ошибка |
| `loadingRowId` | `Signal<string\|null>` | Per-row loading (revoke) |

## Computed / templates

| Computed | Назначение |
|----------|-----------|
| `cols` | deviceName (sticky), status (Работает/Отключён), role (mono), expiresAt (дата), lastUsedAt (дата) |
| rowActions (active) | «Изменить роль», «Изменить срок», «Отключить» |

Статус: `active` → «Работает», `revoked` → «Отключён» (только русские слова).

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-AUTH-303 | backend: admin devices/invites + owner-invite (step-up), revoke/role-change ≤5 мин |
| TZ-AUTH-304 | UI: таблица устройств, диалоги ссылок/роли/срока/отзыва |

## Особенности

- Отзыв — с подтверждением; отключается ровно один компьютер.
- Изменение роли действует при следующем продлении сессии устройства
  (максимум через 5 минут) — в UI тост «Роль изменена», список обновляется.
- Все HTTP через `silent-*`; секреты invite нигде не логируются.

---

_Создано: 2026-08-13 (TZ-AUTH-304)._
