# Nx Auth Platform — канон для `frontend-nx`

> **Статус:** CANONICAL (F3) · обновлять в той же TZ, что меняет auth/roles в nx  
> **Связанные SoT:** `docs/RBAC-CONTRACT.md` (алгоритм прав) · `docs/DOCS-INTEGRITY.md` (когда обновлять)  
> **Legacy reference (read-only):** `frontend/src/app/core/**` · `frontend/src/app/pages/login|enroll|admin/**`

## 1. Зачем этот файл

Любой агент перед правкой auth в `frontend-nx` **читает этот документ + `RBAC-CONTRACT.md`**.
Код legacy `frontend/` — эталон поведения, не целевой склад.

## 2. Модель доступа (кратко)

| Слой | Что решает | Где |
|------|------------|-----|
| **JWT / device cookie** | Кто вошёл | BE `auth`, `device-enrollment` |
| **Role name** | Системная роль (`admin`, `director`, `manager`, `user` + кастом) | `User.role` → `roles` collection |
| **Permissions** | `section:action` (read/write/admin) | `effectivePermissions(user, role)` |
| **Page ACL** | Видимость разделов nav | `roles.pages[]` → `/auth/me.pages` |
| **Owner** | Скрытый break-glass (`User.isOwner`) | BE guards + FE `ownerOnlyRouteGuard` |

**Вход по ссылке (device invite)** — основной путь для цеха. Пароль — break-glass владельца (`/login`).

## 3. Потоки

### 3.1 Device invite (`/enroll/:token`)

1. Админ создаёт invite → одноразовая ссылка (`DeviceInvite`, TTL 1/3/7 дней).
2. Оператор открывает `/enroll/:token`, вводит имя ПК.
3. `POST /api/device/enroll` → cookie `__Host-kppdf-device` + короткий access JWT (≤5m).
4. FE: `AuthService.bootstrapDevice()` / `renewDevice()`; флаг `localStorage kppdf.device`.
5. Роль берётся **только с invite**, не с клиента.

### 3.2 Password login (`/login`)

- Только owner break-glass и редкие админ-сценарии.
- `POST /api/auth/login` → access + refresh (httpOnly cookie).
- Public register — **410 Gone** (TZ-AUTH-308).

### 3.3 Сессия

- Access: `X-Access-Token` (приоритет) или `Authorization: Bearer`.
- Refresh: `POST /api/auth/refresh` (cookie).
- Logout: `POST /api/auth/logout` → bump `refreshTokenVersion`.
- Bootstrap: `GET /api/auth/me` при старте приложения.

## 4. Effective permissions (канон)

Алгоритм — `backend/src/common/contracts/rbac-contract.ts`:

```
effective = user.permissions ∪ role.permissions
if user.* OR role.* OR role.name === 'admin' → весь каталог
```

**F3 fix (обязателен):** `/auth/me` и `PermissionsGuard` должны использовать **оба** источника.
До F3 guard ошибочно подставлял `user.permissions` вместо `role.permissions`.

FE `CapabilitiesService` зеркалит массив с `/auth/me` (UX-only; BE — security-of-record).

## 5. Page ACL

- Каталог ключей: `PAGE_KEYS` в `permissions.constants.ts`.
- Доставка: `GET /auth/me` → `pages: string[]`.
- Owner-only ключ `admin-roles` вырезается для не-владельцев на BE.
- FE: `filterByPageAcl()` для nav/chips; `capabilityRouteGuard` для route `data.pageKey`.

## 6. Структура Nx

```
frontend-nx/
├── libs/data-access/          # type:data-access — auth SoT в nx
│   ├── auth/                  # AuthService, guards, interceptors
│   ├── capabilities/          # CapabilitiesService, route guard, page-acl
│   └── admin/                 # PiRolesService, PiDeviceEnrollmentService
├── libs/util/http/            # API_BASE_URL, silent-http (F1)
├── libs/ui/paper-and-ink/     # Pi UI (F2a); error-banner — F3d
└── apps/kppdf-web/
    └── app/pages/             # login, enroll, forbidden, admin/*
```

**Boundaries:** `data-access` → `util`; `features` → `data-access` + `ui`; `ui` **не** импортирует `data-access`.

## 7. Interceptors (порядок)

1. `idempotencyInterceptor` — `Idempotency-Key` на POST/PATCH/DELETE.
2. `authInterceptor` — токен, 401 refresh/replay, device renew, 403→`/forbidden` (opt-out через `SKIP_FORBIDDEN_REDIRECT`).

Wiring: `provideHttpClient(withInterceptors([...]))` + `provideAppInitializer(() => auth.bootstrap())`.

## 8. Маршруты F3 (минимальный срез)

| Route | Guards | pageKey |
|-------|--------|---------|
| `/login` | `publicOnlyGuard` | — |
| `/enroll/:token` | public | — |
| `/forbidden` | — | — |
| `/admin/devices` | `capabilityRouteGuard` | `admin-users` |
| `/admin/roles` | `capabilityRouteGuard` + `ownerOnlyRouteGuard` | `admin-roles` |

`/admin/users` → redirect `/admin/devices` (TZ-AUTH-308).

## 9. Известные дубли / исправления F3

| Проблема | Решение |
|----------|---------|
| `PermissionsGuard` не читал `role.permissions` | BE: hydrate role в JwtStrategy + guard |
| `/auth/me` отдавал только `user.permissions` | BE: отдавать `effectivePermissions` |
| FE capabilities без role union | Следует из fix `/auth/me` |
| `director` в seed, не в `SYSTEM_ROLE_NAMES` | Документировать; не удалять; не переименовывать |
| `orgroles` / `role-counterparty` | **Не** auth RBAC — не трогать в F3 |
| Legacy `frontend/` дублирует util-http | Nx использует `@kppdf/util-http` only |

## 10. UI ролей (nx)

- Порт legacy `roles-admin.page` на Pi-table `compact` (уже табличный стиль).
- Диалог роли: permissions + pages matrix — owner-only.
- Полный редизайн матрицы — отдельная волна после F3 smoke; не блокирует фундамент.

## 11. Расширение (FIC)

Новый `PAGE_KEY` или permission → `FEATURE-INTEGRATION-CHECKLIST.md` §A/B + этот файл §5/§8 + `RBAC-CONTRACT.md`.

## 12. Проверка F3

```bash
cd frontend-nx && pnpm exec nx build kppdf-web
cd frontend-nx && pnpm exec nx run-many -t lint --all
cd backend && pnpm test -- auth.service permissions.guard
```

Smoke: `node start.mjs --nx` → login (owner) → devices invite → enroll → `/admin/roles` (owner).

---

*Автор: Cursor F3 planning · 2026-08-29*
