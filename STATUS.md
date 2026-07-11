# STATUS — KPPDF ERP Project Status

**Last updated:** 2026-07-11
**Phase:** TZ-83 (Модульная иерархия Товар→Модуль→Материал+Вид работ) — ЗАВЕРШЕНО
**Total tasks:** 48/48 ✅ (TZ-02..TZ-46) + TZ-AUDIT-9 + 9.1 + TZ-WARMUP-100 + TZ-LIGHT-XX + TZ-83

## ✅ Завершённые этапы

### Backend (TZ-01..TZ-18)
- TZ-01..TZ-08: Auth + Users + Roles + Permissions + Reference data
- TZ-09..TZ-13: Catalog (Products, Materials, BOM) + Storage
- TZ-14..TZ-15: Document Templates + Finance (Reconciliation, Reports)
- TZ-16: Integrations (CSV Import, Comments)
- TZ-17: E2E tests (7 suites)
- TZ-18: Production Hardening (Rate Limit, Helmet, CORS, Health)

**Build:** pnpm run build ✅ (280+ файлов, 65 entities). **Frontend build:** pnpm run build ✅ (0 warnings) — см. UI Hardening Rework ниже.

### Frontend (TZ-19..TZ-29)
- TZ-19: Frontend Foundation (Angular 20 + Tailwind + AG Grid)
- TZ-20: Auth + Layout (sidebar/topbar/main) + 65 generic pages
- TZ-29: Dashboard (4 KPI cards) + Task Panel (8 phase groups)

### Frontend Phase 2 (TZ-30..TZ-40)
- TZ-30: CRUD actions + per-page FormSchema (FormDialog, RowActions, 5 страниц с fields[])
- TZ-31..TZ-40: UI Kit — foundation (cn/cva/theme/scroll-spy/button) + 10 секций showcase на /p/showcase (core primitives, advanced inputs, charts, calendar/otp/kbd, overlays, layout primitives)

**Build:** pnpm run build ✅ (542.84 kB initial bundle, 0 warnings)

### UI Hardening Rework (2026-07-05)
- **Material MD3 + custom shared/ui-kit wrappers + density -3 глобально** — свёрнутый стек UI под реальные нужды проекта (а не 35+ generic shadcn-style компонентов из TZ-31..TZ-40).
- **`@angular/material@20.2`** — оставлен как единственный UI-кит (даёт MD3 tokens `--mat-sys-*` + accessibility + density mixins).
- **3 кастомные обёртки** в `frontend/src/app/shared/ui-kit/` — закрывают повторяющиеся паттерны, для которых в Material нет готового:
  - `<app-ui-page-header>` — заголовок страницы (icon + title + subtitle + back-link + action slot).
  - `<app-ui-empty-state>` — empty-state для `*matNoDataRow` / пустых filter-results / «нет данных».
  - `<app-ui-badge>` — status / isActive / isSystem indicator (variant × size × dot × icon).
- **Глобальный compact-mode**: `@include mat.all-component-densities(-3)` в `frontend/src/styles.scss` (после `mat.theme()`) → table rows ≈36px, inputs/chips/paginator ≈36px без per-page правок. Per-component opt-out: `@include mat.table-density(0)`, `mat.form-field-density(0)`, etc.
- **Migrated**: `materials-list.page.ts`, `units-list.page.ts`, `currencies-list.page.ts` → ui-kit обёртки. Acceptance: `grep '<header class="page-header">' src/app/features/` = 0, `grep '<span class="chip">' src/app/features/` = 0.
- **Подробности:** см. `STACK.md §6 (UI patterns)` + `§6.4 (Global density)` + `progress.md` entry этого rework (2026-07-05).

### Dev Tooling (TZ-41..TZ-46)
- TZ-41: Health Check Panel + Log TUI Mode — `start.mjs` стал TUI-aware orchestrator с `--tail` режимом (in-place статус 3 сервисов, ring buffer 5 строк на сервис, финальная "Ready" панель с латентностями /api/health). checkHealth() парсит JSON body и определяет `degraded` состояние.
- TZ-43: Fix Mongoose Duplicate Indexes — удалены 6 дублирующих single-field `Schema.index({...})` в 6 schemas (product/material/organization/counterparty/category/certificate). Compound indexes сохранены. Diff: 6 deletions, 0 additions.
- TZ-44: DEP0190 Fix — заменены 4 `shell: isWin` на `execFile(resolveBin(...))` в start.mjs (getVersion, installDeps, spawnDetached, openBrowser). DEP0190 warning устранён. На Windows child.pid теперь pnpm.cmd (не cmd.exe wrapper). Diff: ~30 lines.
- TZ-45: Backend DI Audit — создан `backend/scripts/audit-di.ts` (статический анализатор, ~140 lines). Audit вернул 22 false positives; manual verification: 0 real DI cascade багов (backend boots clean). Script оставлен для future pre-commit hook.
- TZ-42: Production Deployment Mode — добавлен `--prod` флаг в start.mjs: `pnpm build` для backend+frontend, `node dist/main.js` (NODE_ENV=production) + inline static server (Node http+fs, ~80 lines, без new deps) раздаёт `dist/frontend/browser/` на :4200. SPA fallback, path traversal protection, cache headers. `npm run start:prod` алиас. Bundle sizes в Ready panel. Caveat: local prod-like testing, НЕ полноценный prod deploy.
- TZ-46: Clean Launch Console — все log-сообщения start.mjs на русском (preflight, mongo, deps, build, banner, cleanup, waitFor). `printReadyPanel` переписан с длинного «простынного» вывода на компактную 2D панель: ASCII-рамка `╔══╗`/`╚══╝` с заголовком `✦ kppdf-8.0 готов к работе ✦`, summary `⏱ Все сервисы готовы за Xs`, 2-col endpoints (`🖥 Frontend | 👤 Логин` + `📦 Backend | 📋 Showcase`). Динамическая ширина колонок через `stdout.columns` (clamp 80..120). NG warnings fix: 3× NG8113 (unused imports в page-renderer + showcase) + 2× NG8102 (unnecessary `??` в otp-input + scroll-area) → frontend build 0 warnings. NestJS logger: nestjs-pino level='info' (excludes debug/verbose). Console clean: 0 warnings, 0 deprecations.

**Smoke test:** `node start.mjs` — preflight ✅, Mongo RS ready ✅, backend boot ✅, /api/health OK, 0 Mongoose "Duplicate schema index" warnings, 0 DEP0190, 0 DI cascade errors.

### TZ-AUDIT-9 + TZ-AUDIT-9.1 (2026-07-07) — Warm Paper Palette Rebrand
- **Мотивация (от пользователя):** «исправить чёрно-серые цвета, сайт мрачный». Pre-Audit-9 палитра: hue ~80 + chroma 0.005-0.01 (почти desaturated), ink = pure black `oklch(0.145 0 0)`. Всё читалось холодно/безлико. Sunrise-палитра существовала, но UI-Kit оставался в B&W → акценты «выскакивали» как чужеродные.
- **TZ-AUDIT-9 — изменения:**
  - Base palette (8 токенов, light mode): hue 80→**70 (golden-beige)**, chroma 0.005-0.01→**0.015-0.025**, ink `oklch(0.145 0 0)` → **deep espresso `oklch(0.180 0.015 70)`**. Paper → warm cream, rule → warm gray, muted-foreground → warm medium.
  - Accent-cool: hue 230 (cyan) → **hue 250 (indigo)** — убрана вибрация с тёплой базой.
  - Dark mode: cold charcoal + cold white → **warm espresso (`oklch(0.21 0.015 70)`)** + **warm cream text (`oklch(0.95 0.015 70)`)**.
  - Sunrise палитра **UNCHANGED** (hue 55-80 уже внутри базы 70) — теперь естественно перетекает.
  - **JSDoc конвенции** (TZ-AUDIT-8): HAIRLINE-FIRST BORDER (66+ `border hairline border-rule` → `hairline` + 13× `border-t...` → `hairline-t`), SECONDARY TEXT (40× `text-muted` → `text-muted-foreground`), WCAG note на `text-muted-foreground` (~3:1, AA Large only) с DON'T-list.
  - **Defensive longhand**: 5 utility classes (`hairline`, `hairline-t/b/r/l`, `pi-input`, `pi-icon-btn`, `.pi-outline-btn`) converted — `border-ink` / `border-destructive` overrides ВСЕГДА выигрывают в cascade.
  - FoundationsPage swatches (6/8) обновлены; hairline border demo переработан (3 thin variants: rule / ink / destructive).
- **TZ-AUDIT-9.1 — изменения:** Dark mode L bump. Reviewer: «warm dark reads denser than cool dark». `--color-paper` (dark) L **0.18 → 0.21**, `--color-paper-2` (dark) L **0.24 → 0.27**. Hue/chroma UNCHANGED. JSDoc: «higher L gives the surface breathing room».
- **Visual verification** (browser-use через /kit/* public route prefix): 12 screenshots (6 pages × 2 modes), 0 console errors, warm-paper feel confirmed, dark mode warm espresso с visible card separation.
- **3 review rounds, 4 MINORs closed:** (1) Stale Sunrise JSDoc, (2) `text-muted-foreground` WCAG note placement + 3.1:1 wording, (3) Dark mode L=0.18 too dark (deferred to TZ-AUDIT-9.1), (4) TZ-AUDIT-9b naming → TZ-AUDIT-9.1.
- **Discovery:** /kit/* routes уже PUBLIC (no authGuard) — same page components, different layout shell. Это спасло от 1-line route config change для visual verification. Operational pages (/materials, /organizations, /dictionaries) — dev proxy работает (proxy.conf.json проксирует /api/* и /uploads/* на backend :3000).
- **Затронутые файлы:** `frontend/src/styles.css` (palette tokens + JSDoc + 5 utility longhand), `frontend/src/app/pages/foundations/foundations.page.ts` (6 swatches), + pre-Audit-9 cleanup (27 файлов `text-muted` → `text-muted-foreground`, 34 файла `border hairline border-rule` → `hairline`, `forms.page.ts` NG8113 fix).
- **Verification:** 166/166 tests passing, typecheck exit 0, code-reviewer approved (3 rounds), 12 browser-use screenshots, no console errors.
- **Известные ограничения (не блокеры):** `text-muted-foreground` ~3:1 contrast (AA Large only, fails AA Standard) — JSDoc note + DON'T-list покрывают. Dark mode L=0.21 может быть bumped back в 0.20-0.22 range если пользователь предпочитает темнее.
- **Архив:** `tasks/_archive/2026-07/TZ-AUDIT-9.md.done` (с comprehensive ARCHIVE_MARKER).

### TZ-LIGHT-XX (2026-07-08) — Light Tones Pivot + comprehensive audit

**Мотивация:** Пользователь: «нужно изменить цвета, светлые тона». После TZ-WARMUP-100 (chroma bump) палитра оставалась на прежних L (lightness) — ink `oklch(0.180)`, rule `oklch(0.850)` — читалось насыщенно, не «светло». Пользователь выбрал 7 опций для осветления: muted-foreground, rule, ink, destructive, sunrise, accent-warm/cool, paper-2.

**Изменения палитры (~3 файла):**
- `styles.css`: все 14 OKLCH-токенов (light + dark) — L значения подняты на +0.03–0.10. Ink: 0.180→0.250 (soft charcoal, ~9:1 WCAG AAA). Rule: 0.850→0.880. Muted-fg: 0.55→0.58 (компромисс с code-review, L=0.62 давал <3:1). Dark mode симметрично (paper 0.21→0.25, paper-2 0.27→0.32). Hue 70 (warm paper direction) UNCHANGED.
- `foundations.page.ts`: swatches синхронизированы с новыми значениями.
- `docs/paper-and-ink.md`: добавлена полная таблица TZ-LIGHT-XX + отдельная секция `## WCAG Contrast Ratio Compliance` с тремя таблицами (light text, dark text, non-text tokens), подтверждающая что все текстовые токены проходят AA Large минимум.

**Сопутствующие доработки (в той же сессии):**
- **Border-паттерны (25+ файлов):** `border hairline border-rule` → `hairline`/`hairline-b/r/l` по всей кодовой базе. Остался только 1 хит в JSDoc `styles.css` (намеренно).
- **Focus-ring унификация (12 компонентов):** hardcoded `focus-visible:ring-2 ring-ink ring-offset-2 ring-offset-paper` → единый класс `pi-focus-ring` из `--focus-ring-shadow`.
- **NG5002 fix:** `pi-theme-editor.component.ts` — regex literal внутри template binding (блокировал dev-server). Вынесен в метод `sliderId()`.
- **`docs/add-new-page.md`:** добавлены Border & focus-ring конвенции для новых страниц.
- **`docs/paper-and-ink.md`:** JSDoc обновлён (MIGRATION COMPLETE).

**Verification:**
- `pnpm exec tsc` → exit 0 ✅
- WCAG audit через `culori` 4.0.2: все текстовые токены проходят AA Large минимум; body text (ink) — AAA 14.75:1 ✅
- Browser-use visual audit: 0 console errors на /kit/foundations, /kit/overview, /kit/basics, /kit/forms, /kit/navigation, /kit/overlays, /materials, /organizations, /dictionaries ✅
- Dark mode на /kit/* страницах — все компоненты корректно инвертируются ✅

**Artefacts:** `progress.md` (+запись), `docs/paper-and-ink.md` (+WCAG секция), ".gitignore" (+`_tmp/`).

**Известные ограничения (не блокеры):**
- `muted-foreground` contrast 3.96:1 (AA Large only, не AA Standard) — intentional, резервирован для non-essential captions.
- `--color-paper` (light) не менялся — остался `oklch(0.972 0.015 70)`. Не чистый белый, warm off-white.

### TZ-83 (2026-07-11) — Модульная иерархия Товар→Модуль→Материал+Вид работ

**Мотивация:** Бизнес-схема: товар = комбинация модулей (корпус, дверца, фурнитура); модуль = набор материалов (с возможностью override-габаритов) + норма-часов по видам работ. Из этого считается себестоимость. До TZ-83 данные лежали в legacy `ProductComponent` (snapshot `name` поля), что теряло связь с актуальным Material. После TZ-83 — нормальный relational M:N + персистентный override + отдельный photo entity.

**Полный объём (5 фаз, ~25 файлов):**

**Phase A — Backend cleanup (5 review rounds PASS):**
- `ProductComponent` удалён (папка + регистрация в `app.module.ts`).
- `ProductModule.materials[]` мигрирован со snapshot-`name` на `materialId: ObjectId (ref)` + `overrideDimensions?: { length?, width?, height?, unit? }` subdoc.
- `ProductModule.productId` + `image` — удалены (M:N чистая через `Product.productModuleIds[]`; gallery вынесена в отдельную entity).
- Индексы перестроены: `{productId, sortOrder}` (баг — `_id` всегда уникален и не фильтруется) → `{sortOrder}` + `{name: 'text'}` для full-text search.
- `ProductController` — atomic `POST /products/:id/modules` (`$addToSet`) + `DELETE /products/:id/modules/:moduleId` (`$pull`). Race-condition-safe при concurrent edit. `@Roles('admin','manager')` + `@AuditAction`.
- `ProductService.findById` — nested populate (workTypes + materials) + existence-check для attach (защита от dangling ObjectId).
- `bom.schema.ts` — `ref: 'ProductComponent'` → `ref: 'ProductModule'` + TODO миграция existing BOM.
- `ProductModulePhoto` — НОВАЯ entity (schema/service/controller/module). Schema-level validator `photoId || url`. Atomic `setMain(id)` (findOneAndUpdate + all others false).
- `backend/scripts/tz83-drop-stale-productcomponents.ts` — idempotent cleanup-скрипт, env-overridable (`MONGO_URI`), reviewed safe.

**Phase B — Frontend data + WorkTypes dictionary:**
- 3 shared services: `pi-work-types.service.ts`, `pi-product-modules.service.ts`, `pi-product-module-photos.service.ts` — все на `silent-http` + signals + `SilentResult<T>`.
- `pages/work-types/` — новая dictionary секция (canonical pattern materials/units/currencies).
- `app.routes.ts` — `/work-types` lazy route.
- `app-layout.component.ts` — nav-link «Виды работ».

**Phase C — `/modules` list + `/modules/:id` detail (4 sections):**
- `pages/modules/modules.page.ts` — list с photo-thumb, артикулом, габаритами, counts, search/sort, row→detail.
- `pages/modules/module-detail.page.ts` — 4 sections: Основное / Фотогалерея / Материалы / Виды работ.
- `pages/modules/module-form-dialog.component.ts` — basics + dimensions + workTypes FormArray.
- `pages/modules/module-materials-form-dialog.component.ts` — FormArray + conditional override-габариты UI.

**Phase D — `/products/:id` detail + integration:**
- `pages/products/product-detail.page.ts` (NEW) — 4 sections + секция «Модули» с attach/detach через picker.
- `pages/products/product-module-picker-dialog.component.ts` (NEW) — lookup всех модулей, multi-select через atomic endpoint.
- `pages/products/products.page.ts` — clickable rows (RouterLink) + колонка «Модулей: N».

**Phase E — Tests:**
- 3 backend e2e specs: `product-modules.e2e-spec.ts`, `product-module-photos.e2e-spec.ts`, `products-attach-modules.e2e-spec.ts`. Canonical `.expect(201)` (NestJS POST default).
- 3 frontend unit specs: `pi-work-types.service.spec.ts` (3), `pi-product-modules.service.spec.ts` (4), `pi-product-module-photos.service.spec.ts` (4). TestBed + provideHttpClientTesting + API_BASE_URL.
- **11/11 новых unit-тестов passing** ✅ + 3 e2e specs готовы к запуску.

**Verification:** Backend typecheck exit 0 ✅ · Frontend typecheck exit 0 ✅ · 11/11 unit tests pass ✅ · Code-reviewer approval: Phase A (5 rounds), Phases B–E (multi-round bugfixes).

**Известные ограничения (не блокеры):**
- `bom.schema.ts` всё ещё требует data-migration existing BOM к новому `ProductModule._id` (deleted `ProductComponent._id` references). Отдельный TZ.
- Photo upload UI /modules/:id → только URL-fallback через `PhotoService`. File-picker UI отложен до TZ-87.
- Mobile responsive не тестировался на detail pages (TZ-83 scope = desktop first).

## 🎯 6-направленная сессия улучшений (2026-07-08)

**Мотивация:** Пользователь: «улудшишь дальше? грамотно!» — выбран полный набор улучшений: theme toggle для operational-страниц, осветление фона, тёплый акцент для active/primary элементов, проверка login page, SettingsSeed fix, CRUD-миграция.

**Что сделано (13+ файлов, typecheck ✅, code review ✅):**

**1. SettingsSeed StrictModeError — verify**
- Проверено: `feature-flag.schema.ts` и `setting.schema.ts` уже имеют `deletedAt` prop + `softDelete: false`. Плагин корректно возвращает early exit. Fix уже в коде с TZ-46. Никаких изменений не потребовалось.

**2. Theme toggle для operational-страниц**
- `app-layout.component.ts` — добавлен `<app-teme-toggle />` в хедер (рядом с кнопкой выхода).
- Переиспользован существующий `ThemeToggleComponent` (из kit-layout) + `ThemeService` (из core/).
- Теперь ВСЕ страницы (/materials, /organizations, /dictionaries, /products — все под app-layout) имеют переключатель темы.

**3. Ещё светлее — paper-2 bump**
- `styles.css`: paper-2 L 0.945→**0.960** (light), 0.32→**0.33** (dark). Chroma снижен 0.035→0.030 для «воздушности». Non-text token — WCAG не применяется.

**4. Тёплый акцент — active nav / primary button / badge / checkbox / select / pagination / command palette — bg-ink → bg-sunrise-warm (9 файлов)**
- `app-layout.component.ts` — active nav link
- `kit-layout.component.ts` — active nav link
- `button/button.component.ts` — default variant (`bg-ink text-paper` → `bg-sunrise-warm text-paper`)
- `badge/badge.component.ts` — default variant
- `checkbox/checkbox.component.ts` — checked state (`bg-ink text-paper border-ink` → `bg-sunrise-warm text-paper border-sunrise-warm`)
- `select/select-option.component.ts` — selected state (template + CSS)
- `pi-pagination.component.ts` — active page (`activeClass()`)
- `command/pi-command-palette.component.ts` — selected item
- `dictionaries/dictionaries.page.ts` — toggle switch active state
- `organizations/organization-form-dialog.component.ts` — type pill selected state + **focus-ring унификация** (6 input'ов с hardcoded focus-visible → `pi-focus-ring`)
- **Brand block'и (10×10 ink squares) НЕ тронуты** — identity elements.
- **Tooltip / Progress bar / Foundations swatch НЕ тронуты** — high-contrast необходим.
- **WCAG note:** sunrise-warm (`oklch 0.58`) on paper (`oklch 0.972`) = 4.01:1 — AA Large ✅ для button/badge/pagination/select text.

**5. Login page — ревью**
- Уже использует CSS custom properties + `border-sunrise-warm` для карточки. Отлично выглядит с новой палитрой. Изменений не требуется.

**6. CRUD-миграция (window.confirm → AlertDialog + browser verify)**
- Результат поиска: все страницы УЖЕ используют `PiPageHeaderComponent`, `PiSectionComponent`, `pi-cell`, `pi-table-row`. `grep "page-header|chip"` → 0 hits. Миграция выполнена ранее.
- Основная находка: 3 `window.confirm()` в materials/organizations/dictionaries — заменены на `PiDialogService.open(AlertDialogComponent)`.
- `AlertDialogComponent` переработан: вместо `input.required()` (вызывал NG0950 при открытии через сервис) использует `inject<AlertDialogData>(PI_DIALOG_DATA)`. Экспортирован интерфейс `AlertDialogData`.
- **Browser verify (Chrome):** theme toggle ✅, delete dialog ✅, warm accent ✅, 0 console errors на /materials, /organizations, /dictionaries.

**Затронутые файлы:**
- `frontend/src/styles.css` (paper-2 bump)
- `frontend/src/app/layout/app-layout.component.ts` (theme toggle + warm accent)
- `frontend/src/app/layout/kit-layout.component.ts` (warm accent)
- `frontend/src/app/shared/ui/button/button.component.ts` (warm accent)
- `frontend/src/app/shared/ui/badge/badge.component.ts` (warm accent)
- `frontend/src/app/shared/ui/checkbox/checkbox.component.ts` (warm accent)
- `frontend/src/app/shared/ui/select/select-option.component.ts` (warm accent)
- `frontend/src/app/shared/ui/pi-pagination.component.ts` (warm accent)
- `frontend/src/app/shared/command/pi-command-palette.component.ts` (warm accent)
- `frontend/src/app/pages/dictionaries/dictionaries.page.ts` (warm accent)
- `frontend/src/app/pages/organizations/organization-form-dialog.component.ts` (warm accent + focus-ring)

### Browser Visual Verification (Chrome — 8 страниц)

В рамках сессии улучшений проведена полная browser-верификация всех страниц с новой палитрой (Paper & Ink warm, TZ-LIGHT-XX, тёплый акцент sunrise-warm):

| Страница | Theme toggle | Тёплый акцент | AlertDialog | Console errors |
|---|---|---|---|---|
| `/materials` (operational) | ✅ light↔dark | ✅ +Создать кнопка | ✅ отмена/escape/удаление | 0 |
| `/organizations` (operational) | ✅ | ✅ | ✅ | 0 |
| `/dictionaries` (operational) | ✅ | ✅ toggle switch | ✅ | 0 |
| `/login` (public) | ✅ (отсутствует — ожидаемо) | ✅ Войти кнопка | — | 0 |
| `/kit/playground/theme` (public) | ✅ | ✅ 9 OKLCH слайдеров | — | 0 |
| `/kit/playground/code` (public) | ✅ | ✅ 5 code previews | — | 0 |
| `/kit/overview` (public) | ✅ | ✅ 4 секции | — | 0 |

**Дополнительно:**
- `window.confirm()`: **0 matches** во всём проекте (full sweep по *.ts, *.html, *.js, *.mjs) ✅
- `confirm()` (без `window.`): **0 matches** ✅
- Playground route correction: `/playground/theme-editor` → `/kit/playground/theme` (правильный роут) — browser-use найден и проверен
- AlertDialogComponent: 23 unit tests (новый файл, все проходят) ✅
- PiDialogService: 28 unit tests (существующие, все проходят) ✅

## 📊 Метрики проекта

| Слой | Метрика | Значение |
|------|---------|----------|
| Backend | Entities | 65 (TZ-83: −ProductComponent, +ProductModulePhoto → нетто 0, остаётся 65) |
| Backend | Modules | 19 (+`ProductModulePhoto`) |
| Backend | Files | ~285 |
| Backend | Build time | ~10s |
| Frontend | Pages (router) | 19 (login + 6 operational + 8 /kit/* showcase + /work-types + /modules + /modules/:id + /products/:id) |
| Frontend | UI components | 24+ (Paper & Ink primitives) |
| Frontend | Unit tests | 242 (21 suites — TZ-83 +11 specs) |
| Frontend | Bundle size | 542.84 kB initial / ~155 kB transfer |
| Frontend | Build time | ~2s |
| Backend | E2E specs | 10 (7 baseline + 3 TZ-83) |

## 🎯 Стек

### Backend
- NestJS 10 + Mongoose 8 + MongoDB
- JWT auth + RBAC (Roles, Permissions)
- Class-validator + Swagger
- Helmet + CORS + Throttler
- Jest + Supertest (E2E)

### Frontend
- **Angular 20.3** (standalone, signals, new control flow `@if`/`@for`/`@switch`)
- **TailwindCSS v4** (`@import 'tailwindcss'`, `@theme inline`, `@utility` API)
- **Paper & Ink design system** (OKLCH палитра, hairline borders, no shadows, `pi-focus-ring`)
- **24+ кастомных UI-компонентов** (Button, Badge, Card, Input, Dialog, Sheet, Drawer, Tooltip, Popover, HoverCard, DropdownMenu, ContextMenu, Toast, Tabs, Breadcrumb, Accordion, Progress, Skeleton, Avatar, Separator, ScrollArea, Charts, Select, Checkbox, Switch, Radio, Slider, Label, FormField, Table, Pagination)
- **Lucide Angular** (editorial 1.5px stroke icons)
- **CDK Overlay** (Dialog, Sheet, Drawer, Tooltip, Popover, HoverCard, Menu)
- **⌘K Command Palette** + **Live OKLCH Theme Editor**

## 📁 Структура

```
kppdf-8.0/
├── backend/              # NestJS API (TZ-01..TZ-18)
│   ├── src/
│   │   ├── main.ts       # Bootstrap + Helmet + CORS + Throttler
│   │   ├── app.module.ts # Root module (18 feature modules)
│   │   ├── common/       # Guards, interceptors, decorators, seeds
│   │   ├── database/     # Connection, plugins (softDelete, audit, userContext)
│   │   └── modules/      # 18 feature modules (65+ entities)
│   └── test/             # E2E test suites
├── frontend/             # Angular 20 SPA (Paper & Ink editorial)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/     # Auth, interceptors, services, guards, tokens
│   │   │   ├── layout/   # AppLayout (operational), KitLayout (UI showcase)
│   │   │   ├── pages/    # login, materials, organizations, dictionaries, /kit/*
│   │   │   └── shared/   # ui/ (24+ Paper & Ink primitives), page/, command/, theme/, code/, playground/
│   │   ├── styles.css    # OKLCH palette + Tailwind v4 @theme + hairline utils
│   │   └── index.html
│   ├── proxy.conf.json   # Dev proxy: /api/* → :3000
│   └── angular.json
├── docs/                 # data-model.md, add-new-page.md, paper-and-ink.md
├── OrchestratorKit/      # Task orchestration (kit-init, make-tz, etc)
├── start.mjs             # Cross-platform dev orchestrator (Node 20+)
├── docker-compose.yml    # MongoDB Replica Set
├── ARCHITECTURE.md       # Architecture document
├── STACK.md              # Technology stack
├── progress.md           # Chronological progress log
└── STATUS.md             # This file
```

## 🆕 Recent atomic commits (2026-07-11)

### TZ-83 (5 atomic commits — A/B/C/D/E)

**Сводка:** ~25 files / +1800 / -400; ~3 backend modules + 4 new pages + 3 services + 6 specs.

- `chore(backend): TZ-83A — drop ProductComponent + ProductModule ref+override + ProductModulePhoto entity + atomic attach/detach endpoints + drop-stale script` (5 review rounds PASS).
- `feat(frontend): TZ-83B — services + WorkTypes dictionary page + nav-link "Виды работ"`.
- `feat(frontend): TZ-83C — /modules list + /modules/:id 4-section detail + 2 dialogs (incl. override-dimensions UI)`.
- `feat(frontend): TZ-83D — /products/:id detail с модулями + picker dialog + clickable list rows + atomic attach endpoint на backend`.
- `test: TZ-83E — 3 backend e2e specs + 3 frontend unit specs (11 tests)`.

**Verification:** backend + frontend typecheck exit 0, 11/11 new unit tests pass.

### `b78c1c0` — `chore(cleanup): atomic defensive cleanup batch`

**Сводка:** 12 files / +116 / -52; commit hash `b78c1c0`.

**Backend defensive hardening (8 файлов):**
- `backend/src/common/validators/inn.validator.ts` — `checkInn10` (drop 2-stage bug; single weighted sum mod 11 mod 10 is correct, position 9 is the check digit) + `checkInn12` (drop dead `w3`/`d12_check`).
- 6 seed files (counterparty-roles, feature-flags, org-roles, settings, statuses, units) — defensive `try/catch` вокруг `findBy/upsert` чтобы один битый seed не валил `OnApplicationBootstrap`.
- 3 services (contract, order, quotation) — добавлен private `findByIdRaw()` helper (Mongoose `.findById` без `.populate` возвращает raw `ObjectId` refs; нужно напр. для `contract.activate` который создаёт Order по `customerId`).
- `backend/src/modules/actual-cost/dto/create-actual-cost.dto.ts` — `orderId` стал `@IsOptional()` с JSDoc (ActualCostController мержит orderId из URL param POST `/production-orders/:orderId/actual-costs`, раньше ValidationPipe реджектил body до controller injection).

**Root purge (1 файл):**
- `.gitignore` — добавлен `package-lock.json` guard с inline rationale comment. Root `package.json` не имеет `dependencies`; `node_modules/` в корне больше не нужен.

**Cross-references:**
- **TZ-46 hotfix follow-up:** defensive try/catch pattern для seed files mirrors TZ-46's principle «1 битый seed не должен валить bootstrap». Предыдущее поведение: один exception в seed → 25-секундный boot loop → 500 на /api/health. Теперь seed log warn, продолжение bootstrap.
- **INN validator fix:** original implementation в TZ-03, this commit корректирует баг в `checkInn10` (был 2-stage weighted sum с двумя разными weight-массивами; правильно — 1 weighted sum mod 11 mod 10 = check digit at position 9). И drop dead `w3`/`d12_check` в `checkInn12` (third-stage sum был never used, оставлен после рефакторинга).
- **Seed StrictModeError treat:** defensive try/catch вокруг `create/upsert` handles the case где seed и schema out of sync. TZ-05 ввёл `deletedAt: null` requirement на schema; если seed присылает поле которого schema не ожидает, StrictModeError fail. Try/catch оборачивает regression gracefully.

**Verification:** backend + frontend typecheck exit 0, E2E baseline 7 suites / 22 tests / 26s passing.

**Lock-файлы:** N/A (chore commit, no code zone to lock).

## 🚀 Следующие шаги (предложения)

Все этапы до TZ-46 завершены + Paper & Ink editorial SPA rework (TZ-30..82) + палитра (TZ-AUDIT-9, TZ-WARMUP-100, TZ-LIGHT-XX) + 6-направленная сессия улучшений. Возможные направления:

1. **Нарастить operational pages** — products, orders, contracts, warehouse, production. Канон: materials/organizations/dictionaries (AppLayout + authGuard + service + dialog).
2. **E2E tests run** — реальный прогон test/setup/* + test/e2e/*.e2e-spec.ts (тесты созданы в TZ-17, не запускались регулярно).
3. **Консолидация data model** — 16 пар дублирующих сущностей (Proposal/Quotation, SupplierOrder/PurchaseOrder, Role/Roles и др.). Документированы в `docs/data-model.md`.
4. **highlight.js + axe-core** — повторить pnpm install после lockfile reconcile (TZ-78 fallback, TZ-79 deferred).
5. **Browser-use smoke test** — TZ-82 independent, можно запустить через `ng serve` без SSR.

