# TZ-AUTH-304 DONE — вход по приглашению (UI)

```
ARCHIVE_MARKER
task: TZ-AUTH-304
outcome: DONE
closed_at: 2026-08-13
closed_by: agent-3e757640b7 (coding agent) + Buffy
workspace: D:\kppdf-8.0
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-AUTH-304.md)
  - frontend tsc (tsconfig.app.json --noEmit): PASS
  - auth.service 19/19 · auth.interceptor 12/12 · enroll 6/6 · devices-admin 6/6 · login.page 4/4 · permission-labels PASS
  - eslint (изменённые/новые файлы): PASS · git diff --check: PASS
  - backend: контракт enroll/session → sessionKind:'device' (184f965d, e2e PASS)
  - checklist: docs/agent-checklists/TZ-AUTH-304.md (DONE)
  - progress.md: UPDATED · _active-map.md: UPDATED
```

## Что сделано

**Публичная активация `/enroll/:token`** (`frontend/src/app/pages/enroll/enroll.page.ts`):

- Одно поле «Как назвать этот компьютер?», кнопка «Подключить»; никаких
  ФИО/email/логина/пароля/ролей/токенов; GET не consume (link scanner не
  активирует invite).
- Успех: `AuthService.applyDeviceAccess(access)` (только короткий access JWT,
  refresh НЕ хранится) → `ensureUser()` (/auth/me) → `navigateByUrl('/', {
  replaceUrl: true })` — одноразовый token удаляется из истории.
- Ошибки: 409 → «Ссылка уже использована»; 410/400/404 → «недействительно или
  истекло»; 5xx — серверный message.

**Device-сессия в SPA** (`auth.service.ts`, `auth.interceptor.ts`):

- `DEVICE_KEY` (localStorage) помечает device-браузер; `applyDeviceAccess` /
  `renewDevice` (single-flight cookie-renew) / `bootstrapDevice` (status →
  session → /auth/me); `deviceDenied` («Доступ этого компьютера отключён.
  Обратитесь к администратору.») показывается на `/login`.
- Interceptor: 401 device-сессии → cookie-renew + один retry (IS_RETRY), без
  циклов; password-поток не затронут.

**Админ-страница `/admin/devices`** (`devices-admin.page.ts` + диалоги):

- Чип «Устройства» в admin TOC (sibling Пользователи|Роли); таблица: имя,
  состояние («Работает»/«Отключён»), роль, срок доступа, последний вход.
- «Создать ссылку» — `DeviceInviteDialogComponent`: роль обязательна до
  создания (admin скрыт для ordinary admin), срок ссылки 1/3/7 (default 3),
  срок доступа 30/90/365 (default 365) → показать URL + «Копировать».
- Owner-only «Добавить мой компьютер» — `OwnerDeviceInviteDialogComponent`:
  пароль владельца (step-up) → 15-минутная ссылка без роли → тот же owner.
- «Изменить роль» / «Изменить срок» — `DeviceRoleDialogComponent`
  (mode role/ttl); «Отключить» — AlertDialog с подтверждением (ровно один
  компьютер; другие не затронуты).
- `PiDeviceEnrollmentService` — typed клиент всех enrollment-эндпоинтов.

**Backend-контракт:** enroll/session отвечают `sessionKind: 'device'`
(commit `184f965d`; e2e-assert), чтобы SPA никогда не смешивала
device-сессию с password-сессией.

**Тесты + docs:** enroll 6/6 (GET не consume, POST один раз, 409/410/5xx,
applyDeviceAccess+replaceUrl), devices-admin 6/6 (list, RU-статусы, owner-only
кнопка, error), auth.service 19/19, auth.interceptor 12/12 (device-renew +
IS_RETRY), login.page 4/4, ADMIN_TOC_CHIPS обновлён (devices|users|roles);
`docs/pages/enroll.page.md`, `docs/pages/admin-devices.page.md`, PAGE-TZ-INDEX
уже ссылается на обе.

## Known limitation

nginx Basic остаётся до TZ-AUTH-305; `__Host-` cookie требует HTTPS (dev через
proxy); смена роли устройства применяется при следующем автоматическом renew
(максимум через 5 минут).

Pre-existing (не регрессия 304): `FormProfilesService › isLocked` падает на
origin/main без изменения файлов (TZ-DICT-315).

## NEXT

TZ-AUTH-305 (nginx auth_request rollout + rollback; owner break-glass
достижимость по C1-поправке).
