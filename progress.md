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
