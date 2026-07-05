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
- **npm-скрипты (root `package.json`):** `start` (--check), `start:all` (full), `start:tail` (--tail), `check:start` (--check), `stop:start` (--stop), `reset:start` (--reset), `start:no-browser` (--no-browser), `start:prod` (--prod).
- **Production mode (`--prod`, TZ-42):** `pnpm build` для backend+frontend, запуск через `node dist/main.js` (NODE_ENV=production) + inline static server (Node http+fs, ~80 lines, без new deps) для раздачи `dist/frontend/browser/` на :4200. SPA fallback, path traversal protection, cache headers. Bundle sizes в Ready panel. Caveat: local prod-like testing, не реальный prod deploy (для реального prod нужен nginx/PM2/Docker — future TZ-43+).
- **Inline static server:** `serveStatic(rootDir, port)` с MIME map, `/assets/*` → `Cache-Control: public, max-age=31536000, immutable`, `.html` → `Cache-Control: no-cache`, SPA fallback to `index.html`, error handler на `listen()` для EADDRINUSE, `server.close()` в cleanup handler.
- **Console polish (TZ-46):** все log-сообщения в start.mjs на русском (preflight, startMongo, waitMongo, installDeps, buildBackend/Frontend, banner, cleanup, waitFor). `printReadyPanel` переписан с «простынного» вывода на компактную 2D панель: ASCII-рамка `╔══╗`/`╚══╝` с заголовком `✦ kppdf-8.0 готов к работе ✦`, summary строка `⏱ Все сервисы готовы за Xs`, 2-col endpoints table (`🖥 Frontend | 👤 Логин` + `📦 Backend | 📋 Showcase`). Динамическая ширина колонок через `stdout.columns` (clamp 80..120). NG warnings fix: 3× NG8113 (unused imports в page-renderer + showcase) + 2× NG8102 (unnecessary `??` в otp-input + scroll-area). Frontend build: 0 NG warnings. NestJS logger: nestjs-pino level='info' (excludes debug/verbose).
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
- **FIXME (TZ-43):** legacy single-field `Schema.index({ field: 1 })` calls cleaned up в 6 schemas (product/material/organization/counterparty/category/certificate). Compound indexes сохранены. Если в production Mongo есть legacy duplicate `name_1` index — требуется ручной `db.<coll>.dropIndex('name_1')`.

## DI Audit (TZ-45)
- **`backend/scripts/audit-di.ts`** — статический анализатор DI cascade багов (~140 lines, regex-based).
- **Алгоритм:** build reverse index `className → {moduleFile, isGlobal}` из `*.module.ts` providers → parse `*.service.ts` constructors → extract injected types → check `imports: [...]` consumer module содержит provider module name.
- **Skip logic:** framework types (ConfigService/Logger/Model/MongooseModule), @Global() modules, self-injection, forwardRef, same-module providers.
- **TZ-45 result:** 22 false positives в 14 модулях. Manual verification: `ProductModule` реально импортирует `CounterModule` (скрипт regex bug в edge cases), backend `pnpm start:dev` BOOTS чисто. **0 real DI issues**.
- **Limitations:** script false positives из-за regex (comment `imports: []` или spread `...defaultImported`). Future: AST-based парсинг через ts.createSourceFile.
- **Use case:** future TZ-50+ может использовать как pre-commit hook (защита от regression: новый сервис добавлен, импорт забыли → script fail).

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

---

## Frontend UI Kit (shared/ui-kit/ — 2026-07-05 rework)

UI держится на **`@angular/material@20` (Material Design 3)** + трёх кастомных обёртках в `frontend/src/app/shared/ui-kit/`. Material даёт MD3 tokens (`--mat-sys-*`), accessibility и density mixins из коробки; обёртки закрывают 3 повторяющихся паттерна, для которых в Material нет готового «швейцара». Глобальный compact-mode в `frontend/src/styles.scss` (`@include mat.all-component-densities(-3)`) — table rows ≈36px, inputs/chips/paginator ≈36px без per-page правок.

### Три обёртки (расширяется до 4)

- **`<app-ui-page-header>`** — `frontend/src/app/shared/ui-kit/ui-page-header.component.ts`. Заголовок-страницы: rounded title icon tile + title (required) + optional subtitle + optional back-link (`backLink` input → `[routerLink]`) + content slot `[actions]` для trailing buttons. Standalone, OnPush, signal inputs.
- **`<app-ui-empty-state>`** — `frontend/src/app/shared/ui-kit/ui-empty-state.component.ts`. Empty-state block: icon + title (required) + optional description + default `<ng-content>` для CTA. Используется внутри `<tr class="mat-row" *matNoDataRow>` table-row'а и для пустых list-views.
- **`<app-ui-badge>`** — `frontend/src/app/shared/ui-kit/ui-badge.component.ts`. Status / isActive / isSystem indicator. Variants: `default | primary | success | warning | danger | info | muted`. Sizes: `sm | md`. Опции: `dot`, `icon`. Все варианты приводятся через MD3 tokens (`--mat-sys-*`) или path-faith semantic-tones (#16a34a / #d97706 / ...) через `color-mix`. `[matTooltip]` привязывается к host element, что даёт tooltip на весь badge.
- **`<app-ui-table-row-actions>`** — `frontend/src/app/shared/ui-kit/ui-table-row-actions.component.ts` *(P1, добавлено 2026-07-05 rework)*. Обёртка для actions-колонки в `<mat-table>`. Action buttons скрыты по умолчанию (opacity 0 + translateX 4px), staggered-reveal на row hover или `:focus-within` — первый button появляется мгновенно, последующие c `transition-delay: 30/60/90ms`. Persistent visibility через `[revealed]` input (для selected / editing rows). CSS-only animation (no JS). Применяется в будущих TZ для warehouses/orders/tech-process list-pages (TZ-49+).

### Acceptance criteria (проект-wide)

- `grep '<header class="page-header">' src/app/features/` → **0 hits** (вся inline разметка заменена на `<app-ui-page-header>`).
- `grep '<span class="chip">' src/app/features/` → **0 hits** (status / category / indicator идут через `<app-ui-badge>`).
- Никаких inline `<mat-chip color="primary">` привязок ни в каком feature-page.
- Все list-pages импортируют `UiPageHeader` / `UiEmptyState` / `UiBadge` из `shared/ui-kit/` и используют `<app-ui-*>` селекторы.

### Shell layout

- **`frontend/src/app/layouts/main-layout.component.ts`** — authenticated app shell. Owns topbar (brand + user meta + logout) + `<app-ui-page-header>` (с динамическим title/icon из active route) + `<router-outlet>`. Login page bypasses shell (standalone centered card).
- **`frontend/src/app/app.routes.ts`** — все auth-required routes (`home / materials / units / currencies`) вложены в `MainLayout` через `children: [...]` pattern. Per-route `data.icon` → page header icon; per-route `title` → page header title (после strip `KPPDF — ` prefix). Login — отдельный top-level route.

### Migrated pages

| Page | Path | Под ui-kit обёртками |
|------|------|----------------------|
| `/materials` | `features/materials/materials-list.page.ts` | ✅ page-header + empty-state + badges |
| `/units` | `features/units/units-list.page.ts` | ✅ page-header + empty-state + badges (isSystem warning, isActive success/danger) |
| `/currencies` | `features/currencies/currencies-list.page.ts` | ✅ page-header + empty-state + badges (IS-код info, isSystem warning) |
| `/home`, `/login`, `/categories`, `/products`, `/orders`, ... | `features/<name>/` | ⏳ future TZ — migrate remaining CRUD |

### Cross-cutting

- **Density -3 глобально:** один mixin `@include mat.all-component-densities(-3)` в `frontend/src/styles.scss` после `mat.theme(...)`. Per-component opt-out: `@include mat.table-density(0)`, `mat.form-field-density(0)`, etc.
- **Bundle impact:** обёртки — это pure Angular standalone components (no extra deps). С Material 20 уже в `node_modules` → net zero new deps в prod.
- **Token consistency:** все 3 обёртки + shell layout используют только MD3 tokens (`--mat-sys-surface`, `--mat-sys-primary`, `--mat-sys-outline-variant`, `--mat-sys-on-surface-variant`, `--mat-sys-error`). Никаких hardcoded hex (кроме semantic-tones `#16a34a`/`#d97706`/etc в badge variants — через `color-mix` для tonal neutral blending).
- **Расширение:** future wrappers (candidates) — `<app-ui-row-actions>` для staggered row actions на hover, `<app-ui-section-card>` для grouped forms. До тех пор пока паттерн не повторяется в 3+ page'ах — обёртку **не создаём** (YAGNI).

### Подробная документация обёрток

- **API таблицы, input specs, usage examples:** see `STACK.md §6 (UI patterns)` + `§6.4 (Global density)`.
- **Файлы, импорты, default values:** в doc-комментариях внутри каждой `ui-*.component.ts` (header doc-block в верхней части файла).
- **Глобальный dashboard / метрики:** см. `STATUS.md` → "UI Hardening Rework (2026-07-05)" секция + `progress.md` хронологическая запись rework'а.

### Структура директории shared/ui-kit/

```
frontend/src/app/shared/ui-kit/
├── ui-page-header.component.ts       # ~110 lines, signal inputs (icon/title/subtitle/backLink/backLabel)
├── ui-empty-state.component.ts       # ~80 lines, signal inputs (icon/title/description) + slot for CTA
├── ui-badge.component.ts             # ~170 lines, variant × size × dot × icon, MD3 tokens
└── ui-table-row-actions.component.ts # ~110 lines, CSS-only staggered hover-reveal, [revealed]/[staggerMs] inputs
```

Все три — `standalone: true`, `ChangeDetection.OnPush`, signal-based inputs (`input<T>()` / `input.required<T>()`).

---

## Toast (TZ-56 — Sonner-style service + host + a11y coverage)

- **`PiToastService`** — `frontend/src/app/shared/ui/toast/pi-toast.service.ts`. Sonner-style singleton (`providedIn: 'root'`) с in-memory queue + auto-dismiss через `setTimeout` (только если `duration > 0`) + listener fan-out через `Set<callback>`. API: `show`, `success`, `error`, `warning`, `dismiss(id?)`, `subscribe(cb) → unsubscribe`. Типы `ToastVariant` / `ToastOpts` / `QueuedToast` — все `export`нуты (раньше были internal).
- **`PiToastComponent`** — `frontend/src/app/shared/ui/toast/pi-toast.component.ts`. Sonner-style host:
  - **Host root:** `role="region"` + `aria-label="Управления"` + `aria-live="polite"` + `aria-atomic="true"`.
  - **Per-toast:** `role="status"` (default / success) ИЛИ `role="alert"` (error / warning) — screen-readers announce politely vs assertively.
  - **`.tours` / `.guides`** extra classes — для axe-core / Storybook tour markers.
  - **`Esc`** dismisses ALL queued toasts (`preventDefault` + `service.dismiss()` без id).
  - **SSR-safe** через `isPlatformBrowser(inject(PLATFORM_ID))` — `document.addEventListener` НЕ вызывается в server-side.
  - **Cleanup** через `DestroyRef.onDestroy()` (вместо `OnInit` / `OnDestroy`).
  - **Standalone + OnPush** + signal-based state.
  - **Reduced-motion** safety net: `@media (prefers-reduced-motion: reduce)` → animation-duration: 0.01ms (TZ-32 compliance).
- **Variant border map:** `default → border-rule`, `success → border-ink`, `error/warning → border-destructive`.
- **Subfolder barrel:** `frontend/src/app/shared/ui/toast/index.ts` экспортирует `PiToastComponent`, `PiToastService`, типы `ToastVariant` / `ToastOpts` / `PiToastItem` (QueuedToast rename).
- **Mount:** `<app-pi-toast-host>` ставится в `app.ts` root template.
- **Lock-файл:** `OrchestratorKit/.mimocode/locks/TZ-56-toast.lock` (стабилизирует `shared/ui/toast/*`).

---

## Progress (TZ-61 — hairline linear + circular indicator)

- **`PiProgressComponent`** — `frontend/src/app/shared/ui/progress/pi-progress.component.ts`. Standalone + OnPush + signal-based, hairline-only.
- **Variants:** `linear` (1px track + ink-filled value) и `circular` (SVG с двумя окружностями: rule-track 1px + ink-arc 1px; circumference = 2π·16 ≈ 100.53).
- **Sizes:** `sm | md | lg` (16/24/40 px square для circular; linear — full width).
- **Inputs (signal-based):** `value: input.required<number>()`, `max=100`, `variant='linear'|'circular'`, `size='sm'|'md'|'lg'`, `indeterminate=false`, `ariaLabel='Прогресс'`.
- **Computed:** `percent()` clamps [0..100], handles `max <= 0` defensively; `dashArray()` форматит SVG arc dasharray (`"20 80"` для indeterminate, `"<value> <circumference>"` для determinate).
- **A11y (WAI-ARIA compliant):** `role="progressbar"` + `aria-valuenow/min/max/label` на BOTH variants. Для indeterminate: `aria-valuenow` ОМИТТСЯ (null binding) + `aria-valuetext="Загрузка"` — WAI-ARIA: `aria-valuenow` не должен advertise value когда progress unknown.
- **Motion:** `motion-reduce:transition-none` Tailwind utility (TZ-32 compliance, `prefers-reduced-motion`).
- **NO shadow, NO hex, NO bg-white** — `box-shadow` / `drop-shadow` / `bg-white` patterns запрещены (Paper & Ink).
- **Subfolder barrel:** `frontend/src/app/shared/ui/progress/index.ts` экспортирует `PiProgressComponent`, типы `PiProgressVariant` / `PiProgressSize`.
- **Lock-файл:** `OrchestratorKit/.mimocode/locks/TZ-61-progress.lock` (стабилизирует `shared/ui/progress/*`).

---

## Skeleton (TZ-62 — static hairline placeholder blocks)

- **`PiSkeletonComponent`** — `frontend/src/app/shared/ui/skeleton/pi-skeleton.component.ts`. Standalone + OnPush + signal-based. Static `--color-rule` blocks @ 40% opacity, **NO shimmer / NO pulse / NO shadow** (Paper & Ink anti-bling principle).
- **Variants:** `text` (line-blocks, last line = 60% width via `last:w-3/5` Tailwind variant), `circle` (width=height, fully rounded, avatar placeholder), `rect` (block at width × height, card/media placeholder).
- **Inputs (signal-based):** `width='100%'`, `height='1rem'`, `variant='text'|'circle'|'rect'`, `count=1`, `ariaLabel='Загрузка'`.
- **Computed:** `lines()` materializes index array `Array.from({length: Math.max(0, count())}, (_, i) => i)` for `@for` loop. Defensive against `count=0` / negative.
- **A11y (WAI-ARIA compliant):** `role="status"` + `aria-live="polite"` + `aria-busy="true"` на host root div. Screen-reader announces "Загрузка" без прерывания текущей речи.
- **CSS-only last-item selection:** `[class.last\:w-3\/5]="variant() === 'text'"` applied to ALL spans — Tailwind `last:` pseudo-class handles per-element selection (no JS branching for last-item).
- **Spacing:** `mb-2` between text lines, `i < lines().length - 1` (no margin on last line).
- **Reduced-motion:** автоматически satisfied — нет анимации, нет `media query` нужен.
- **Subfolder barrel:** `frontend/src/app/shared/ui/skeleton/index.ts` экспортирует `PiSkeletonComponent`, тип `PiSkeletonVariant`.
- **Lock-файл:** `OrchestratorKit/.mimocode/locks/TZ-62-skeleton.lock` (стабилизирует `shared/ui/skeleton/*`).

---

## Avatar (TZ-63 — image + initials + lucide fallback, square monogram)

- **`AvatarComponent`** — `frontend/src/app/shared/ui/avatar/avatar.component.ts`. Standalone + OnPush + signal-based, 3-tier fallback chain.
- **3-tier chain** (`@if` / `@else if` / `@else`):
  1. Если `src()` задан → `<img object-cover draggable="false">` (fills container).
  2. Else if `computedInitials()` не пусто → монограмма (font-display uppercase) в центре квадрата.
  3. Else → `<i-lucide name="user" [size]="lucideSize()">` (50% of container, 12/16/20/28/40 px для xs/sm/md/lg/xl).
- **Inputs (signal-based):** `src: string | null`, `alt: string`, `initials: string`, `size='xs'|'sm'|'md'|'lg'|'xl'`, `rounded='square'|'rounded'`, `ariaLabel='Аватар'`.
- **Sizes:** `xs` (w-6 h-6, 10px), `sm` (w-8 h-8, xs), `md` (w-10 h-10, sm), `lg` (w-14 h-14, base), `xl` (w-20 h-20, xl).
- **Shape:** `square` (default, `rounded-none`) или `rounded` (`rounded-sm` 0.375rem, **НЕ pill/circular** — Paper & Ink anti-SaaS-cliché).
- **Computed `computedInitials`:** explicit `initials().trim().slice(0,2).toUpperCase()` OR derived из `alt().split(/\s+/).map(s=>s.charAt(0).toUpperCase()).slice(0,2).join('')`. `"John Doe"` → `"JD"`. Multi-space обрабатывается gracefully (no empty tokens).
- **A11y (WAI-ARIA compliant):** `role="img"` + `aria-label` на host. `<img>` имеет `alt`. Lucide icon + monogram имеют `aria-hidden="true"` (aria-label на host уже анонсирует identity).
- **Imports:** `LucideAngularModule` для `<i-lucide name="user">` fallback (matches peer badge/card pattern из TZ-34..35).
- **NO `rounded-full` / `box-shadow` / `drop-shadow` / `bg-white` / `#[hex]`** — spec acceptance #5.
- **Subfolder barrel:** `frontend/src/app/shared/ui/avatar/index.ts` экспортирует `AvatarComponent`, типы `PiAvatarSize` / `PiAvatarShape`.
- **Lock-файл:** `OrchestratorKit/.mimocode/locks/TZ-63-avatar.lock` (стабилизирует `shared/ui/avatar/*`).

---

## Separator (TZ-64 — hr OR label-on-line, hairline 1px --color-rule)

- **`PiSeparatorComponent`** — `frontend/src/app/shared/ui/separator/pi-separator.component.ts`. Standalone + OnPush + signal-based.
- **3 render branches** (`@if` / `@else if`):
  1. `horizontal` + `label` → `<div role="separator" aria-orientation="horizontal" aria-label="<label>">` flex layout: 2 hairlines (`h-px flex-1 bg-rule`) + `<span class="eyebrow text-base">` centered. Print-style bookmark для section dividers (e.g. "Foundations" между sections).
  2. `horizontal` + no `label` → `<hr role="separator" aria-orientation="horizontal" aria-label="<ariaLabel>">` с `border-0 border-t hairline border-rule`. Bare hairline divider.
  3. `vertical` → `<span role="separator" aria-orientation="vertical" aria-label="<ariaLabel>">` `inline-block w-px h-full bg-rule mx-3`. Inline sidebar / horizontal layout separator.
- **Inputs (signal-based):** `orientation='horizontal'|'vertical'`, `label=''` (Print-style bookmark text), `ariaLabel='Разделитель'`.
- **A11y (WAI-ARIA compliant):** `role="separator"` + `aria-orientation` на ВСЕХ 3 branches. Decorative hairlines в label branch помечены `aria-hidden="true"` (parent's role+aria-label уже announce the section).
- **NO shadow / NO hex / NO `border-dashed`** — spec acceptance #4.
- **Subfolder barrel:** `frontend/src/app/shared/ui/separator/index.ts` экспортирует `PiSeparatorComponent`, тип `PiSeparatorOrientation`.
- **Lock-файл:** `OrchestratorKit/.mimocode/locks/TZ-64-separator.lock` (стабилизирует `shared/ui/separator/*`).

---

## ScrollArea (TZ-65 — themed hairline scrollbar, max-height)

- **`PiScrollAreaComponent`** — `frontend/src/app/shared/ui/scroll-area/pi-scroll-area.component.ts`. Standalone + OnPush + signal-based.
- **3 orientations:** `vertical` (overflow-x-hidden + overflow-y-auto, default), `horizontal` (overflow-x-auto + overflow-y-hidden), `both` (overflow-auto).
- **Inputs (signal-based):** `maxHeight='320px'`, `orientation='vertical'|'horizontal'|'both'`, `ariaLabel='Прокручиваемая область'`.
- **Computed `computedClass`:** `pi-scroll-area ${orientationClass}` — single `[class]` binding (no static class to avoid Angular merge brittleness).
- **A11y (WAI-ARIA compliant):** `role="region"` + `tabindex="0"` + `aria-label`. Keyboard users can Tab into the scrollable region and use arrow-keys (default browser behavior, no JS).
- **Themed scrollbar (TZ-65 spec acceptance #2):**
  - Firefox: `scrollbar-width: thin; scrollbar-color: var(--color-rule) transparent`
  - Webkit/Blink: `::-webkit-scrollbar { width: 4px; height: 4px }`, track transparent, thumb `var(--color-rule)`.
  - Hairline 4px, **NO rounded overlay scrollbar** (Paper & Ink anti-bling).
- **styles.css @layer components block:** `.pi-scroll-area, .pi-scroll-area * { ... }` — applies themed scrollbar to host + all descendants (covers nested scrollers).
- **NO shadow / NO hex / NO bg-white** — spec acceptance #5.
- **Subfolder barrel:** `frontend/src/app/shared/ui/scroll-area/index.ts` экспортирует `PiScrollAreaComponent`, тип `PiScrollOrientation`.
- **Lock-файл:** `OrchestratorKit/.mimocode/locks/TZ-65-scroll-area.lock` (стабилизирует `shared/ui/scroll-area/*` + `styles.css` scrollbar block).

---

## Chart wrapper (TZ-66 — bar + line, pure-Angular SVG)

- **NO external chart lib** — hand-rolled pure-Angular SVG. ngx-charts install FAILED (pnpm `ERR_PNPM_PUBLIC_HOIST_PATTERN_DIFF`), d3 install also FAILED, so we shipped pure-Angular per thinker's fallback. Spec deviation documented in TZ-66 ARCHIVE_MARKER.

### Files
- **`PiChartComponent`** — `frontend/src/app/shared/ui/pi-chart.component.ts`. Configurator wrapper (figure + figcaption + content slot, hairline border, role=figure).
- **`PiBarChartComponent`** — `frontend/src/app/shared/ui/charts/pi-bar-chart.component.ts`. Bar chart with computed `scaleBand` + `scaleLinear` (pure-TS, see `scales.ts`), hairline 1px grid, sharp 1px rx corners.
- **`PiLineChartComponent`** — `frontend/src/app/shared/ui/charts/pi-line-chart.component.ts`. Line chart with `linePath` generator, dots r=2, 1.5px stroke (NOT 3px blob), optional legend.
- **`chart.tokens.ts`** — `frontend/src/app/shared/ui/charts/chart.tokens.ts`. 4 palettes (mono / mono-warm / mono-cool / paper-ink) using CSS custom properties; viewBox 480x320; bar/line geometry constants.
- **`scales.ts`** — `frontend/src/app/shared/ui/charts/scales.ts`. Pure-TS `scaleBand`/`scaleLinear`/`linePath` helpers (~55 lines, no d3 dep).
- **`charts/index.ts`** — barrel exports all components + types + tokens + scales.

### Reactive colorScheme (TZ-77 Theme Editor)
Each bar's `fill` and each line's `stroke` is a CSS custom property like `var(--color-accent-warm)`. TZ-77 Theme Editor updates `<html>` --color-* vars → chart re-tints automatically (0 JS listener).

### X-axis baseline
Uses `zeroY()` computed = `padding.top + yScale()(0)`. For non-negative data, equals viewBox bottom. For mixed-sign data, follows the data zero-line.

### Method calls in template
`barGeometry`, `colorFor`, `xPosFor`, `pathFor` are called on every CD cycle. Code-reviewer flagged as future optimization for large datasets (>50 points). For typical Paper & Ink editorial use (4-12 points), this is fine.

### Lock-файл
`OrchestratorKit/.mimocode/locks/TZ-66-charts.lock` (стабилизирует `shared/ui/pi-chart.component.ts` + `shared/ui/charts/*`).

---

## KitLayout (TZ-67 — sticky app shell + ⌘K hint + theme toggle)

**Файлы:** `frontend/src/app/layout/kit-layout.component.ts` + `theme-toggle.component.ts`.

**App shell** для editorial SPA (enrich поверх TZ-30 base layout):

- **Sticky top-bar:** `<header class="sticky top-0 z-20 border-b border-rule bg-paper/80 backdrop-blur">` с brand слева + ⌘K hint + theme toggle справа.
- **Sticky sidebar:** `<aside class="sticky top-14 h-[calc(100dvh-3.5rem)] border-r border-rule">` с nav через `<ng-content select="[nav]">`.
- **Content:** `<main class="px-8 py-10 max-w-6xl mx-auto"><ng-content /></main>` — standard prose width.
- **Theme toggle:** использует `ThemeService.toggle()` + `mode()` signal (НЕ manual localStorage writes — ThemeService уже инкапсулирует storage из TZ-33).
- **Default light mode** per TZ-67 spec (initial DOM is light, ThemeService.init() syncs to stored preference).
- **<kbd> element** для ⌘K hint (semantic kbd, не div).

**`theme-toggle.component.ts`:** 2-variant button (sun/moon Lucide icons) с `aria-pressed` для accessibility. Inputs: `ariaLabel='Переключить тему'` (overridable). Standalone + OnPush + signals.

**Lock-файл:** `OrchestratorKit/.mimocode/locks/TZ-67-kit-layout-enrich.lock` (стабилизирует `layout/kit-layout.component.ts` + `layout/theme-toggle.component.ts`).

---

## Page primitives (TZ-68 — PageHeader · Section · Demo)

**Файлы:** `frontend/src/app/shared/page/`.

**3 wrapper'а** для future pages (TZ-69..74 batch):

- **`<pi-page-header>`** — eyebrow (uppercase 12px tracking-wide + accent line) + h1 (font-display text-4xl font-light tracking-tight) + subtitle (text-ink-2 text-lg max-w-prose) + meta (small caps right-aligned). Inputs: `eyebrow`, `title` (required), `subtitle`, `meta`. Signal-based.
- **`<pi-section>`** — section wrapper с hairline border-top (1px) + padding-y 12. Inputs: `eyebrow`, `title` (required), `id` (for deep-link anchors через fragment navigation). Content slot default. Используется в TZ-69..74 pages для anchored deep-links.
- **`<pi-demo>`** — demo card с title (required) + description (optional) + preview slot default + code toggle (signal-based `codeOpen`). Code can be passed via `[code]` string OR via `<ng-content select="[source]">` slot (latter для TZ-78 live code). Toggle button: discrete `<button>` с chevron, `aria-expanded`. Mono code в `<pre>` с sharp 1px rx.

**Все 3:** standalone + OnPush + signal inputs. No any/OnInit/OnDestroy. NO shadow / NO hex / NO bg-white (Paper & Ink anti-bling).

**Lock-файл:** `OrchestratorKit/.mimocode/locks/TZ-68-page-primitives.lock` (стабилизирует `shared/page/*`).

---

## WAVE C: 6 lazy pages (TZ-69..74, 2026-07-05)

**6 page-файлов** под `frontend/src/app/pages/`, lazy-loaded через `app.routes.ts` → `KitLayoutComponent` (TZ-67) → `<router-outlet>`. Все standalone + OnPush + signal-based, используют `<pi-page-header>` + `<pi-section>` + `<pi-demo>` (TZ-68).

| Page | TZ | Sections | Notable primitives |
|------|-----|---------|---------------------|
| `/overview` | TZ-69 | PageHeader + Быстрый старт + Что внутри + Принципы + Sonner toast panel | pi-button, pi-card, pi-badge, lucide icons, data-toast-trigger smoke test |
| `/foundations` | TZ-70 | PageHeader + Палитра (8 OKLCH swatches) + Типографика + Spacing & Radius + Grid | pi-card (preview/info slots), native inline styles |
| `/basics` | TZ-71 | PageHeader + Buttons (6×4×2) + Inputs (signal-state) + Badges (4×2) + Cards (3 comps) | pi-button, pi-badge, pi-form-field, native input/textarea |
| `/forms` | TZ-72 | PageHeader + Validated form + Data table + Form variants | raw HTML `<table>`, raw pagination buttons, ReactiveForms + class-validator |
| `/overlays` | TZ-73 | PageHeader + Dialog + Sheet/Drawer + Tooltip/Popover + DropdownMenu + Toast | PiToastService (variants), custom dropdown, lucide icons |
| `/navigation` | TZ-74 | PageHeader + Tabs + Breadcrumb + Accordion + Progress/Skeleton/Avatar + Charts + Separator + ScrollArea | pi-tabs/tab, pi-breadcrumb/item, pi-accordion/item, pi-progress, pi-skeleton, pi-avatar, pi-separator, pi-scroll-area, pi-bar-chart, pi-line-chart |

**Spec deviations (документированы в .done.txt файлах):**
1. **Input/Textarea (TZ-71):** директивы не существуют (InputComponent/TextareaComponent — components, не directives). Реализовано native `<input>`/`<textarea>` с Tailwind-стилями.
2. **Table + Pagination (TZ-72):** TableComponent/PaginationComponent существуют но API не идеально подходит — raw HTML `<table>` + raw buttons для пагинации.
3. **Dialog demos (TZ-73):** `PiDialogService.open()` сигнатура `(component, config)` — для demo используется toast. Полная CDK-overlay flow: `dialog.open(PiDialogComponent, { data: {...} })`.
4. **Breadcrumb (TZ-74):** `href` prop на custom component рендерит native `<a href>`. Для SPA nav может потребоваться `[routerLink]`.

**Total:** ~1262 lines across 6 pages. Typecheck PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit` exit 0). No box-shadow/drop-shadow/hex/bg-white.

**Lock-файлы:** `OrchestratorKit/.mimocode/locks/TZ-{69..74}-{name}-page.lock` (стабилизируют `pages/*/*.page.ts`).

---

## Command Palette (TZ-75 — ⌘K fuzzy search + nav)

**Файлы:** `frontend/src/app/shared/command/pi-command-palette.component.ts` + `pi-command-palette.service.ts` + `index.ts` + `app.ts` (mount).

**Linear / Raycast-style ⌘K overlay:**
- **Service** — singleton (`providedIn: 'root'`), signal-based `_isOpen` state, SSR-safe keyboard listener (Cmd/Ctrl+K toggle, Esc close).
- **Component** — standalone + OnPush + signal-based. 30 items: 6 routes (`/overview`..`/navigation`) + 24 primitives (Button, Badge, Dialog, Sheet, Tooltip, Popover, DropdownMenu, Toast, Tabs, Breadcrumb, Accordion, Progress, Skeleton, Avatar, Separator, ScrollArea, Charts) + 1 action (theme toggle).
- **Fuzzy filter** — subsequence char-by-char match (every char in query must appear in label, in order).
- **Keyboard nav** — ArrowDown/Up cycle `selectedIdx`, Enter activates, Esc closes (service).
- **Backdrop** — `bg-ink/30` opacity (NOT blur, NOT glassmorphism — Paper & Ink anti-bling).
- **Mount** — `<app-pi-command-palette />` в `app.ts` рядом с `<app-pi-toast-host />`.

**Theme toggle action** uses `inject(ThemeService).toggle()` directly (TZ-33). Initial implementation had broken `window.__piThemeService` lookup (code-reviewer NEEDS_FIX — fixed).

**mouseenter handler** removed per code-reviewer (prevented keyboard nav clobbering).

**Lock-файл:** `OrchestratorKit/.mimocode/locks/TZ-75-command-palette.lock` (стабилизирует `shared/command/*` + `app.ts`).

---

## Prop Playground (TZ-76 — live signal-driven controls)

**Файлы:** `frontend/src/app/shared/playground/pi-playground-button.component.ts` + `pi-playground-badge.component.ts` + `index.ts`.

**Storybook-style controls** для Button + Badge:
- **`<app-pi-playground-button>`** — split view (grid-paper preview + controls panel). Signals: variant (6 options), size (4), disabled, loading, hasLeadingIcon, label. 6×4×2 button coverage + label editor.
- **`<app-pi-playground-button>` loading state** — inline spinner span с Tailwind `animate-spin` (no box-shadow, no hex).
- **`<app-pi-playground-badge>`** — split view + signals: variant (4), size (2), dot, text. 4×2 badge coverage + dot toggle.

Все standalone + OnPush + signal-based. NO box-shadow/drop-shadow/hex/bg-white.

**Lock-файл:** `OrchestratorKit/.mimocode/locks/TZ-76-playground.lock`.

---

## Theme Editor (TZ-77 — live OKLCH sliders)

**Файлы:** `frontend/src/app/shared/theme/theme-editor.service.ts` + `pi-theme-editor.component.ts` + `index.ts` + `pages/playground/theme-editor.page.ts` + `app.routes.ts`.

**Live OKLCH editor** на `/playground/theme`:
- **Service** — signal-based override state, NON-DESTRUCTIVE: TZ-32 base @theme inline values сохранены, overrides applied via `style.setProperty('--color-X-override', oklch(L% C H))`. Persists в localStorage `pi.theme-overrides` (JSON). SSR-safe (isPlatformBrowser guard).
- **Component** — 3 slider groups (ink/paper/rule) × 3 dimensions (L/C/H) = 9 sliders. Live preview с Card + Badges + Button. DecimalPipe для value display.
- **Page** — PageHeader + Sliders + Reset explanation section.
- **Route** — `app.routes.ts` +`/playground/theme` lazy-loaded.

**Code-reviewer fixes applied:** (1) DecimalPipe imported + в component's imports array (для `| number: '1.0-2'` pipe), (2) `reset()` использует single `commit()` (DRY).

**Lock-файл:** `OrchestratorKit/.mimocode/locks/TZ-77-theme-editor.lock`.

---

## Live Code Preview (TZ-78 — FALLBACK: no highlight.js)

**Файлы:** `frontend/src/app/shared/code/pi-code-preview.component.ts` + `index.ts`.

**Spec deviation:** `pnpm add highlight.js@^11` FAILED с `ERR_PNPM_PUBLIC_HOIST_PATTERN_DIFF` (тот же pnpm config blocker, что и TZ-66 charts). Fallback: plain monospace `<pre><code>` БЕЗ syntax highlighting.

**PiCodePreviewComponent** (~40 lines):
- Standalone + OnPush + signal-based.
- Inputs: `code` (required), `language` (default html), `ariaLabel`, `showLineNumbers` (default true).
- Computed `formattedCode` — line numbers через padStart(3).
- Template: `<pre class="bg-paper-2 border-t hairline border-rule p-4 overflow-auto mono text-[12px] leading-relaxed text-ink">` + `<code class="block whitespace-pre">`.
- No syntax highlighting (fallback). Future TZ-78b: re-attempt `pnpm add highlight.js@^11` после `pnpm install` reconcile.

**Lock-файл:** `OrchestratorKit/.mimocode/locks/TZ-78-live-code-preview.lock`.

---

## Print stylesheet (TZ-79 — @media print block, axe-core DEFERRED)

**Файлы:** `frontend/src/styles.css` (@media print block only).

**Spec deviation:** `pnpm add -D axe-core@^4.10` FAILED same reason. axe-core a11y audit spec DEFERRED.

**@media print block**:
- `:root` overrides: paper → white, ink → black, rule → #ccc.
- Hide chrome: aside, header[role='banner'], footer, palette, toast.
- main padding 0, max-width 100%.
- section break-inside avoid (page-break friendly).
- h1 22pt, h2 14pt, h3 12pt.
- Remove all animations/transitions/shadows.
- `a[href]:not([href^='#']):after` shows link URL after text.

**No new deps required** для @media print block.

**Lock-файл:** `OrchestratorKit/.mimocode/locks/TZ-79-print-a11y.lock`.

---

## SSR / Hydration (TZ-80 — DEFERRED)

**DEFERRED — @angular/ssr install FAILED** (`pnpm add @angular/ssr@^20 express` → ERR_PNPM_PUBLIC_HOIST_PATTERN_DIFF).

Future TZ-80b:
- `pnpm install` reconcile.
- `pnpm add @angular/ssr@^20 express`.
- Создать main.server.ts + server.ts (Express listener).
- Update main.ts (conditional bootstrap) + app.config.ts (provideClientHydration).
- Update angular.json (server build target) + package.json.
- `pnpm build` → dist/frontend/{browser,server}.
- Lighthouse ≥95 across 4 categories.

**Lock-файл:** `OrchestratorKit/.mimocode/locks/TZ-80-ssr-hydration.lock` (placeholder, no code changes).

---

## Browser-use smoke test (TZ-82 — DEFERRED)

**DEFERRED — depends on TZ-80 (SSR preview) which is itself deferred.**

Без SSR preview на :4000, smoke tests не могут быть запущены. Future TZ-82b (после TZ-80 done): Playwright + Lighthouse + browser-use agent fallback.

**Lock-файл:** `OrchestratorKit/.mimocode/locks/TZ-82-smoke-test.lock` (placeholder, no code changes).
