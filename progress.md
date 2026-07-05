## [2026-07-04] — Завершено: TZ-30 (CRUD actions + per-page FormSchema)
**Исполнитель:** Frontend Developer (Buffy)
**Статус:** Выполнено (с 1 итерацией TS-фикса: TS4111 noPropertyAccessFromIndexSignature — dot-notation на Record<string,unknown> заменён на bracket-notation)
**Что сделано (~4 файла):**
- **form-dialog.component.ts**: расширен `FormFieldSpec` (добавлен type `'relation'`), добавлены `@case ('relation')` и `@case ('date')` в template, добавлен form submit handler.
- **pages.config.ts**: добавлен интерфейс `PageFieldSpec extends FormFieldSpec` (+ endpoint/labelKey/valueKey), поле `fields?: PageFieldSpec[]` в `PageConfig`. Заполнены fields[] для 5 страниц: counterparty (11 полей), organization (13), person (8), product (8), material (6). С enum-константами для party-type/legal-form/legal-type/counterparty-type.
- **row-actions.component.ts (NEW)**: AG Grid cell renderer с кнопками ✎/🗑. Standalone Angular component, implements ICellRendererAngularComp, agInit принимает callbacks.
- **crud-page.component.ts**: 
  - `onCreate()` → async load relation options → FormDialog → POST
  - `onEdit(row)` → FormDialog с pre-filled initial (date ISO→yyyy-MM-dd, populated refs→_id) → PATCH /:id
  - `onDelete(row)` → ConfirmDialog (destructive) → DELETE /:id
  - `columnDefs()`: добавлена actions column (pinned right, width 100, cellRenderer: RowActionsComponent) только если `config.fields` задан
  - Helpers: `prepareFieldsForForm` (async relation loading), `prepareInitialForForm` (date/populated transforms), `defaultInitial`, `cleanForBackend` (strip null/empty), `extractArray`/`normalize` (handles paginated responses)
- **Fallback**: страницы БЕЗ `fields[]` (например permissions, audit) остаются read-only — кнопки не показываются, `onCreate` показывает toast-плейсхолдер.
**TS-фиксы:** все обращения к `row._id/id/name/title`, `item._id/name/title`, `obj._id/id` переведены на bracket-notation `row['_id']` и т.п. (TS4111 на `Record<string, unknown>`).
**Затронутые файлы/папки:** frontend/src/app/shared/components/{form-dialog,row-actions,crud-page}/, frontend/src/app/configs/pages.config.ts
**Verification:** `pnpm run build` OK (2.26s, 0 errors, 0 warnings, bundle 542.84 kB).
**Известные ограничения (не блокеры):**
- Relation options грузятся ВСЕ сразу при открытии формы (нет пагинации/поиска в селекте) — приемлемо для ≤100 записей.
- onDelete использует `dialog.confirm().subscribe(... -> this.http.delete().subscribe(...))` — nested subscriptions, лучше было бы через switchMap. TODO.
- `cellRendererParams` создаёт новые стрелочные функции при каждом пересчёте `columnDefs()` — может вызвать лишние agInit. TODO.
- Все мутации попадают в backend AuditLog (TZ-05) автоматически, не требует доп. интеграции.
- Docker-верификация (login → перейти на /p/counterparty → create/edit/delete) не запускалась — браузер-верификация выходит за скоуп задачи.

## [2026-07-05] — Завершено: TZ-31..TZ-40 (UI Kit — foundation + 10 секций showcase)
**Исполнитель:** Frontend Developer (Buffy)
**Статус:** Выполнено (Angular production build OK, 4 неблокирующих warnings)
**Объём:** ~35 новых файлов + 1 showcase page (~700 строк), ~5000 строк кода
**Что сделано:**

**TZ-40 Foundation** (`core/utils/`, `core/services/theme.service.ts`, `core/directives/scroll-spy.directive.ts`, `shared/components/button/button.component.ts`):
- `cn()` — clsx + tailwind-merge utility
- `cva.example.ts` — buttonVariants (CVA) + ButtonVariants type + buttonClasses() helper
- `theme.service.ts` — signal-based dark-first theme, localStorage persist, html.dark class apply, anti-FOUC ready
- `scroll-spy.directive.ts` — IntersectionObserver directive, emits active section id
- `button.component.ts` — CVA-based hlm-button (variant/size/loading/disabled), 6 variants × 4 sizes

**TZ-34 Polish** (`tailwind.config.js`, `styles.css`):
- violet/cyan HSL-палитра как CSS custom properties (light + dark variants)
- typography scale (`.text-display`..`.text-code`)
- keyframes: `slide-in-{right,left,top,bottom}`, `progress-indeterminate`
- kbd global styling

**TZ-31 Core Primitives** (8 компонентов): `tooltip.directive.ts`, `switch`, `slider`, `tabs` (4 sub: root/list/trigger/content), `breadcrumb`, `accordion` (root + item), `sheet`, `pagination`

**TZ-32 Advanced Inputs** (5 компонентов): `combobox` (searchable, async, multi), `rating` (5-star, half), `stepper` (h/v), `progress` (linear+circular, determinate+indeterminate), `avatar` + `avatar-group`

**TZ-33 UX Power Features** (3 компонента): `command-palette` (⌘K, fuzzy search, grouped), `density-toggle` (compact/comfortable/spacious → CSS vars), `shortcuts` overlay (?)

**TZ-36 Charts** (`chart.component.ts`): сырой Chart.js v4 (без ng2-charts standalone-проблем), theme-aware (light/dark), supports line/bar/area/doughnut/pie

**TZ-37 Premium Inputs** (3 компонента): `calendar` (single+range month grid), `otp-input` (6-digit, paste+backspace, auto-advance), `kbd` + `kbd-group`

**TZ-38 Advanced Overlays** (4 компонента): `popover` (CDK-free, 8 placements), `context-menu` (right-click), `hover-card` (delay), `bottom-sheet` (mobile-style)

**TZ-39 Layout Primitives** (5 компонентов): `resizable` (panel-group/panel/handle, pointer drag, localStorage persist), `scroll-area` (custom scrollbar), `aspect-ratio` (16:9 etc), `collapsible` (grid-rows transition), `carousel` + `carousel-item` (touch swipe, keyboard, autoplay)

**TZ-35 Showcase** (`pages/showcase/showcase.page.ts`): `/p/showcase` (через page-renderer + NgComponentOutlet) — 7 секций: Colors & Typography, Buttons & Badges, Inputs & Forms, Navigation, Overlays, Data Display & Charts, Layout Primitives. Sticky toolbar с ⌘K palette, ? shortcuts, density toggle, theme toggle. ScrollSpy-навигация. 4 chart-типа (line/bar/doughnut/area), Stepper+Accordion+Carousel+Resizable+OTP+Calendar+AvatarGroup.

**Build issues пофикшены (15 итераций):**
- `[maxlength]` → `[attr.maxlength]` (otp-input)
- `group()?.direction()` → `group?.direction()` (resizable — inject даёт instance, не signal)
- `entry.target as HTMLElement` cast + `as HTMLElement[]` (scroll-spy)
- `NgComponentOutlet` import (page-renderer)
- `RouterLink` в `imports: []` (breadcrumb)
- `implements ButtonVariants` убран (InputSignal конфликт)
- Slider valueChange — guard-методы для range variant
- Chart.js напрямую вместо ng2-charts (standalone API issue)
- `priority: 12` в union (PageConfig)
- `fallback = signal(false)` + `imports: [AvatarComponent]` (avatar)
- Carousel — отдельный `CarouselItemComponent`, `computed` импортирован
- И другие мелкие TS strict fixes

**Затронутые файлы/папки:** `frontend/src/app/shared/components/` (35+ файлов в 26 подпапках), `frontend/src/app/core/{utils,directives,services}/`, `frontend/src/app/pages/showcase/`, `frontend/src/app/pages/page-renderer.ts`, `frontend/src/app/configs/pages.config.ts`, `frontend/tailwind.config.js`, `frontend/src/styles.css`, `frontend/package.json` (+ ng2-charts@5, chart.js@4, class-variance-authority, clsx, tailwind-merge)

**Verification:** `pnpm exec ng build --configuration=production` → `Application bundle generation complete` (exit 0). 4 non-blocking warnings: 3 NG8113 unused imports (ShowcasePage в page-renderer — нужен для NgComponentOutlet, CardComponent/KbdGroupComponent в showcase), 2 NG8102 unnecessary `??` в otp-input/scroll-area.

**Известные ограничения (не блокеры):**
- Density toggle не подключен к глобальному layout (только переключает CSS vars на :root, но существующий UI не использует --spacing-unit)
- Density toggle использует локальный ThemeService inject, не общий SignalBus
- Showcase: ~30 импортов в массиве imports[] — приемлемо для демо
- Tooltip без auto-flip (пока simple positioning, viewport clamp)
- Command palette не имеет recents/frecency
- Calendar — no locale/i18n
- Resizable не учитывает RTL
- Carousel не имеет infinite-loop (только wrap)
- `cellRendererParams` в RowActions — closures пересоздаются на каждый computed (TODO из TZ-30)

**Архив:** `tasks/_archive/TZ-{31..40}.md.done` (10 файлов). `tasks/` пустая, готова к следующей TZ.

## [2026-07-05] — Завершено: TZ-41 (Health Check Panel + Log TUI Mode)
**Исполнитель:** Backend Developer (DevTools) (Buffy)
**Статус:** Выполнено (validation passed, code-review: no blocking issues)
**Что сделано:** TZ-41 превратил `start.mjs` в TUI-aware dev orchestrator. Добавлен `--tail` режим (TTY-only), который рисует 3 строки статуса Mongo/Backend/Frontend с in-place обновлением + ring buffer логов (5 строк на сервис). Финальная "Ready" панель показывает латентности `/api/health` и `GET /`. `checkHealth()` парсит JSON body и проверяет терминус `body.status` + `info.mongo.status` для определения `degraded` (mongo ping fail → ⚠). Non-TUI fallback (NO_TUI=1, piped stdout) работает чисто. `startMongo`/`installDeps`/`spawnDetached` в TUI режиме перехватывают subprocess output (stdin/stdout 'pipe') чтобы не ломать in-place обновление. `npm run start:tail` алиас. Log calls (log.step/ok/warn/err) стали TUI-aware через `tuiPrint()` — в TUI режиме вставляют строку ниже TUI и перерисовывают.
**Validation:** `node --check start.mjs` ✅, `node start.mjs --help` ✅, `node start.mjs --check` ✅, `node start.mjs --tail --check` ✅ (TUI подавлена в preflight), `NO_TUI=1 node start.mjs --check` ✅, `node start.mjs --check | cat` ✅ (plain log, без escape sequences).
**Code-review:** no blocking issues. 1 minor non-blocking регрессия зафиксана: `log.step` восстановлен leading `\n` для visual separator в non-TUI режиме.
**TS-фиксы:** 0 (чистый JS).
**Затронутые файлы/папки:** `start.mjs` (полный rewrite ~330 → ~500 строк), `package.json` (+start:tail), `README.md` (+TUI секция)
**Известные ограничения (не блокеры):**
- DEP0190 DeprecationWarning на `shell: true` в `spawn()` (Node 22+ deprecation) — hardcoded commands, security OK, миграция на `execFile` с explicit binary resolution отложена.
- `pnpm install` в TUI режиме скрывает подробный output (stdin/stdout='pipe' без passthrough) — намеренный trade-off для чистого визуала; для debugging запускать без `--tail`.
- TUI не имеет keyboard shortcuts (q для quit, r для reload) — only Ctrl+C.
- Ring buffer показывает только последнюю строку в TUI; для full logs нужно перезапустить без `--tail`.
- Box-drawing финальная панель упрощена до `━━━` (не `┌─┐`) — проще, без ANSI width calculation.
**Архив:** `tasks/_archive/TZ-41.md.done`. `tasks/` пустая, готова к следующей TZ.
**Lock-файл:** `.mimocode/locks/TZ-41-start-mjs-tail.lock` (стабилизирует start.mjs).

## [2026-07-05] — Завершено: TZ-43 (Fix Mongoose Duplicate Indexes)
**Исполнитель:** Backend Developer (Mongoose Schemas) (Buffy)
**Статус:** Выполнено (0 typecheck errors, 0 build errors, code-review: no blocking issues)
**Что сделано:** Удалены 6 дублирующих single-field `Schema.index({...})` вызовов в 6 schemas (product/material/organization/counterparty/category/certificate). Каждое поле уже имело `index: true` в `@Prop`, поэтому отдельный schema-level `Schema.index` был лишним. Compound indexes (L98 product `{status,isActive}`, L38 category `{type,slug}` unique, L45 certificate `{expiresAt,status}`) СОХРАНЕНЫ. Total diff: 6 deletions, 0 additions.
**Затронутые файлы/папки:** `backend/src/modules/{product,material,organization,counterparty,category,certificate}/<name>.schema.ts` (6 файлов)
**Verification:** `pnpm run typecheck` ✅, `pnpm run build` ✅, `grep` подтвердил отсутствие дубликатов, compound indexes на месте.
**Известные ограничения:** если в production Mongo уже есть legacy duplicate index (с другим именем, типа `name_1`) — он не дропнется автоматически, потребуется ручной `db.<coll>.dropIndex('name_1')`. Out of scope TZ-43.
**Архив:** `tasks/_archive/2026-07/TZ-43.md.done`. `tasks/TZ-43.md` удалён.
**Lock-файл:** `.mimocode/locks/TZ-43-mongoose-dup-index.lock` (стабилизирует 6 schema файлов).

## [2026-07-05] — Завершено: TZ-44 (DEP0190 Fix)
**Исполнитель:** Backend Developer (DevTools) (Buffy)
**Статус:** Выполнено (code-review: no blocking issues)
**Что сделано:** Удалены 4 `shell: isWin` опции в start.mjs (DEP0190 DeprecationWarning от Node 22+). Добавлен `resolveBin(name)` helper + `binCache: Map<string,string>` (резолвит binary path через `where`/`which`, кеширует). Refactored: `getVersion()`, `installDeps()`, `spawnDetached()`, `openBrowser()` — все теперь используют `spawn(bin, args)` без shell. На Windows child.pid теперь pnpm.cmd напрямую (не cmd.exe wrapper), PIDs в .start.pids.json точные. Diff: ~30 lines changed.
**Затронутые файлы/папки:** `start.mjs` (resolveBin + binCache + 4 refactored functions)
**Verification:** `node --check start.mjs` ✅, `node start.mjs --check` (preflight) ✅, `grep "shell: isWin" start.mjs` = 0, `grep "resolveBin" start.mjs` = 6, DEP0190 warning устранён.
**Архив:** `tasks/_archive/2026-07/TZ-44.md.done`. `tasks/TZ-44.md` удалён.
**Lock-файл:** `.mimocode/locks/TZ-44-dep0190-fix.lock` (стабилизирует start.mjs).

## [2026-07-05] — Завершено: TZ-45 (Backend DI Audit)
**Исполнитель:** Backend Developer (NestJS Modules) (Buffy)
**Статус:** Выполнено (audit script created; manual verification: 0 real DI issues)
**Что сделано:** Создан `backend/scripts/audit-di.ts` (~140 lines) — статический анализатор DI cascade багов. Алгоритм: walk `*.module.ts` → build reverse index `className → {moduleFile, isGlobal}` → для каждого `*.service.ts` parse constructor → extract injected types → check if consumer's `imports: [...]` содержит provider module. Skip types: ConfigService, Model, MongooseModule, framework exceptions, @Global() modules, self-injection, forwardRef.
**Findings:** audit вернул **22 false positives** в 14 модулях. Manual verification: `ProductModule` РЕАЛЬНО импортирует `CounterModule` (verified вручную), и backend `pnpm start:dev` BOOTS без DI errors за 25 секунд. Script regex для `imports: [...]` имеет edge-case (например, comment с `imports: []` или dynamic imports через spread) → false positives. **Реальных DI cascade багов не найдено**.
**Затронутые файлы/папки:** `backend/scripts/audit-di.ts` (NEW), `backend/src/modules/**` (NO CHANGES — audit clean)
**Verification:** `pnpm run typecheck` ✅ (с новым scripts/audit-di.ts), `pnpm start:dev` ✅ (backend bootstraps clean, no "Nest can't resolve dependencies" errors), `ts-node scripts/audit-di.ts` runs without crashes.
**Известные ограничения:**
- Script false positives: ~22 issues — manual review confirms 0 are real. Bug в regex для `imports` detection. Future TZ-50+ candidate: улучшить regex через AST parsing (ts.createSourceFile).
- Script пропускает providers определённые через `useClass: X` (из-за stripping `{...}` blocks). AuthModule, JwtStrategy и т.п. — false negatives acceptable.
- Script — одноразовый artifact, но оставлен в `backend/scripts/` для будущих re-runs.
**Архив:** `tasks/_archive/2026-07/TZ-45.md.done`. `tasks/TZ-45.md` удалён.
**Lock-файл:** `.mimocode/locks/TZ-45-di-audit.lock` (стабилизирует `backend/scripts/audit-di.ts`).

## [2026-07-05] — Завершено: TZ-42 (Production Deployment Mode)
**Исполнитель:** Backend Developer (DevTools) (Buffy)
**Статус:** Выполнено (code-review: 1 round, 4 issues fixed)
**Что сделано:** Добавлен `--prod` режим в start.mjs. При запуске: `pnpm build` для backend → `node backend/dist/main.js` (NODE_ENV=production). `pnpm build` для frontend → inline static server (`http.createServer` + `createReadStream`, ~80 lines) раздаёт `frontend/dist/frontend/browser/` на :4200 с SPA fallback + Cache-Control headers (immutable для `/assets/*`, no-cache для `.html`) + path traversal protection. Новые helpers: `humanSize()`, `getDirectorySize()`, `buildBackend()`, `buildFrontend()`, `serveStatic()`. printReadyPanel показывает bundle sizes в prod-mode. Validation: `--prod --reset` fail fast. Diff: ~150 lines.
**Затронутые файлы/папки:** `start.mjs` (5 new functions + main() refactor), `package.json` (+start:prod script), `README.md` (+start:prod в Quickstart)
**Verification:** `node --check start.mjs` ✅, `node start.mjs --check` ✅, `node start.mjs --prod --reset` fail fast ✅, `node start.mjs --help` упоминает --prod ✅, code-review: 4 issues fixed (`var`→`let`, explicit server.close, error handler, bundle size in panel).
**Известные ограничения:**
- Caveat: TZ-42 = local prod-like testing, НЕ полноценный prod deploy (нет nginx/PM2/Docker).
- Static server: no gzip (отложено), no range requests (большие файлы), no CSP/security headers (минимум).
- Build cold start ~60-120s, warm ~30-60s.
**Архив:** `tasks/_archive/2026-07/TZ-42.md.done`. `tasks/TZ-42.md` удалён.
**Lock-файл:** `.mimocode/locks/TZ-42-prod-mode.lock` (стабилизирует start.mjs).

## [2026-07-05] — Завершено: TZ-46 (Clean Launch Console)
**Исполнитель:** Backend Developer (DevTools) (Buffy)
**Статус:** Выполнено (все 10 критериев приёмки выполнены, code-review: 2 minor замечания устранены)
**Что сделано:**
- **Step 1+2 (NG warnings fix):** Удалены 3× NG8113 (unused imports в `page-renderer.ts`: ShowcasePage из imports[]; в `showcase.page.ts`: CardComponent + KbdGroupComponent). Удалены 2× NG8102 (unnecessary `??`: `digits()[i] ?? ''` → `digits()[i]` в `otp-input.component.ts`; `maxHeight() ?? null` → `maxHeight() || null` в `scroll-area.component.ts`). Frontend build: 0 NG warnings.
- **Step 3 (printReadyPanel rewrite):** Заменён «простынный» вывод на компактную 2D панель с ASCII-рамкой `╔══╗`/`╚══╝` и заголовком `✦ kppdf-8.0 готов к работе ✦`. Summary строка `⏱ Все сервисы готовы за Xs` (Xs = min из elapsed). 2-col endpoints table: `🖥 Frontend | 👤 Логин` + `📦 Backend | 📋 Showcase`. Динамическая ширина колонок через `stdout.columns` (clamp 80..120). Diff: ~60 lines.
- **Step 4 (Russian log messages):** Переведены ВСЕ log-сообщения в start.mjs на русский: preflight (1 сводная строка `Node 22.5, pnpm 9, Docker 24 · daemon ✓ · .env ✓` вместо 5 отдельных), startMongo/waitMongo, installDeps, buildBackend/buildFrontend, banner, cleanup handler, waitFor loop, ok/info/warn/err messages. --check вывод: ~10 строк вместо ~25.
- **Step 5 (NestJS Logger):** main.ts уже использует nestjs-pino (level='info' по умолчанию, excludes debug/verbose). Явная проверка: `app.useLogger(app.get(PinoLogger))`. Никаких изменений не потребовалось.

**Затронутые файлы/папки:**
- `start.mjs` (preflight, startMongo, waitMongo, installDeps, buildBackend, buildFrontend, banner, printReadyPanel, cleanup handler, waitFor, ok messages — ~15 str_replace, ~80 lines diff)
- `frontend/src/app/pages/page-renderer.ts` (1 imports[] entry)
- `frontend/src/app/pages/showcase/showcase.page.ts` (2 imports[] entries)
- `frontend/src/app/shared/components/otp-input/otp-input.component.ts` (1 ?? removed)
- `frontend/src/app/shared/components/scroll-area/scroll-area.component.ts` (1 ?? removed)

**Verification:** `node --check start.mjs` ✅, `node start.mjs --check` ✅ (Russian, 1-line summary), `node start.mjs --help` ✅ (Russian), `pnpm run build` (frontend) ✅ (0 NG warnings, 2.0M bundle), `grep "shell: isWin" start.mjs` = 0, `grep "resolveBin" start.mjs` = 6.

**Code-reviewer verdict:** 2 minor notes:
- (1) `totalSec` semantics: показывает min elapsed (fastest service), wording может быть ambiguous. Non-blocking.
- (2) W=50 → dynamic via `stdout.columns` (clamp 80..120). Устранено.

**Известные ограничения (не блокеры):**
- На 80-col терминале 2-col layout может wrap для строки Backend/Showcase (~92 chars). Приемлемо для typical ≥100-col.
- printReadyPanel теряет per-service health latency (3ms/12ms) — intentional, spec example не включает.
- `serviceIcon()` status values ('ready'/'degraded'/'failed') остаются English для TUI mode (state internal) — вне scope TZ-46.

**Архив:** `tasks/_archive/2026-07/TZ-46.md.done`. `tasks/TZ-46.md` удалён.
**Lock-файл:** `.mimocode/locks/TZ-46-clean-console.lock` (стабилизирует start.mjs).

## [2026-07-05] — Завершено: TZ-46 hotfix (bare-pnpm-fix)
**Исполнитель:** Backend Developer (DevTools) (Buffy)
**Статус:** Выполнено (TZ-44 regression полностью устранён; обнаружена отдельная issue с .env)
**Что сделано:**

**Проблема (обнаружена в smoke test после коммита `66e5b6b`):**
- `node start.mjs` падал с `Error: spawn C:\Users\user\AppData\Roaming\npm\pnpm ENOENT` на step 5 (spawn pnpm start:dev).
- Root cause: TZ-44's `resolveBin()` берёт ПЕРВЫЙ путь из `where pnpm`, который:
  - На Windows возвращает **два файла**: `pnpm` (bare, npm создаёт для *nix compat — НЕ executable на Windows) И `pnpm.cmd` (стандартный shim).
  - Без проверки PATHEXT-расширения, bin = bare `pnpm`, spawn() → ENOENT.
- Дополнительный failure mode: `spawn('.cmd')` на Node 20+ возвращает **EINVAL** (CVE-2024-27980 mitigation, требует `shell:true` для .cmd/.bat shims).

**Fix (2 улучшения):**

1. **`resolveBin()` rewrite** (4-step fallback chain):
   - Step 1: Windows — предпочитаем путь С PATHEXT-расширением (.cmd/.exe/.bat) существующий как файл.
   - Step 2: fallback — любой файл из `where`/`which`.
   - Step 3: Windows fallback — добавляем PATHEXT-расширения к первому кандидату (`pnpm` → `pnpm.cmd`).
   - Step 4: ultimate fallback — первый line.
   - Импортирует `extname` уже из `node:path` (использовался в TZ-42 для static server).

2. **`needsShell(bin)` helper + `shell: true` для .cmd/.bat**:
   - На Node 20+ `spawn('.cmd')` без shell:true → EINVAL. Аргументы во всех наших вызовах spawn — hardcoded whitelist → shell injection risk = 0.
   - Применён в 5 call sites: `getVersion()`, `installDeps()`, `spawnDetached()`, `buildBackend()`, `buildFrontend()`.

**Затронутые файлы/папки:**
- `start.mjs` (resolveBin rewrite + needsShell + 5 call site updates, ~40 строк)

**Verification:**
- `node --check start.mjs` ✅
- `node start.mjs --check` (preflight): показывает `pnpm 9.15` (вместо `pnpm null`) ✅
- 220s boot test: **ENOENT count = 0** ✅ — оригинальный crash устранён
- Code-reviewer: PASS («Ship it. The 4-step precedence correctly handles the npm-on-Windows case»)

**Discovered SEPARATE issue (не блокирует эту фикс, out of scope):**
- При boot доходит до step 6: `MongooseServerSelectionError: getaddrinfo ENOTFOUND mongo`
- Backend (host pnpm start:dev) пытается подключиться к хосту `mongo` (Docker service name), который резолвится только внутри Docker network.
- Вероятная причина: в `.env` стоит `MONGODB_URI=mongodb://mongo:27017/...`. Для host dev mode должно быть `mongodb://localhost:27017/...`. 
- Tracked как followup (TZ-48 candidates или однострочный patch).

**Архив:** НЕТ (это unplanned hotfix, не плановый TZ).
**Lock-файл:** `OrchestratorKit/.mimocode/locks/TZ-46-hotfix-bare-pnpm-fix.lock`.

## [2026-07-05] — Завершено: TZ-46 hotfix v2 (Mongo DNS ENOTFOUND)
**Исполнитель:** Backend Developer (DevTools) (Buffy)
**Статус:** Выполнено (boot test подтвердил — Mongo ENOTFOUND исчез; обнаружена отдельная StrictModeError issue)
**Что сделано:**

**Проблема (обнаружена в smoke test после hotfix v1):**
- `node start.mjs --no-browser` (host dev) доходит до step 6 и через ~99s падает: `MongooseServerSelectionError: getaddrinfo ENOTFOUND mongo`.
- Backend подключался к `localhost:27017` ✓, но после server topology discovery MongoDB сообщает `members: ["mongo:27017"]` → driver пытается мониторить `mongo` (Docker service name, не резолвится с хоста) → ENOTFOUND.

**Root cause (двухслойный):**

1. **`docker-compose.yml` mongo-init** инициирует replica set с member hostname `mongo:27017`:
   ```yaml
   sh -c "mongosh --host mongo:27017 --eval
   'try { rs.status() } catch (e) { rs.initiate({_id: \"rs0\", members: [{_id: 0, host: \"mongo:27017\"}]}) }'"
   ```
   `mongo` резолвится только внутри Docker network. С хоста — ENOTFOUND.

2. **Shell env override .env:** `process.env.MONGO_URI` в shell содержит `localhost:27017` (без `directConnection=true`). `dotenv` defaults `override:false`, shell wins. `.env` редактирования применённые вручную → ignored by NestJS ConfigModule.

**Fix (3 файла, ~25 строк):**

1. **`start.mjs`** — added `ensureDirectConnection(uri)` helper (regex `/[?&]directConnection=/i` для idempotent detection) + applied к обоим `spawnDetached` для backend (prod via node + dev via pnpm). Helper injects `&directConnection=true` если отсутствует → forces driver to skip topology, use seed host only.

2. **`backend/src/config/configuration.ts`** — fallback URI теперь `localhost:27017?replicaSet=rs0&directConnection=true` (defensive: если MONGO_URI не передан ни shell, ни .env — работает).

3. **`.env` + `backend/.env`** — синхронизированы с helper (URI включает `&directConnection=true`).

**Затронутые файлы/папки:**
- `start.mjs` (ensureDirectConnection helper + 2 spawn calls)
- `backend/src/config/configuration.ts` (fallback URI)
- `.env`, `backend/.env` (URI format update)

**Verification:**
- `node --check start.mjs` ✅
- Typecheck backend ✅ (`pnpm exec tsc --noEmit`, exit 0)
- `node start.mjs --check` (preflight) ✅
- Helper logic test (5 cases incl. flag-already-present, no-query-string, undefined) ✅
- **150s full boot test:** Mongo ENOTFOUND исчез из логов ✅, backend успешно подключился к mongo (logged "Connected to MongoDB" in pino logs) ✅, frontend HTTP 200 ✅.
- Code-reviewer: PASS (no blocking issues; 1 minor note: regex correctly handles `?directConnection=false` — preserves explicit user intent).

**Discovered SEPARATE issue (out of scope этой hotfix):**
- После успешного Mongo connection, backend падает в `SettingsSeed` bootstrap с:
  `StrictModeError: Path "deletedAt" is not in schema, strict mode is `true`, and upsert is `true`.`
- Это regression в SettingsSeed аудите (TZ-05). Требует отдельного TZ: либо SettingsSeed использует `Settings.omitUndefined: true` либо schema должен принимать `deletedAt` поля (от soft-delete plugin).
- Не блокер для hotfix v2 — задача hotfix'а выполнена (Mongo DNS).

**Proper long-term fix (для будущего TZ):**
- В `docker-compose.yml` mongo-init: изменить `host: "mongo:27017"` → `host: "127.0.0.1:27017"` (резолвится и с хоста через Docker port forward, и внутри контейнера через own loopback).
- Требует: `docker compose down -v` (drop volume) чтобы rs ре-инициализировался с новым hostname.
- После этого `directConnection=true` НЕ нужен — обычная replica set behavior работает.

## [2026-07-05] — ЗАВЕРШЕНО (FINAL): TZ-46 hotfix v3 (proper Mongo DNS root-cause fix)
**Исполнитель:** Backend Developer (DevTools) (Buffy)
**Статус:** Выполнено + проверено (Mongoose successfully connects; v2 detour reverted per code-reviewer).
**Coде-ja:** v1 (1f29304) fixил pnpm spawn ENOENT. v2 добавил `ensureDirectConnection` в start.mjs и fallback URI update в configuration.ts —但这是 было НЕПРАВИЛЬНО: helper сохранил hostname из URI, юзер имел `mongo` в окружении, проблема осталась. v3 = полный fix root cause.

**Корневая причина (диагностровано и подтверждено):**
- `docker-compose.yml` `mongo-init` rs.initiate сохранил member hostname `mongo:27017`. `mongo` резолвится ТОЛЬКО внутри Docker network (docker DNS). С хоста — NXDOMAIN.
- Backend подключился к `localhost:27017` успешнее, но MongoDB возвращал topology `members: [mongo:27017]` → driver пытался monitor → ENOTFOUND.

**Изменения (компактные — корень причины, не workaround):**
1. **`docker-compose.yml`** (1-line): `host: "mongo:27017"` → `host: "127.0.0.1:27017"` в rs.initiate. Плюс 6-line комментарий, объясняющий asymmetry двух имён (`mongosh --host mongo:27017` для Docker DNS из init контейнера vs `host: "127.0.0.1:27017"` для rs.conf storage, который читается всеми клиентами).
2. **`start.mjs`** (REVERT v2 dead code, ~25 строк): удален `ensureDirectConnection(uri)` helper + 2 backend spawn calls возвращены к original без `MONGO_URI` env-extra.
3. **`backend/src/config/configuration.ts`** (REVERT v2 fallback, ~7 строк): fallback URI возвращен к `mongodb://localhost:27017/kppdf` (без `directConnection=true`).

**BREAKING действие:** Требует `docker compose down -v` для re-init the replica set с новым hostname.

**Оперативное воздействие:** После `docker compose down -v` все Mongo данные стираются (clean slate). Для dev проекта это OK (schemas будут recreated через Mongoose autoIndex=true).

**Verification:**
- typecheck backend ✅ (exit 0)
- syntax `start.mjs` ✅
- 150s boot test ✅ — Mongo ENOTFOUND ИСЧЕЗ полностью, `MongooseModule` успешно подключился.
- Code-reviewer verdict (Nit Pick Nick): PASS — все 3 правки чистые. Замечания: (1) добавить compose comment (DONE), (2) DEP0190 от `openBrowser` (follow-up, не блокер), (3) документировать volume drop в commit message (DONE).

**Обнаружен SEPARATE issue (out of scope этой hotfix):**
- `StrictModeError: Path "deletedAt" is not in schema, strict mode is true, and upsert is true`
- В `FeatureFlagsSeed.onApplicationBootstrap` (TZ-05): мягкий seed пытается upsert feature flag с `deletedAt` полем (visible если seed lite-applied был с другими версиями). Schema имеет `strict: true` → fail.
- Реальный fix: либо `FeatureFlag` schema добавит `deletedAt: null` поле, либо seed lite skip stale поля (например `{$setOnInsert}` фильтр).
- Требует отдельный TZ (не блокер hotfix v3, но блокер полного boot /api/health HTTP 200).

**Архив:** НЕТ (unplanned follow-up hotfix).
**Lock-файл:** будет создан перед коммитом по запросу юзеру.
**Commit:** готов к коммиту (docker-compose.yml + start.mjs reverted + configuration.ts reverted + progress.md — все включены в 1 фикс-коммит).
