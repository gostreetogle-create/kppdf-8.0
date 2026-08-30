# TZ-NX-F3: Auth platform — data-access, interceptors, auth pages

**РОЛЬ АГЕНТА:** Executor (Freebuff / Claude CLI)  
**ЗАВИСИМОСТИ:** F2a DONE · F4 DONE · F1 util/http DONE  
**LAYER:** 2 (platform) + thin BE fix  
**CONFLICT KEYS:** `frontend-nx/libs/data-access/**`; `frontend-nx/apps/kppdf-web/src/app/**`; `backend/src/modules/auth/**`; `backend/src/common/guards/permissions.guard.ts`; `backend/src/modules/auth/strategies/jwt.strategy.ts`; `docs/architecture/nx-auth-platform.md`

**PAGES:** `/login` ; `/enroll/:token` ; `/forbidden` ; `/admin/devices` ; `/admin/roles`  
**PAGE_DOCS:** login.page.md ; enroll.page.md ; admin-devices.page.md ; admin-roles.page.md

**Проверено:** `docs/RBAC-CONTRACT.md`; `docs/architecture/nx-auth-platform.md`; `frontend/src/app/core/auth*.ts`; `frontend/src/app/core/capabilities/**`; `frontend-nx/libs/data-access/**` (stubs); `backend/src/common/guards/permissions.guard.ts` (bug: role.permissions); `backend/src/modules/auth/auth.service.ts` (`toAuthUser`); PO 2026-08-29: device invite KEEP; roles — аудит + порядок; docs обязательны.

---

## ИСХОДНОЕ СОСТОЯНИЕ

- **F4 DONE:** kit shell на `:4201`; `_active/` пуст.
- **nx data-access:** stubs (`auth.service.stub.ts`, no-op `page-acl.ts`).
- **nx app.config:** только `API_BASE_URL`; **нет** interceptors, bootstrap, auth routes.
- **Legacy SoT:** `frontend/src/app/core/` (auth, capabilities, interceptors) + `pages/login|enroll|admin/**`.
- **BE bug:** `PermissionsGuard` передаёт `user.permissions` как `role.permissions`; `/auth/me` не отдаёт union с role doc.
- **Device invite:** работает в legacy; PO подтвердил — сохраняем без замены на email magic link.

---

## ЦЕЛЬ

Целостный auth-фундамент в `frontend-nx`: interceptors + session + guards + capabilities + auth admin pages.
Параллельно — **минимальный BE fix** effective permissions (см. `nx-auth-platform.md` §4).

---

## ЧТО ДЕЛАТЬ

### F3-0 — Claim + прочитать канон

1. Claim → `tasks/_active/TZ-NX-F3-data-access.md`
2. Прочитать `docs/architecture/nx-auth-platform.md` + `docs/RBAC-CONTRACT.md` §3, §5b, §5c, Page ACL
3. Checklist по `docs/agent-checklists/_TEMPLATE.md`

### F3-BE — Effective permissions fix (минимальный diff)

4. `jwt.strategy.ts`: inject `RoleService`; в `validate()` загрузить role по `user.role`; положить на `req.user`:
   - `rolePermissions: role?.permissions ?? []` (новое поле)
5. `permissions.guard.ts`: в `effectivePermissions()` передать `{ name: user.role, permissions: user.rolePermissions ?? [] }` (не `userPerms`)
6. `auth.service.ts` `toAuthUser()`: `permissions: Array.from(effectivePermissions(user, roleDoc))` где `roleDoc` уже загружен для `pages`
7. Тесты: расширить `auth.service.spec.ts` + unit для guard (role permissions попадают в effective)
8. **Не** менять JWT payload shape; **не** трогать device-enrollment module

### F3a — Nx lib `data-access` (заменить stubs)

9. Структура `libs/data-access/src/lib/`:
   - `auth/` — port from legacy `core/auth.service.ts`, `auth.guard.ts`, `auth.interceptor.ts`, `idempotency.interceptor.ts`, `jwt-access-header.ts`
   - `capabilities/` — port `capabilities.service.ts`, `capabilities.metadata.ts`, `capability-route.guard.ts`, `page-acl.ts`
   - `admin/` — port `pi-roles.service.ts`, `pi-device-enrollment.service.ts`
10. Импорты HTTP → `@kppdf/util-http` (`silent-*`, `API_BASE_URL`); **не** дублировать silent-http в data-access
11. Удалить `*.stub.ts`; обновить `src/index.ts` + при необходимости secondary paths в `tsconfig.base.json` (`@kppdf/data-access`, `@kppdf/data-access/capabilities` если нужно)
12. `pi-group-workspace` (features) — импорт реального `AuthService` / `filterByPageAcl`; починить spec

### F3b — App wiring

13. `apps/kppdf-web/src/app/app.config.ts`:
    - `provideHttpClient(withInterceptors([idempotencyInterceptor, authInterceptor]))`
    - `provideAppInitializer(() => inject(AuthService).bootstrap())`
    - `provideAnimationsAsync()` если нужно для dialogs
14. `app.routes.ts` — auth routes (lazy или standalone import по паттерну F4 kit):
    - `/login`, `/enroll/:token`, `/forbidden`
    - `/admin` → redirect `/admin/devices`
    - `/admin/devices`, `/admin/roles` с `data.capabilities`, `pageKey`, guards
15. Default route `/` → `/kit/overview` (dev) или `/login` если не authed — **dev:** оставить kit + auth routes параллельно

### F3c — Auth pages port

16. Port в `apps/kppdf-web/src/app/pages/` (или `libs/features/auth/` если boundaries чище):
    - `login/`, `enroll/`, `forbidden/`
    - `admin/devices-admin.page.ts` + invite dialogs
    - `admin/roles-admin.page.ts` + `role-form-dialog` + `permission-labels.ru.ts` + `admin-group-chips.ts`
17. Импорты UI → `@kppdf/ui/*`; services → `@kppdf/data-access`
18. **UI:** сохранить `pi-table [compact]="true"` для ролей; не изобретать новый layout без Pi
19. **Не** портировать `/admin/users` UI (redirect only)

### F3d — error-banner + submit-guard

20. Port `error-banner` → `libs/ui/paper-and-ink` (или `libs/data-access` если coupling к auth — предпочтительно ui + inject CapabilitiesService)
21. Port `shared/dsl/submit-guard.ts` → `libs/data-access` или `libs/util/dsl` (platform only)
22. Wire error-banner в app shell если legacy использует глобально

### F3-doc — Integrity (обязательно в той же TZ)

23. Обновить `docs/architecture/nx-auth-platform.md` если фактическая структура отличается от §6
24. `docs/pages/PAGE-TZ-INDEX.md` — строки nx F3
25. `docs/DOMAIN-MAP.md` — nx routes для auth (footnote)
26. Checklist Integrity slot → PASS
27. `frontend-nx/README.md` — §Auth smoke (login, enroll, roles)

---

## STOP RULES

1. **Не** менять legacy `frontend/**`
2. **Не** портировать domain pages (`orders`, `products`, …)
3. **Не** менять device-enrollment API semantics
4. **Не** добавлять email magic link / SSO / LDAP
5. **Не** рефакторить roles UI beyond port + compact table parity
6. Новый HTML для отсутствующих Pi — STOP

---

## ИЗМЕНЯТЬ

- `frontend-nx/libs/data-access/**`
- `frontend-nx/apps/kppdf-web/src/app/**`
- `frontend-nx/tsconfig.base.json` (paths при необходимости)
- `backend/src/modules/auth/strategies/jwt.strategy.ts`
- `backend/src/common/guards/permissions.guard.ts`
- `backend/src/modules/auth/auth.service.ts` (+ spec)
- `docs/architecture/nx-auth-platform.md`
- `docs/pages/PAGE-TZ-INDEX.md`, `frontend-nx/README.md`

## НЕ ИЗМЕНЯТЬ

- `frontend/**` legacy
- `backend/src/modules/device-enrollment/**` (кроме import RoleService если уже есть)
- Domain modules / seeds (кроме тестовых фикстур)
- `libs/ui/paper-and-ink/**` кроме error-banner (F3d)

---

## КРИТЕРИИ ПРИЁМКИ

```bash
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- auth.service permissions.guard jwt.strategy
cd frontend-nx && pnpm exec nx build kppdf-web
cd frontend-nx && pnpm exec nx run-many -t lint --all
cd frontend-nx && pnpm exec nx test data-access --passWithNoTests
```

- [ ] `/auth/me` для user с пустым `user.permissions` и непустым `role.permissions` возвращает union
- [ ] `PermissionsGuard` пропускает `@Permissions` при наличии ключа только на role doc
- [ ] nx: `bootstrap()` на старте; interceptors в цепочке
- [ ] `/login` public; `/enroll/:token` работает с test invite
- [ ] `/admin/roles` — owner-only; `/admin/devices` — admin + `user:admin`
- [ ] `filterByPageAcl` фильтрует nav/chips (не no-op)
- [ ] Stubs удалены; `pi-group-workspace` spec green
- [ ] `docs/architecture/nx-auth-platform.md` актуален
- [ ] Integrity slot в checklist заполнен
- [ ] Legacy `frontend/**` — 0 diff

### Smoke (PO)

`node start.mjs --nx` → owner login → devices → enroll link → roles editor (owner).

---

## Archive

`tasks/_archive/2026-08/TZ-NX-F3-data-access.done.md` + lock `TZ-NX-F3-data-access`

## Следующая волна (не в scope)

- **TZ-NX-GATES** — architecture-check на frontend-nx
- **F5** — Document Studio vertical slice (только по указанию PO)

---

*Cursor · 2026-08-29 · PO: device invite KEEP; roles audit-first; docs mandatory*
