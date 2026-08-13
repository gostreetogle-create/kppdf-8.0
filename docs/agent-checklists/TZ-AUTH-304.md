# TZ-AUTH-304 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-AUTH-304.md` (removed at archive)
> Commit/push: **YES (green gates); NO deploy**

## Claim slot

- agent_id: agent-3e757640b7 (coding agent) + Buffy (closeout/sessionKind-contract)
- claimed_at: 2026-08-13T21:45:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: no (room task registry stale from 2026-08-01)

## Plan

1. `pi-device-enrollment.service.ts` — consume/status/session + admin invites/devices + owner-invite.
2. `/enroll/:token` page — одно поле имени, POST только по кнопке, после успеха чистит token из history и открывает первую разрешённую страницу.
3. Bootstrap/F5 device renew + single-flight 401 retry в auth.service/interceptor.
4. `/admin/devices` + чип `Устройства` + диалоги (создать ссылку / owner / изменить роль/срок).
5. Specs + docs.

## Preflight

- [x] TZ-AUTH-303 DONE on origin/main (`4cfd8aaf`)
- [x] `_active/` only this marker; conflict keys checked; foreign TZ-SALES-370 + `.gitignore` не трогаю
- [x] Active marker created before code

## Acceptance

- [x] получатель вводит ровно одно значение — имя компьютера (нет ФИО/email/login/password)
- [x] роль выбирается админом до создания ссылки и не подменяется получателем (server-side, 303)
- [x] после имени — автоматический вход строго в подготовленной роли
- [x] F5/reopen — автоматический вход (cookie-renew); revoked/expired — «Доступ этого компьютера отключён. Обратитесь к администратору.»
- [x] device flow не хранит refresh; renew single-flight без циклов (bootstrapDevice + interceptor renewDevice, IS_RETRY guard)
- [x] `/admin/devices`: чип `Устройства` (sibling Пользователи|Роли), кнопка `Создать ссылку` (роль + срок ссылки 1/3/7 default 3 + срок доступа 30/90/365 default 365), таблица (имя/состояние/роль/срок/последний вход), изменить роль/срок, отключить с подтверждением
- [x] owner-only `Добавить мой компьютер` (пароль step-up, 15m) виден только owner; ordinary admin не видит owner-кнопку и owner-устройства (BE фильтрует)
- [x] все тексты на русском («Работает»/«Отключён»)
- [x] Gates: frontend tsc + auth.service + auth.interceptor + enroll + devices-admin specs PASS

## Gates

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [x] `cd frontend && pnpm test -- auth.service --runInBand` PASS (19/19)
- [x] `cd frontend && pnpm test -- auth.interceptor --runInBand` PASS (12/12, включая device-renew)
- [x] `cd frontend && pnpm test -- enroll --runInBand` PASS (6/6)
- [x] `cd frontend && pnpm test -- devices-admin --runInBand` PASS (6/6)
- [x] login.page spec 4/4 · permission-labels (ADMIN_TOC_CHIPS обновлён на devices|users|roles) PASS
- [x] eslint (changed/new files) PASS · git diff --check PASS

Pre-existing (не регрессия 304, не блокер): `FormProfilesService › isLocked respects LockedRequired` падает на origin/main без изменений файлов (TZ-DICT-315, вне скоупа).

## Review handoff

- [x] READY FOR REVIEW; security self-review выполнен (diff ниже).

## Executor report (auto)

- `/enroll/:token` (вне app-shell, публичный): одно поле «Как назвать этот компьютер?», GET не consume; POST только по кнопке → `applyDeviceAccess` (только access JWT, без refresh) + `ensureUser()` + `navigateByUrl('/', { replaceUrl: true })` (token уходит из history). Ошибки: 409 → «уже использована», 410/400/404 → «недействительно/истекло».
- Device-сессия: `AuthService` — `DEVICE_KEY` в localStorage, `applyDeviceAccess`/`renewDevice` (single-flight cookie-renew) /`bootstrapDevice` (status+session+me); `deviceDenied` («Доступ этого компьютера отключён…») показывается на `/login`; interceptor 401 → cookie-renew с IS_RETRY, без циклов.
- `/admin/devices` (страница + диалоги): чип в admin TOC; таблица имён/состояний/ролей/сроков/последнего входа; диалоги `DeviceInviteDialogComponent` (роль обязательна + TTL 1/3/7 + доступ 30/90/365 → URL + «Копировать»), `OwnerDeviceInviteDialogComponent` (пароль step-up → 15m URL + «Копировать»), `DeviceRoleDialogComponent` (mode role/ttl), AlertDialog для отзыва; owner-кнопка только при `isOwner()`.
- Служебный сервис `PiDeviceEnrollmentService` (enroll/session/status/listRoles/listDevices/createInvite/createOwnerInvite/updateDevice/revokeDevice/revokeInvite); pageKey переиспользован `admin-users` (admin page-ACL без нового PAGE_KEY).
- Backend: контракт enroll/session теперь возвращает `sessionKind: 'device'` (commit 184f965d, e2e-assert); backend-код 304 не менялся.
- Scope disclosure: чужой WIP (TZ-SALES-370/371/372, TZ-CATALOG-371, PO-DIARY-запись про КП, .gitignore) в коммит 304 НЕ включён.
- Known limitation: nginx Basic до TZ-AUTH-305; `__Host-` cookie требует HTTPS (dev через proxy); role change применяется при следующем renew (≤5m).
- closed_at: 2026-08-13T22:10:00Z
