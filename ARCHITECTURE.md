# Architecture — <название проекта>

> Корневой архитектурный документ.

## 1. Общая схема
<!-- пусто -->

## 2. Конвенции
<!-- пусто -->

## 3. Зоны ответственности агентов

| Зона | Файлы | Агент-владелец |
|------|-------|----------------|
<!-- пусто -->

## 4. Открытые вопросы / отложенные задачи
<!-- пусто -->

---

## Dev Tooling — Local Starter (TZ-41)
- **`D:\kppdf-8.0\start.mjs`** — кросс-платформенный Node 20+ ESM starter (~500 строк, без внешних deps).
- **Режимы:** `--check` (preflight only), `--tail` (TUI), `--stop` (kill pids), `--reset` (down -v + rm node_modules), `--no-browser`, `--help`.
- **Pre-flight:** Node 20+, pnpm 8+, Docker daemon, `.env`, project structure, ports 3000/4200 (hard-fail) / 27017 (warn).
- **Mongo:** `docker compose up -d mongo mongo-init` (НЕ backend service — Dockerfile pnpm blocker), wait `rs.status().ok === 1` до 120s.
- **Deps:** `pnpm install --prefer-offline` если `node_modules` отсутствует.
- **Spawn:** `pnpm start:dev` (backend :3000) + `pnpm start` (frontend :4200) detached. `shell: isWin` на Windows для PATHEXT resolution (.cmd/.ps1).
- **Health-check:** `checkHealth()` GET + JSON parse + latency; для `/api/health` проверяет `body.status !== 'error' && body.info.mongo.status !== 'down'` (терминус формат).
- **TUI mode (`--tail`):** TTY-only, рисует 3 строки статуса Mongo/Backend/Frontend in-place через `\x1b[3A` + `\r` + `\x1b[K\n`. Ring buffer 5 строк на сервис. Иконки: ⏳ pending, ⏵ starting, ✔ ready, ✖ failed, ⚠ degraded.
- **TUI-aware log:** `tuiPrint()` вставляет строку ниже TUI, затем redraw. `log` объект (step/ok/warn/err) все стали TUI-aware.
- **Subprocess output suppression:** в TUI режиме `startMongo`/`installDeps`/`spawnDetached` используют `stdio: 'pipe'` чтобы не ломать in-place update.
- **Cleanup:** SIGINT/SIGTERM → `taskkill /T /F` (Win) / `process.kill(-pid, SIGTERM)` (Unix) для process group. PID-файл `.start.pids.json`.
- **Browser open:** `open` (Mac) / `cmd /c start` (Win) / `xdg-open` (Linux) с `shell: isWin` для Windows built-in `start`.
- **Final panel:** латентности /api/health + GET /, ✔/⚠/✖ иконки, frontend/backend/login/showcase URLs.
- **ENV vars:** `NO_TUI=1` (force plain log), `NO_COLOR=1` (disable ANSI).
- **npm-скрипты (root `package.json`):** `start` (--check), `start:all` (full), `start:tail` (--tail), `check:start` (--check), `stop:start` (--stop), `reset:start` (--reset), `start:no-browser` (--no-browser).
- **Platform wrappers:** `start.cmd` (Windows native, `node start.mjs %*`), `start.sh` (bash, `cd $SCRIPT_DIR && exec node start.mjs "$@"` — работает из любой CWD).
- **Smoke test results (pre-TZ-41):** 2 бага найдено (Windows pnpm spawn ENOENT, ImportJobsModule DI cascade) — оба исправлены до TZ-41.

---

(будет пополняться)

Test arch row

Test arch row

Test arch row

Test arch row

Test arch row

Test arch row

Test arch row

## Database Layer (TZ-03)
- **Mongoose 8** с autoIndex=true в dev, autoIndex=false в production
- **Connection:** retryAttempts 3, retryDelay 1000, replicaSet rs0
- **Plugins (global, applied in connectionFactory):**
  - `softDeletePlugin` — auto-filter `{deletedAt: null}` в find/findOne/findOneAndUpdate/countDocuments; helpers `.softDelete()` / `.restore()` через `schema.query`
  - `auditPlugin` — pre-save (createdBy/createdAt для new, updatedBy/updatedAt для existing); pre updateOne/findOneAndUpdate/updateMany (мерж updatedBy/updatedAt в $set или wrap-in-$set)
- **$locals.userId** — Mongoose per-query local storage, устанавливается из Auth interceptor (TZ-04)
- **Counter service:** атомарный `next(entity, prefix, year)` через `session.withTransaction` + `$inc: { seq: 1 }` + `upsert: true` + `returnDocument: 'after'`. Формат: `prefix-YYYY-NNN` (3-digit pad). Требует Replica Set (есть в TZ-02).
- **Event logging:** connected / disconnected / reconnected / error → NestJS Logger → Pino (через main.ts useLogger)

## Auth & Identity (TZ-04)
- **Схемы:** Permission (key unique, section, action ∈ {read|write|admin}), Role (name unique, label, permissions[], isSystem, sortOrder, sectionIds, isActive), User (username/email unique, passwordHash bcryptjs, role, permissions[], refreshTokenVersion, isActive, lastLoginAt, phone, fullName)
- **JWT:**
  - access: 15m, secret=JWT_SECRET, payload `{sub, username, role, version}` (version = refreshTokenVersion)
  - refresh: 7d, secret=JWT_REFRESH_SECRET, payload `{sub, version}` — валидируется совпадение version с user.refreshTokenVersion
  - Logout/change-password → increment refreshTokenVersion → старые refresh инвалидированы
- **Password:** bcryptjs (pure JS, 10 rounds). 8-128 chars, min для admin из ADMIN_PASSWORD env.
- **Guards (global):**
  - JwtAuthGuard (APP_GUARD) — валидирует access token, hydrates req.user из БД (fresh role/perms), @Public() пропускает
  - RolesGuard (APP_GUARD) — проверяет @Roles('admin', 'manager') decorator
- **Interceptors (global):**
  - UserContextInterceptor (APP_INTERCEPTOR) — оборачивает handler в userContext.run({userId,username,role,permissions}) из req.user
- **Propagation chain:** JWT validate → req.user → Interceptor → AsyncLocalStorage → Mongoose userContextPlugin → query.$locals.userId → auditPlugin (createdBy/updatedBy из TZ-03)
- **Endpoints:**
  - POST /auth/register (public) — создать User + access + refresh
  - POST /auth/login (public) — verify password + lastLoginAt + tokens
  - POST /auth/refresh (public, JwtRefreshGuard) — новый access если version совпадает
  - POST /auth/logout (auth) — bump refreshTokenVersion
  - GET /auth/me (auth) — текущий user
  - GET/POST/PATCH/DELETE /users (admin/manager + self) — CRUD
  - POST /users/:id/change-password — bump refreshTokenVersion
  - GET/POST/PATCH/DELETE /roles (admin) — CRUD, isSystem роли не удаляются
- **Seed (OnApplicationBootstrap):**
  - PermissionsService — bulk upsert 30+ permission keys
  - AdminSeed — 3 system roles (admin/manager/user), default admin user с предупреждением

## System & Workflow (TZ-05)
- **Setting:** key-value config (Mixed value), grouped (finance/general/etc). `isEnabled(key)` helper для guards/interceptors.
- **FeatureFlag:** boolean toggles с default + active. Virtual `enabled` = isActive ? enabledByDefault : (depends on override layer). 4 default flags: new_ui, e2e_payments, dark_mode, advanced_analytics.
- **EntityStatus:** (entityType, statusId, label, color, icon, sortOrder, isInitial, isFinal). 15 seeded для Proposal/Contract/Order.
- **StatusWorkflow:** (entityType, name, statuses[], transitions[{fromStatus, toStatus, roles[]}], isActive). `assertTransition(entityType, fromStatus, toStatus, userRole)` — throws BadRequest если role не в transition.roles. 3 default workflows.
- **AuditLog:** (action, entityType, entityId, userId, userName, details{before, after, meta}, packageTag, ipAddress). 3 indexes: createdAt desc, (entityType, entityId, createdAt desc), (userId).
- **AuditInterceptor (@AuditAction):** глобальный APP_INTERCEPTOR. Метаданные `{action, entityType, idParam?}`. После response берёт entityId из params.id или response._id, пишет log с userId из AsyncLocalStorage (TZ-04). Sensitive поля (passwordHash/password/refreshToken) вырезаются из snapshot.
- **Seeds (OnApplicationBootstrap):** SettingsSeed (5), FeatureFlagsSeed (4), StatusesSeed (15 statuses + 3 workflows), AdminSeed (из TZ-04).

## Organizations & Contacts (TZ-06)
- **Person:** физическое лицо (контакт). Поля: lastName, firstName, patronymic, phone, email, position, notes. Индекс по ФИО.
- **Organization:** юр.лицо (наша или партнёр). Полные реквизиты (name, shortName, legalForm, INN, KPP, OGRN/OGRNIP, банк, signer, paymentTermDays, vatRate, type[], legalType, website, directorName, registrationDate, partyTypes, photoIds[], contactPersonId, паспорт для ИП). Уникальный INN.
- **Counterparty:** контрагент (покупатель/поставщик/...). Похож на Organization, но roles[] → CounterpartyRole (customer/supplier/contractor/manufacturer).
- **OrgRole / CounterpartyRole:** справочники ролей. isSystem=true → нельзя удалить (защита в service).
- **OrganizationContact:** M2M Organization ↔ Person, unique index, isPrimary/role.
- **Interaction:** CRM-лог (counterpartyId, type∈{call|email|meeting|chat|task|note}, description, direction, occurredAt, relatedToId+Type polymorphic, outcome, tags[]). Индекс по counterpartyId + occurredAt desc.
- **@IsINN() валидатор:** декоратор с контрольной суммой ФНС для 10/12-значных ИНН.
- **Seeds:** 4 OrgRole (our-company/partner/holding/branch), 4 CounterpartyRole (customer/supplier/contractor/manufacturer).
