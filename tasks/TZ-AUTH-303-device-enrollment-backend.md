# TZ-AUTH-303: Вход по приглашению — backend

РОЛЬ АГЕНТА: Senior Backend Security Engineer

ЗАВИСИМОСТИ: TZ-AUTH-306 DONE (единственный owner и owner-only guard)

LAYER: 4

PAGES: /enroll ; /admin/devices
PAGE_DOCS: enroll.page.md ; admin-devices.page.md

CONFLICT KEYS: backend/src/modules/device-enrollment/device-enrollment.module.ts ; backend/src/modules/device-enrollment/device-invite.schema.ts ; backend/src/modules/device-enrollment/browser-device-grant.schema.ts ; backend/src/modules/device-enrollment/device-enrollment.service.ts ; backend/src/modules/device-enrollment/device-enrollment.controller.ts ; backend/src/modules/device-enrollment/device-enrollment.service.spec.ts ; backend/src/modules/device-enrollment/dto ; backend/src/modules/auth/auth.module.ts ; backend/src/modules/auth/auth.controller.ts ; backend/src/modules/auth/auth.service.ts ; backend/src/modules/auth/auth.service.spec.ts ; backend/src/modules/user/user.schema.ts ; backend/src/modules/user/user.service.ts ; backend/src/modules/admin/admin.module.ts ; backend/src/modules/admin/users-admin.controller.ts ; backend/src/modules/admin/users-admin.controller.spec.ts ; backend/src/app.module.ts

## ИСХОДНОЕ СОСТОЯНИЕ

Проверено: `backend/src/modules/desktop/desktop-pairing-key.*`; `backend/src/common/guards/jwt-auth.guard.ts`; `backend/src/modules/auth/auth.service.ts`; `backend/src/modules/user/user.schema.ts`; `backend/src/modules/admin/users-admin.controller.ts`; `docs/ops/home-host-access.md` §4.

1. Сейчас внешний UI закрыт общим HTTP Basic, а приложение требует username/password. PO выбрал другой UX: администратор заранее выбирает готовую роль, копирует одноразовую ссылку, человек открывает её, один раз вводит «Как назвать этот компьютер?» и сразу работает в пределах этой роли без пароля.
2. Устройство, а не физическое лицо, является аккаунтом доступа. Общий цеховой ПК допустим: все действия с него видны под одним именем устройства.
3. Устройство никогда не получает временный полный доступ. Роль фиксируется сервером в invite до передачи ссылки и применяется атомарно при активации.
4. `DesktopPairingKey` (`kppd_`) — полноценный API Bearer. Его схему, лимит и guard-контур не менять и не использовать как browser-cookie.
5. `User.role` и `passwordHash` обязательны. Обычная invite-активация атомарно создаёт `User` типа `device` с заранее выбранной ролью. Пароль для него случайный и никогда не выдаётся.
6. Обычные password-сессии и Desktop/MCP должны продолжить работать без изменений.
7. Owner один, но его устройств может быть несколько. Owner создаёт отдельную owner-only ссылку `Добавить мой компьютер`; она привязывает новый grant к существующему owner User и не создаёт второго суперадминистратора.

## РЕШЕНИЕ

Две отдельные сущности:

- `DeviceInvite`: одноразовый секрет приглашения, короткий TTL, только hash в БД; regular invite содержит выбранную активную `role`, owner-device invite — неизменяемый `ownerUserId`.
- `BrowserDeviceGrant`: отдельный случайный browser-only секрет в `__Host-` cookie, имя компьютера, состояние `active | revoked`, срок по умолчанию 365 дней и обязательный `userId`.

Browser grant никогда не принимается как `Authorization`, `X-Access-Token`, JWT или `kppd_`. Для активного устройства отдельный cookie-only session endpoint выдаёт обычный короткий access JWT максимум на 5 минут, **без refresh JWT**. Продление снова требует действующий grant-cookie. Так отзыв устройства прекращает доступ не позднее пяти минут.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Создать отдельный модуль приглашений и устройств

1. Добавить схемы, DTO, service/controller/module в `backend/src/modules/device-enrollment/`.
2. Invite:
   - случайный секрет не менее 192 бит;
   - в БД только SHA-256 hash и безопасный prefix для списка;
   - `createdBy`, `kind: regular | owner-device`, `role` XOR `ownerUserId`, `deviceTtl`, `expiresAt`, `consumedAt`, `consumedGrantId`;
   - TTL приглашения: 1 / 3 / 7 дней, default 3 дня;
   - owner-device TTL: 15 минут, без выбора роли; создать его может только текущий owner после повторного подтверждения своего пароля;
   - одноразовое погашение атомарно; повтор → 409;
   - отозванное/истёкшее → одинаковый безопасный 4xx без раскрытия причины постороннему.
3. Grant:
   - отдельный random secret и hash; никогда ObjectId как credential;
   - `deviceName` 1–80 символов после trim;
   - `status`, `expiresAt` default 365d, `lastUsedAt`;
   - `activatedAt`, `revokedAt/By`, `userId`, `inviteKind`;
   - soft revoke: историю не удалять;
   - unique только на token hash; deviceName не unique.

### ШАГ 2. Реализовать публичную активацию с заранее подготовленным доступом

1. Public POST consume принимает invite secret + имя компьютера.
2. Для regular invite в одной Mongo transaction:
   - повторно проверяет, что сохранённая в invite Role существует и активна;
   - создаёт `User(accountType=device)` с `displayName=deviceName`, внутренним username, неизвестным random password hash и **ровно выбранной ролью**;
   - создаёт active grant, связывает `userId` и погашает invite.
3. Для owner-device invite в одной transaction создаёт active grant на **существующего единственного owner User**; не создаёт User и не принимает роль из клиента.
4. Ставит cookie `__Host-kppdf-device`: `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`, без `Domain`, Max-Age по grant.
5. GET/preview никогда не погашает приглашение: мессенджерный link scanner не должен активировать устройство.
6. Public endpoints имеют отдельный rate limit; токен не попадает в audit/access message.
7. Cookie status endpoint возвращает только `active | revoked | expired` и безопасное имя устройства.

### ШАГ 3. Реализовать администраторское управление

1. Под действующим `user:admin`:
   - создать regular invite **только после явного выбора активной роли** и вернуть готовую URL;
   - список active/revoked обычных устройств;
   - изменить роль обычного устройства;
   - отозвать одно устройство;
   - задать новый срок grant.
2. Только owner:
   - создаёт owner-device invite через отдельный endpoint после step-up password;
   - видит и отзывает свои owner devices;
   - ordinary admin не может перечислить owner invite/device и не узнаёт об их существовании через count/search/error.
3. Role не приходит от публичного клиента и не может быть подменена в activation request.
4. Reset-password для `accountType: device` отклоняется понятным 409/400: у устройства нет пользовательского пароля.
5. Все issue/consume/activate/role-change/revoke действия пишутся в существующий audit-контур без plaintext secrets.

### ШАГ 4. Добавить автоматическую app-сессию устройства

1. Cookie-only endpoint:
   - не принимает JWT, `kppd_`, body token или query token вместо cookie;
   - active проверяет grant, срок, User.isActive и актуальную активную Role;
   - выдаёт стандартный access JWT с TTL не более 5 минут и актуальными role/permissions;
   - не выдаёт refresh token и не меняет password-login flow.
2. Отзыв grant блокирует новое продление немедленно; ранее выданный device JWT живёт максимум 5 минут.
3. Изменение роли действует при следующем автоматическом продлении максимум через 5 минут.
4. Добавить внутренний cookie-check endpoint для nginx `auth_request`: принимает только browser grant, не принимает JWT/`kppd_`, не возвращает персональные данные.

### ШАГ 5. Покрыть security-контракт тестами

Проверить unit/e2e:

- plaintext invite/grant отсутствует в БД и list response;
- GET/prefetch не consume; POST consume одноразовый и atomic;
- regular activation применяет только server-side role из invite;
- owner-device activation связывается с существующим owner и не создаёт второго;
- active cookie выдаёт JWT ≤5m без refresh;
- revoke сохраняет аудит и прекращает renew;
- новый срок default 365d, invite default 3d;
- browser secret не проходит как Bearer/X-Access-Token;
- `kppd_` и обычный JWT работают как раньше;
- деактивация device User прекращает renew;
- общий deviceName не уникален.

## ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ

ИЗМЕНЯТЬ:

- `backend/src/modules/device-enrollment/**` — новый изолированный домен.
- `backend/src/modules/auth/auth.module.ts`
- `backend/src/modules/auth/auth.controller.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/auth/auth.service.spec.ts`
- `backend/src/modules/user/user.schema.ts`
- `backend/src/modules/user/user.service.ts`
- `backend/src/modules/admin/admin.module.ts`
- `backend/src/modules/admin/users-admin.controller.ts`
- `backend/src/modules/admin/users-admin.controller.spec.ts`
- `backend/src/app.module.ts`
- релевантный новый e2e-тест enrollment.

НЕ ИЗМЕНЯТЬ:

- `backend/src/modules/desktop/**` — Desktop/MCP отдельный credential space.
- `frontend/**` — следующий TZ-AUTH-304.
- nginx/prod — только TZ-AUTH-305 и только после PASS 303+304.
- IP allowlist, mTLS, Cloudflare, Tailscale.
- owner/superadmin invariant — predecessor TZ-AUTH-306; не ослаблять.
- существующий password login и break-glass admin.

## КРИТЕРИИ ПРИЁМКИ

1. Regular ссылка создаётся только с заранее выбранной активной ролью; публичная активация не может её изменить.
2. После ввода имени компьютер сразу получает только подготовленную роль — без промежуточного полного доступа и без второго шага approve.
3. Device cookie живёт 365 дней по умолчанию; invite — 3 дня по умолчанию; оба срока настраиваемы в разрешённых пределах.
4. Отзыв устройства сохраняется в аудите и прекращает API-доступ максимум за 5 минут.
5. Ни browser grant, ни его ObjectId не принимаются как API Bearer.
6. Desktop `kppd_`, JWT/password login и `/api` transport не имеют регрессий.
7. Нет IP binding и сбора лишних персональных данных; хранится только введённое имя компьютера и технический access audit.
8. Owner может безопасно добавить второй собственный компьютер одноразовой owner-only ссылкой; owner остаётся ровно один и скрыт от ordinary admin.
9. Gates:
   - `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
   - `cd backend && pnpm test -- device-enrollment --runInBand`
   - `cd backend && pnpm test -- auth.service --runInBand`
   - `cd backend && pnpm test -- desktop-pairing-key --runInBand`
   - релевантный enrollment e2e PASS.
10. Перед archive заполнен `docs/agent-checklists/TZ-AUTH-303.md`, приложен `## Executor report (auto)` и получен Cursor/PO PASS.

## known_limitation

- До TZ-AUTH-304 нет пользовательского экрана активации и управления.
- До TZ-AUTH-305 nginx Basic остаётся включённым.
- Устройство — единый субъект аудита. Система не определяет, какой человек работал за общим ПК.
- Owner-only invariant приходит из TZ-AUTH-306; этот TZ добавляет только owner-device invite, не новый owner.

## ФИНАЛИЗАЦИЯ

Root task: следовать `GEMINI.md`, архивировать в `tasks/_archive/YYYY-MM/`, обновить checklist/progress/ARCHITECTURE и не деплоить без отдельной команды PO.
