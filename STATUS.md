# STATUS — KPPDF ERP Project Status

**Last updated:** 2026-08-02
**Phase:** Canonical cleanup and verification — TZ-261 and TZ-262 are closed; roadmap items remain documented backlog
**Canonical workspace:** `D:\kppdf-8.0` on `main`; only registered Git worktree; package manager `pnpm`
**Task truth:** `tasks/` contains only active work. Completed or deferred work belongs in `tasks/_archive/`; this status file also retains historical roadmap notes.
**Total tasks:** Historical completed work plus documented backlog; see `OrchestratorKit/STATUS.md` for the filesystem-synchronised kit board.

## Canonical cleanup checkpoint — 2026-08-01

- Confirmed source of truth: `D:\\kppdf-8.0`, branch `main`; `git worktree list` contains only this checkout.
- Removed non-project artifacts: `WindowsTheme/`, `vendor/codebase-memory-mcp/`, root `Пимер.pdf`, `.mcp.json`; `start.mjs` no longer auto-starts the removed MCP.
- Moved the project passport to `docs/project-passport.md`; `TZ-CLEANUP-R2` is archived as DONE after all cleanup acceptance criteria and verification gates.
- `tasks/` is intended to contain only real active `TZ-*.md` files. Roadmap prose elsewhere is historical context, not an active task claim.

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
- **Paper & Ink shared UI** — собственный Angular kit в `frontend/src/app/shared/ui/` и композиционные primitives в `frontend/src/app/shared/page/`.
- **Token-first styling**: OKLCH palette, hairline borders, `pi-focus-ring`, responsive states и keyboard-visible focus.
- **Migrated primitives**: `PiPageHeader`, `PiEmptyState`, `PiBadge`, `PiRowActions`, dialogs, tables, forms, canvas and feedback components.
- **Document constructor**: builder canvas, inspector, DSL contracts and reference-data services live under `frontend/src/app/pages/doc-constructor/` and `frontend/src/app/shared/dsl/`.
- **Подробности:** `docs/paper-and-ink.md`, `ARCHITECTURE.md` и `progress.md` содержат дизайн-контракт и историю переходов.

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

### TZ-86 (2026-07-11) — Конструктор документов (Document Constructor, flagship feature)

**Мотивация:** Главный «killer-feature» после TZ-83/85. Бизнес-схема: документ = тексты (из «Тексты») + таблицы (из «Таблицы») + данные контрагентов/организаций/products (live API lookup) + фоновый рисунок (опционально). 4-я dropdown-категория в верхнем nav. До TZ-86 эта функциональность была orphan'ом из kppdf-7.0 (`contract-builder/*` + `document-template.service.ts` legacy, отключённые в app.routes.ts). После 4 prior failed iterations (5.0/6.0/7.0) — этот TZ переписывает с нуля на 3-pane canvas + CDK drag-drop + auto-save + signal-based registry.

**Полный объём (6 фаз, ~30+ файлов, 9 atomic commits):**

**Phase A — Backend foundation (6 atomic commits, A.1..A.6):**
- **A.1** `TextBlock` schema (NEW) — fields: name, slug, content (markdown), tags[], category, sortOrder, isActive. Russian transliteration slugify (а→a, ё→yo, щ→shch, ю→yu, я→ya) + Mongo unique index + 11000→409 catch.
- **A.2** `TableTemplate` EXTEND — ColumnColumn gains `type: ColumnType` (text|number|date|currency|bool); TableTemplate gains `category?` (5 enum), `sortOrder`, `sampleRows?: unknown[][]`, `dataSource?`. `GET /:id/preview` endpoint — inline HTML via `Intl.NumberFormat('ru-RU', {style:'currency', currency:'RUB'})`. Compound indexes.
- **A.3** `TemplateBlock.dataBinding` extension — subdoc `{source, field?, value?, format?}` к существующему schema (migration safe, _id: false).
- **A.4** `DocumentBuilder.build(id, dto)` service extension — `findExpanded()` → `resolveSourceIds()` (Promise.all parallel `.lean().exec()`) → `resolveBlockContent()` (per-block with binding.value or bag[source][field] lookup) → `renderHtml()`. `formatValue()` — `Intl.NumberFormat` ru-RU/RUB для currency, `toLocaleDateString` для date. `POST /api/document-templates/:id/build` endpoint.
- **A.5** `RegistryController` — `GET /api/registry/data-sources` lists 5 entity types (organization/counterparty/product/material/work-type) + `{key, label, type}` field metadata. `RegistryService` encapsulates hardcoded `DATA_SOURCES` constant.
- **A.6** `POST /:id/upload-background` — Multer `FileInterceptor('file', {memoryStorage, fileFilter MIME whitelist png|jpeg|webp, limits: fileSize 5MB})` → save to `cwd/uploads/document-templates/{id}/{uuidv4}.{ext}` → push URL to `backgroundImage[]` (Photoshop-style 5-image cap, 409 on overflow). `MulterExceptionFilter` для 413 на oversize. Best-effort `fs.unlink` на save() failure.

**Phase B — Frontend data layer (4 silent-http services + 17 jest tests):**
- `pi-text-blocks.service.ts` — `list/findById/create/update/remove`
- `pi-table-templates.service.ts` — `list/findById/create/update/remove/preview` (preview silentWrap text)
- `pi-document-templates.service.ts` — `list/findById/create/update/remove/build/uploadBackground` (build silentWrap text; uploadBackground FormData multipart)
- `pi-registry.service.ts` — `getDataSources` (static catalogue)
- 4 service specs (17 tests total, all PASS): envelope mapping + silent-http + FormData multipart verified via `req.request.body instanceof FormData`.

**Phase C — Frontend sub-pages (texts + tables CRUD):**
- `pages/doc-constructor/texts/texts.page.ts` — list with search/sort + create button. EditDialog `text-block-dialog.component.ts` (190 LoC, side-by-side markdown preview via marked@18).
- `pages/doc-constructor/tables/tables.page.ts` — list with columns preview. EditDialog `table-template-dialog.component.ts` (290 LoC, FormArray<TableColumnForm> with add/up/down/remove + JSON sampleRows + server-side preview).
- Routes added: `/doc-constructor/texts` + `/doc-constructor/tables` under authGuard. New dep: `marked@^18.0.6`.

**Phase D.1 — Builder canvas 3-pane (главный wow, 13 files / +2303 LoC):**
- 5 NEW components: `BuilderPage` (480 LoC) + `BuilderToolPane` (480 LoC, 4 sections + `AddBlockPayload` discriminated union) + `BuilderCanvas` + `BlockRenderer` (235 LoC) + `BuilderInspector` (430 LoC, signal-bound form).
- 2 NEW Paper & Ink primitives: `pi-canvas-page` (A4 paper wrapper) + `pi-canvas-block-handle` (cdkDragHandle GripVertical, hover-only).
- 4th NAV_CATEGORY «Документы» (FileText icon).
- 2 lazy routes: `/doc-constructor/builder` (picker state) + `/doc-constructor/builder/:id` (3-pane canvas).
- Auto-save 1500ms debounce (Subject piped through groupBy+debounceTime+switchMap), per-block debounce.
- CDK drag-drop reorder (cdkDropList + cdkDrag with cdkDragLockAxis="y").
- 4-variant `AddBlockPayload` discriminated union: `{type: 'block', blockType}` | `{type: 'text', textBlockId}` | `{type: 'table', tableTemplateId}` | `{type: 'data', source, field}`.

**Phase D.2 — Builder canvas enhancements (3 files / +397 LoC):**
- **Background image:** Decorations tab in tool pane, MIME whitelist + 5MB cap client-side validation, `pi-document-templates.service.uploadBackground(id, file)` POST → optimistic update of `template` signal → CSS `background-image: url(...)` rendering in `BuilderCanvas` via `position: absolute; z-index: 0; pointer-events: none` overlay div.
- **Drag-from-palette:** `cdkDrag` on all 4 tool-pane palette lists + `cdkDropListConnectedTo: [CANVAS_DROPLIST_ID]` linking them to the canvas `cdkDropList`. `CANVAS_DROPLIST_ID` exported from `builder-canvas.component.ts` (single source of truth). Drop handler `onDropAdd({payload, insertIndex})` → `insertBlock()` → atomic POST add + immediate POST reorder (because backend `add` appends, not inserts).
- **Last-saved indicator:** `saveStatus: signal<'idle' | 'saving' | 'saved' | 'error'>` in `BuilderPage`. `tap()` before `switchMap` sets 'saving'; `handleSaveResult` (early-return on `!res.ok` pattern) narrows TS discriminated union; `timer(2000).subscribe(() => this.saveStatus.set('idle'))` reverts to 'idle' after 2s. `savedTick` counter guards against stale timers stomping a newer 'saved' state. Small chip in `PiPageHeader` («✓ Сохранено» / «Сохранение…» / «⚠ Ошибка»).

**Phase E — Cross-feature integration (3 files / +179 LoC):**
- `PiRowActionsComponent` extended with optional 3rd slot: `documentLabel: input<string|null>(null)` + `dataTestDocument: input<string|null>(null)` + `document: output<T>()`. Template renders the new `<button>` BEFORE the Edit button (Document → Edit → Delete; destructive-at-edge UX convention). Wrapped in `@if (documentLabel())` so the 5+ existing consumers see ZERO visual change (backwards-compat).
- Inline SVG FileText icon (14×14, stroke 1.5) — self-contained, no `lucide-angular` import needed.
- `OrdersPage` + `ContractsPage` — `Router` inject + `[documentLabel]`/`[dataTestDocument]` bindings + `(document)="onCreateDocument($event)"` handler. Navigation to `/doc-constructor/builder?source=order&sourceId=X` (or `source=contract`). `BuilderPage` D.2 plumbing reads & preserves these query params.
- **Simplification from original spec:** Original TZ-86.md Phase E assumed `/orders/:id` and `/contracts/:id` DETAIL pages exist; **they do not** (only list pages). Per thinker verdict, pivot to per-row action in list pages.

**Phase F.1 — Backend e2e specs (5 NEW suites, 34 tests, all green):**
- `text-blocks.e2e-spec.ts` (7 tests) — CRUD + slug uniqueness (409) + Russian transliteration auto-slug + soft-delete.
- `table-templates.e2e-spec.ts` (8 tests) — CRUD + `/preview` HTML + `Intl.NumberFormat` ru-RU/RUB currency + softDelete.
- `document-templates-build.e2e-spec.ts` (5 tests) — `{{organization.name}}` substitution + static dataBinding Mongoose bypass + empty placeholder fallback + invalid templateId 400.
- `registry.e2e-spec.ts` (7 tests) — 5 data sources + `{key, label, type}` field metadata.
- `document-templates-upload-background.e2e-spec.ts` (7 tests) — multer whitelist (png/jpeg/webp) + 5MB cap + 5-image limit + URL return.
- **Fix history:** `category: 'product-spec'` enum fix in table-templates spec; programmatic `generateValidInn()` helper using the same algorithm as the production `IsINNConstraint.checkInn10()` (replaced 4/6-bad hard-coded INN list).

**Verification (TZ-86):**
- Backend typecheck (`tsconfig.build.json --noEmit`) exit 0 ✅
- Frontend typecheck (`tsconfig.app.json --noEmit`) exit 0 ✅
- 5/5 e2e suites green, 34/34 tests pass (~26s total) ✅
- Code-reviewer: PASS-WITH-NITS (4 TZ-87 followups logged: DataSourceDescriptor.key typed-narrowed union drift, table-templates spec coverage gap acceptable, savedTick timer-guard pattern, scheduler race for add+reorder pair)
- 9 atomic commits on origin/main: `cdb2737` (D.1) → `d70646d` (D.2) → `1d7a51d` (E) → `f4a2bd2` (F.1) → `555eeed` (F.4 doc sync) → +4 Phase A/B/C atomic commits

**Затронутые файлы (TZ-86 cumulative):**
- **Backend (~15 files):** `text-block/{schema,service,controller,module,dto/{create,update}}`, `table-template/{schema,service,controller,dto/{create,update}}` (extended), `template-block/schema` (+dataBinding), `document-template/{service,controller,module,dto/{create,update,build}}`, `registry/{controller,service,module}`, `common/filters/multer-exception.filter`, `app.module` (registration of 3 new modules + filter)
- **Frontend (~25 files):** `shared/services/pi-{text-blocks,table-templates,document-templates,registry,template-blocks}.service.ts` (+ 5 spec files), `pages/doc-constructor/{texts,tables,builder}/{*.page,*-dialog.component,builder-{tool-pane,canvas,inspector,page}.component}.ts`, `shared/ui/canvas/pi-{canvas-page,canvas-block-handle}.component.ts`, `pages/{orders,contracts}/*.page.ts` (per-row action), `shared/ui/pi-row-actions/*.component.ts` (extended), `app.routes.ts` (+3 lazy routes), `app-layout.component.ts` (4th NAV_CATEGORY)
- **Docs:** `STATUS.md` (эта секция), `ARCHITECTURE.md` (Document Constructor zone), `progress.md` (entry)
- **Tests:** `backend/test/e2e/{text-blocks,table-templates,registry,document-templates-build,document-templates-upload-background}.e2e-spec.ts`

**Известные ограничения (не блокеры):**
- `CreateTemplateBlockDto` lacks `dataBinding` field + global `ValidationPipe whitelist: true` strips unknowns → static dataBinding test uses Mongoose bypass (legitimate test pattern when verifying the build pipeline that doesn't go through the create-block HTTP endpoint). A future TZ-XX should add `dataBinding?` to `CreateTemplateBlockDto` so the API can carry the binding through POST.
- `DataSourceDescriptor.key` typed-narrowed union (5 values); will drift silently when backend adds new sources → TZ-87 candidate: `string` + runtime zod/validation.
- `PiRowActionsComponent` per-row «Создать документ» slot — visible ТОЛЬКО when `documentLabel()` is set. 5+ existing consumers (Materials/Organizations/Dictionaries/WorkTypes/Modules) see ZERO visual change.

#### TZ-86 F.6 follow-up (2026-07-11) — Angular template-binding bugfixes (unblocks F.3)

**Мотивация:** TZ-86 был SHIPPED + archived в `ba7b66a`. F.3 browser visual verification был заблокирован — `ng serve` отказывался компилировать (Application bundle generation failed) из-за systematic Angular template-binding bugs в 7 doc-constructor файлах. Root cause: `tsconfig.json` давно имеет `"strictTemplates": true` (Angular compiler catches template-уровневые ошибки), но `tsc --noEmit` запускает только TypeScript — он НЕ вызывает Angular template typecheck. Все прежние TZ-86 verifications (`pnpm exec tsc -p tsconfig.app.json --noEmit` exit 0) прошли, потому что не покрывали templates. Только `ng serve` / `ng build` ловили этот класс багов.

**Что было исправлено (commit `28daca6`, 7 файлов, 22+ str_replaces в 3 фазах):**

**Phase 1 — mechanical (selector renames + dead-code drop):**
- `builder-inspector.component.ts`: `<pi-switch>` × 2 + `<pi-select>` + `<pi-button>` → `<app-pi-X>` (imports уже присутствовали; только template был wrong).
- `builder.page.ts`: `<pi-page-header>` + `<pi-section>` × 2 + `<pi-button>` + `<pi-select>` → `<app-pi-X>` (same pattern).
- `builder-tool-pane.component.ts`: removed unused `ButtonComponent` (NG8113); typed `httpResource<RegistryResponseShape>(()=>'/api/registry/data-sources', { defaultValue: { sources: [] } })` to fix TS2339; dropped 4 unnecessary `?? []` (NG8102) on text/table resources which already have `defaultValue: []`.
- `builder-canvas.component.ts`: removed unused `CdkDrag` (NG8113).
- `block-renderer.component.ts`: removed unused `CdkDragPlaceholder` (NG8113).
- `texts.page.ts`: dropped `?.length` (NG8107) + `?? 0` (NG8102) on non-nullable fields.
- `tables.page.ts`: same NG8107/NG8102 drops on `length` + `sortOrder`.

**Phase 2 — API correction (правильные типы из SelectComponent / SwitchComponent / PiPageHeaderComponent):**
- `builder-inspector.component.ts`: added `SelectOptionComponent` import + to `imports[]`; migrated `<app-pi-select>` from `[options]` input → `<app-pi-select-option>` children projected via `@for` (matches SelectComponent content-projection design); changed `onFormatChange(format: string | string[])` → `(format: string | null)` (matches `SelectComponent.valueChange: output<string | null>()`); removed redundant `String(format)` cast.
- `builder.page.ts`: added `eyebrow="раздел · конструктор документов"` required input to `<app-pi-page-header>` (NG8008 fix); migrated `<app-pi-select>` from `[options]` → `<app-pi-select-option>` children projection (same as inspector); widened `onTemplatePick(value: string | string[])` → `(value: string | null)`.
- `builder-tool-pane.component.ts`: widened `onAddFromData(sourceKey: 'organization' | 'counterparty' | 'product' | 'material' | 'work-type', ...)` → `(sourceKey: string, ...)` with type-safe `as` cast at emit site + JSDoc.
- `tables.page.ts`: `row.sampleRows.length` → `row.sampleRows?.length ?? 0` (SampleRow[] | undefined unlike columns which is always []).

**Phase 3 — orphan reference fix:**
- `builder.page.ts onTemplatePick`: replaced dangling `id` references в `this.router.navigate(['/doc-constructor/builder', id], ...)` (×2) с `value` (already narrowed to `string` after `if (!value) return;`).

**Verification gates passed:**
- `pnpm exec ng build --configuration=production`: PASSED в 3.357s, **0 warnings**.
- `pnpm exec ng serve`: HTTP 200 on :4200, 0 NG/TS errors в fresh log.
- `pnpm exec tsc -p tsconfig.app.json --noEmit` (frontend): exit 0.
- `pnpm exec tsc -p tsconfig.build.json --noEmit` (backend): exit 0.
- 5/5 backend e2e suites re-run: 34/34 tests PASSED в 18.7s (no regression).
- code-reviewer-minimax-m3 verdict: PASS-WITH-2-CRITICAL (atomic-history and end-to-end verification — both addressed).

**Atomic-history decision (per code-reviewer):** F.6-коммит лендингом был на `origin/main` как отдельный commit `28daca6` (a separate follow-up), а не squash в `ba7b66a` (TZ-86 archive commit) — это сохраняет TZ-86 ship history как «as designed + as shipped», а fixup commit чисто документирует что после архива понадобился template-binding sweep. Cross-reference в commit body: TZ-78 (orig-warning), TZ-AUDIT-6 (orthogonal focus-ring unification), TZ-AUDIT-8 (orthogonal hairline border).

**F.3 browser visual verification — STILL PENDING:** F.6 разблокировал `ng serve`, но фактический browser flow (login → texts CRUD → tables CRUD → builder 3-pane drag → background upload → last-saved chip) с screenshots в `tasks/_archive/2026-07/TZ-86-evidence/` ещё не запущен. TZ-87 candidate: запустить browser-use verification flow.

### TZ-170 (2026-07-24) — Конструктор документов: UX-ревизия

**Мотивация:** Пользователь: «свойства шаблона при клике на пустой холст, прозрачность, форматы, визуальные индикаторы». Множественные итерации: исправление клик-детекции, перенос палитры наверх, устранение дублирования.

**Что сделано (7 файлов):**

**1. Панель свойств шаблона (Inspector)**
- При клике на пустое место холста справа появляется панель свойств шаблона
- Ориентация: кнопки Книжная / Альбомная
- Формат страницы: A3 / A4 / A5 (заменены Letter/Legal)
- Прозрачность фона: слайдер 0-100% (рабочий дизайн из декораций)
- Нумерация страниц, Оглавление: toggle вкл/выкл
- Шапка/Подвал документа: текстовые поля
- Фоновые изображения: загрузка, выбор по умолчанию, удаление

**2. Холст — визуальные улучшения**
- Рамка шаблона: `2px solid var(--color-ink)` (была 1.5px rule)
- Dropzone заполняет всю высоту страницы — клик в любом месте
- Визуальные индикаторы: шапка (сверху), подвал (снизу), номер страницы (справа)
- A3/A4/A5 форматы с корректными размерами

**3. Палитра перенесена наверх**
- Тексты/Таблицы/Отступ — dropdown меню в горизонтальной панели
- Левая панель (280px) удалена — холст занимает всё пространство
- Альбомная ориентация теперь шире и видна пропорционально

**4. Устранение дублирования**
- Ориентация, прозрачность, декорации — только в свойствах
- Секция «Декорации» удалена из палитры

**5. Бэкенд**
- `document-template.schema.ts`: enum `pageSize` → `['A3', 'A4', 'A5']`

**Затронутые файлы:**
- `builder.page.ts` — новая layout с toolbar + dropdowns
- `builder-canvas.component.ts` — dropzone flex:1, visual indicators
- `builder-inspector.component.ts` — template properties, opacity slider
- `builder-tool-pane.component.ts` — очищен (unused)
- `pi-canvas-page.component.ts` — A3/A5 sizes, flex column, 2px border
- `pi-document-templates.service.ts` — тип pageSize обновлён
- `document-template.schema.ts` — enum обновлён

**Verification:** `ng build --configuration=production` → 0 errors ✅, `tsc --noEmit` → exit 0 ✅

**Статус:** Требует полной перепроверки по чек-листу `tasks/TZ-170.md` §3 (Tomorrow's QA pass)

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

## 🆕 Новые TZ: Quality Audit Batch (2026-07-19)

**Мотивация:** Полный аудит качества проекта — выявлено 15 задач по 6 направлениям.
**Total new tasks:** 16 (TZ-150..TZ-165)

### 🔴 CRITICAL (3 задачи)

| TZ | Название | Оценка | Dependencies |
|----|----------|--------|--------------|
| **TZ-150** | ESLint — Angular ESLint config + lint скрипты | 2-3h | — |
| **TZ-151** | CI/CD — GitHub Actions (lint + test + build) | 3-4h | TZ-150* |
| **TZ-152** | Unit тесты для 10 критических страниц (batch 1) | 6-8h🔥 | — |

> *TZ-151 можно создавать параллельно с TZ-150 — lint job будет пустым до выполнения TZ-150.
> 🔥 TZ-152 estimate может быть 2-3 дня при полном покрытии (10 страниц × 3+ тестов).

### 🟡 HIGH (5 задач)

| TZ | Название | Оценка | Dependencies |
|----|----------|--------|--------------|
| **TZ-153** | Prettier config + format скрипты | 1h | TZ-150 |
| **TZ-154** | Миграция legacy HttpClient → httpResource (6 страниц) | 4-6h | — |
| **TZ-155** | DTO validation audit — class-validator покрытие | 3-4h | — |
| **TZ-156** | E2E тесты для 5 бэкенд модулей | 5-7h | TZ-151 |
| **TZ-157** | Мониторинг — Sentry + Health Check + Uptime | 3-4h | — |

### 🟢 MEDIUM (4 задачи)

| TZ | Название | Оценка | Dependencies |
|----|----------|--------|--------------|
| **TZ-158** | Performance budgets + bundle analyzer | 2-3h | TZ-151 |
| **TZ-159** | Circular dependency detection (Madge) | 1-2h | — |
| **TZ-160** | A11y audit в CI (nightly, non-blocking) | 2-3h | TZ-151 |
| **TZ-161** | Lighthouse CI — performance regression | 2-3h | TZ-151 |

### 🔵 LOW (3 задачи)

| TZ | Название | Оценка | Dependencies |
|----|----------|--------|--------------|
| **TZ-162** | Swagger decorators audit | 2-3h | TZ-155 |
| **TZ-163** | Structured logging — requestId, traceId | 2-3h | — |
| **TZ-164** | Husky + lint-staged pre-commit hooks | 1-2h | TZ-150, TZ-153 |

### 🆕 TZ-165 — Layout audit form-dialog components

| TZ | Название | Оценка | Dependencies |
|----|----------|--------|--------------|
| **TZ-165** | Layout audit всех form-dialog (12 диалогов) + overflow-y:auto для pi-dialog form variant | 1-2h | TZ-104.4 |

**Результат аудита:** Ни один другой диалог не имеет точного такого же бага, как table-template-dialog (two-section layout с height:100%). Но найдена общая проблема: `pi-dialog.component.ts` form variant body не имеет `overflow-y: auto`, что может обрезать контент при многих FormArray-строках. Рекомендация: добавить `overflow-y: auto` в bodyClass для form variant + `min-height: 0` для 5 form-dialog с FormArray.

Подробности: `tasks/TZ-165.md`

### 📋 Дополнительные TZ-кандидаты (из ревью)

- **MongoDB indexes audit** — проверить все 65+ схем на дубликаты/отсутствие индексов
- **Frontend error boundary** — fallback UI при ошибках рендера компонента
- **Backend unified error codes** — единый формат ошибок для всех endpoint'ов

## 🆕 TZ-110..127 Backend Audit Batch (2026-08-01)

Autonomous backend engineer (`Codebuff`) провёл полный аудит 10 backend-ТЗ (TZ-110, TZ-119..126 + TZ-127):

| TZ | Outcome | Краткое содержание |
|---|---------|--------------------|
| TZ-110 | ✅ DONE (baseline) | Category backend safety — `category.service.ts:133,184` atomic update/delete via session.withTransaction |
| TZ-119 | ✅ DONE | NEW `IsObjectIdPipe` + `IsOptionalObjectIdPipe` (vendor split) + `IsObjectIdParam` decorator + audit-object-id-validation.ts CLI |
| TZ-120 | ✅ DONE | Global soft-delete plugin — `database/soft-delete.plugin.ts` auto-filter for 30+ schemas |
| TZ-121 | ✅ DONE | Cross-service TX integrity — SessionRunner helper в 9+ сервисах (TZ-121.1 для Order/Contract в successor) |
| TZ-122 | ✅ DONE | Optimistic locking — plugin + 409 filter + 4 schemas (TZ-122.1 для 30+ adoption) |
| TZ-123 | ✅ DONE | Type-safe ObjectId — `@ToOptionalObjectId()` decorator + 12+ DTOs (TZ-123.1 для 14 оставшихся service casts) |
| TZ-124 | ✅ DONE | List perf — 33 `.lean()` + 0 chained `.populate()` (TZ-124.1 для listSelects standardisation) |
| TZ-125 | ✅ DONE | Interceptor RxJS — mergeMap/catchError/defer/finalize patterns + NEW `audit.interceptor.spec.ts` 7/7 PASS |
| TZ-126 | ✅ DONE | EAV atomicity — `bulkWrite + session.withTransaction` + NEW `eav.service.spec.ts` 13/13 PASS |
| TZ-127 | ❌ FAILED | HttpOnly cookie SET but UNREAD + tiered throttler NOT implemented + frontend localStorage UNTOUCHED → TZ-127.1/2/3 successor-TZ required |
| TZ-119.1 | ❌ BLOCKED | Incremental adoption of `IsObjectIdPipe` упирается в 3 жёстких запрета пользователя: (1) массовый `findById(id: string)` → `findById(id: Types.ObjectId)` refactor в 60+ service'ах запрещён без отдельной TZ; (2) частичный adoption даёт ложное чувство защиты на 27+ оставшихся controllers; (3) третий pipe-класс (validate-only, возвращающий `string`) был REJECTED code-reviewer'ом в предыдущей continuation. 173+ unguarded `new Types.ObjectId(...)` calls остаются. Successor-TZ: **TZ-119.2** (coordinated `findById` refactor) или **TZ-119.3** (defensive `Types.ObjectId.isValid()` helper). Архив: `tasks/_archive/2026-08/TZ-119.1.blocked.md`. Lock-file НЕ создан per TZF-00 §5. |

**Verification:** `pnpm exec tsc` PASS exit 0 + 20/20 jest tests PASS (TZ-125 + TZ-126 specs).

**Master audit document:** `docs/backend-agent-checklist.md` (160 lines).

**Archive files:** `OrchestratorKit/_archive/2026-08/TZ-{110,119..127}.{done|failed}.txt`.
**Lock files:** `.mimocode/locks/TZ-{110,119..126}-*.lock` (9 DONE locks).

**`verify-status.sh`:** exit 1 (82 discrepancies — **pre-existing structural mismatch** OrchestratorKit↔`tasks/`/TZ files), 0 of which caused by this session within its scope.

> **Подзадача TZ-119.1 → ❌ BLOCKED (см. `tasks/_archive/2026-08/TZ-119.1.blocked.md`)**. Mass adoption existing `IsObjectIdPipe` (return type `Types.ObjectId`) blocked by 3 user-imposed constraints: no service-signature refactor без отдельной TZ; no partial adoption (false safety); no third pipe class (rejected by code-reviewer prior continuation). 173+ unguarded `new Types.ObjectId(...)` calls remain. Successor: **TZ-119.2** (coordinated findById refactor) или **TZ-119.3** (defensive isValid helper).


| Слой | Метрика | Значение |
|------|---------|----------|
| Backend | Entities (schema files) | 72 (basher-verified 2026-08-01: `find backend/src -name '*.schema.ts' \| wc -l` = 72; TZ-260 п.4 refresh) |
| Backend | Modules | 73 files |
| Backend | Files | ~285 |
| Backend | Build time | ~10s |
| Frontend | Pages (router) | 23 (login + operational + /kit/* showcase + /admin placeholder — см. app.routes.ts) |
| Frontend | UI components | 24+ (Paper & Ink primitives) |
| Frontend | Unit tests | 559 (59 suites) — basher-verified 2026-08-01 |
| Frontend | Bundle size | 542.84 kB initial / ~155 kB transfer |
| Frontend | Build time | ~2s |
| Backend | E2E specs | 7 baseline (post-TZ count см. archive) |

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

## 🆕 Audit Tasks — Security & Code Quality (2026-07-25)

**Мотивация:** Полный аудит проекта выявил 8 задач, не покрытых существующими TZ.

### 🔴 CRITICAL — Security (4 задачи)

| TZ | Название | Оценка | Dependencies |
|----|----------|--------|--------------|
| **TZ-171** | Убрать .env из git-истории | 30min | — |
| **TZ-172** | Закрыть публичный /auth/register | 1h | — |
| **TZ-173** | Исправить CI backend format → format:check | 20min | — |
| **TZ-174** | Добавить backend в lint-staged | 30min | TZ-173 |

### 🟡 HIGH — Code Quality (3 задачи)

| TZ | Название | Оценка | Dependencies |
|----|----------|--------|--------------|
| **TZ-175** | Добавить security scanning в CI | 1h | TZ-173 |
| **TZ-176** | Заменить console.warn на Logger + убрать as any | 1-2h | — |
| **TZ-178** | Добавить unit тесты для 5 backend сервисов | 3-4h | — |

### 🟢 MEDIUM — Architecture (1 задача)

| TZ | Название | Оценка | Dependencies |
|----|----------|--------|--------------|
| **TZ-177** | Разбить builder.page.ts (god file 1359 строк) | 2-3h | TZ-170 |

### 📋 Рекомендации по порядку

1. **Немедленно:** TZ-171 (30min) → TZ-172 (1h) → TZ-173 (20min)
2. **После:** TZ-174, TZ-175, TZ-176
3. **Параллельно:** TZ-177, TZ-178

---

## 🆕 Recent atomic commits (2026-07-11)

### TZ-83 (5 atomic commits — A/B/C/D/E)

**Сводка:** ~25 files / +1800 / -400; ~3 backend modules + 4 new pages + 3 services + 6 specs.

- `chore(backend): TZ-83A — drop ProductComponent + ProductModule ref+override + ProductModulePhoto entity + atomic attach/detach endpoints + drop-stale script` (5 review rounds PASS).
- `feat(frontend): TZ-83B — services + WorkTypes dictionary page + nav-link "Виды работ"`.
- `feat(frontend): TZ-83C — /modules list + /modules/:id 4-section detail + 2 dialogs (incl. override-dimensions UI)`.
- `feat(frontend): TZ-83D — /products/:id detail с модулями + picker dialog + clickable list rows + atomic attach endpoint на backend`.
- `test: TZ-83E — 3 backend e2e specs + 3 frontend unit specs (11 tests)`.

**Verification:** backend + frontend typecheck exit 0, 11/11 new unit tests pass.

### `28daca6` — `fix(frontend): TZ-86 F.6 follow-up — Angular template-binding bugfixes across 7 doc-constructor files`

**Сводка:** 7 files / +N / -N; commit hash `28daca6`. Unblocks F.3 browser visual verification.

**Root cause (FINAL):** `tsconfig.json` has `"strictTemplates": true` enabled but `tsc --noEmit` doesn't run Angular's template typecheck. Prior TZ-86 verifications passed `pnpm exec tsc` (exit 0) but failed `ng serve` (Application bundle generation failed with NG8001/NG8002/NG8113/NG8102/NG8107/TS2345/TS2339). 7 doc-constructor files needed systematic fix in 3 phases: (1) selector renames `<pi-X>` → `<app-pi-X>` (imports already present), (2) SelectComponent/PiPageHeaderComponent API corrections (content-projected options, eyebrow required, `string | null` value models), (3) orphan reference cleanup.

**Verification gates:**
- `pnpm exec ng build --configuration=production` → PASSED in 3.357s, 0 warnings.
- `pnpm exec ng serve` → HTTP 200 on :4200, 0 NG/TS errors in fresh log.
- frontend tsc + backend tsc → exit 0 ✅.
- 5/5 e2e suites re-run → 34/34 PASSED in 18.7s (no regression).

**Files (7):** `builder-inspector.component.ts` · `builder.page.ts` · `builder-tool-pane.component.ts` · `builder-canvas.component.ts` · `block-renderer.component.ts` · `texts.page.ts` · `tables.page.ts`. Cross-references: TZ-78 (orig-warning), TZ-AUDIT-6 (focus-ring orthogonal), TZ-AUDIT-8 (hairline border orthogonal).

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

### `0db6e79` — `chore(sec): TZ-91 Phase B.2 RBAC coverage sweep + audit script`

**Сводка:** 47 files / +211 inserts / 0 deletes; commit hash `0db6e79`. Closes TZ-91 §1 HIGH finding «RBAC не на write endpoints = 1 из 3 CRITICAL».

**Stratification:**
- 45 auto-patched controllers (batched script + per-path guard via `fs.existsSync`)
- 1 `product/product.controller.ts` (canonical nested-controller)
- 1 `product/product-subroutes.controller.ts` (3-level depth test)
- 1 `organization/contacts/organization-contact.controller.ts` (3-level depth test)
- 1 `auth/auth.controller.ts` (MANUAL: Roles import + `@Roles('admin','manager','user')` on logout)
- 1 `user/user.controller.ts` (MANUAL: `@Roles('admin','manager','user')` on update + changePassword)

**Convention applied:** `@Verb → @Roles('admin','manager') → @AuditAction` (matches canonical MaterialController).

**Self-service endpoints (manual @Roles with user tuple):**
- `auth.controller.logout` (self-service, calls `this.auth.logout(me.id)`)
- `user.controller.update` (self-service, has internal `if (me.role !== 'admin' && me.id !== id)` guard)
- `user.controller.changePassword` (self-service, same guard pattern)

**Insertion strategies:**
1. Batched script (`backend/scripts/_patch-roles-batch.ts`, deleted post-batches): depth-aware import path computation (`../../common/decorators/roles.decorator` for 2-level, `../../../common/...` for 3-level), per-path `fs.existsSync()` guard before write, idempotency via `Roles` import detection, `@Roles` insertion after `@Verb` and before `@AuditAction` via `Math.max(verbLineRel + 1, auditLineRel)` trick.
2. Manual edits (4 `str_replace` total): auth + user for self-service role tuples.

**5-batch execution:** counter + actual-cost..counter (10) → doc-type..order-closing (10) → order-task..routing-step (10) → rpp..warehouse (10) → work-center..worker (7) + manual auth/user. Per-batch verification: `pnpm exec tsc -p tsconfig.build.json --noEmit` (0 errors) + regenerated audit JSON (`missingCount` decrements) + `pnpm exec jest --testPathPattern=auth.e2e-spec.ts` (5/5 PASS).

**Verification at final state:**
- `pnpm exec tsc -p tsconfig.build.json --noEmit` → 0 errors ✅
- `pnpm exec ts-node scripts/audit-roles-coverage.ts` → `missingCount: 0`, `publicTempCount: 3` (unchanged at register/login/refresh), `okCount: 226` ✅
- `tmp/audit-roles-coverage.json` regenerated (gitignored per TZ-91D) ✅

**Forward-deferrals (NOT in this commit):**
- Audit script regex → ts-morph AST upgrade (TZ-91D) — line-based regex parser could miss unusual decorator patterns.
- Pre-existing TS2345 in `backend/src/database/soft-delete.plugin.ts(27,18)` (`'softDelete'` not a key of Mongoose `SchemaOptions`) — NOT introduced by this commit (last touched in `7fffd37` «bulk project health fixes from z.txt audit»); out of TZ-91B.2 scope; forward-deferred alongside audit-interceptor cleanup in TZ-91D.
- LazyModuleLoader + bootstrap timeout observability (TZ-94) — unblocks e2e full-suite parallel runs.
- Hardcoded test `ADMIN_PASSWORD` → env-var-driven fixture (TZ-95.2).

**Cross-references:**
- TZ-91 §1 original HIGH/Critical finding («@Public registration + RBAC not on write endpoints = 1 of 3 CRITICAL») → this commit closes the RBAC half. @Public deferral on `/register` is still TZ-91 §2 Decision 1 (waits for TZ-91-extension invite-flow).
- TZ-91A (commit `4a2d6bd`): register-AdminDto role gate still active.
- TZ-91 Phase C (`d8df374`): Swagger prod gating + `start.mjs` JWT dev-warning unaffected.
- TZ-92: Roles payloads (id, username, email, displayName, role, permissions) preserved through `auth.getMe`.

**Run auditor:** `cd backend && pnpm exec ts-node scripts/audit-roles-coverage.ts` (WARN+exit 0 if any MISSING persists).

**Code-reviewer verdict:** 🟢 Ship-ready — sampled invoice/order/rate-limit all show canonical `@Verb → @Roles → @AuditAction`; self-service 'user' tuple preserves internal authorization checks; admin-only endpoints (user.create/remove `@Roles('admin')`, user.list `@Roles('admin','manager')`) correctly retain stricter tuples unchanged.

**Lock-файлы:** N/A (chore commit, no code zone to lock).

## ⏳ Готовые к запуску (READY)

### Audit Tasks (2026-07-25) — Security & Code Quality

| TZ | Название | Layer | Оценка | Dependencies |
|----|----------|-------|--------|--------------|
| TZ-171 | Убрать .env из git-истории | 4 | 30min | — |
| TZ-172 | Закрыть публичный /auth/register | 4 | 1h | — |
| TZ-173 | Исправить CI backend format → format:check | 4 | 20min | — |
| TZ-174 | Добавить backend в lint-staged | 4 | 30min | TZ-173 |
| TZ-175 | Добавить security scanning в CI | 4 | 1h | TZ-173 |
| TZ-176 | Заменить console.warn на Logger + убрать as any | 4 | 1-2h | — |
| TZ-177 | Разбить builder.page.ts (god file) | 3 | 2-3h | TZ-170 |
| TZ-178 | Добавить unit тесты для 5 backend сервисов | 4 | 3-4h | — |

### QA audit findings (2026-08-01) — closed 2026-08-02

TZ-261 and TZ-262 were implemented, regression-tested, reviewed, and archived after the evidence-based audit. Browser smoke was not run in the isolated session; this limitation remains recorded in each archive marker.

### TZ-90 (2026-07-11) — Dialog system standardization (4 templates · 50% backdrop · 8px radius · shadow tokens · migration of 11+ existing dialogs)

**Мотивация:** Спека фиксирует единый стандарт для ВСЕХ модальных/диалоговых окон, чтобы они ощущались как «зрелое десктопное приложение» (явный запрос PO 2026-07-11). Разрозненные ad-hoc лейауты (30% editorial backdrop, разные radius, разные header-плотности) заменяются на 4 templates × 4 widths через polymorphic `<app-pi-dialog variant="...">`.

**Зафиксированные решения (9):** ровно 4 templates (Alert + Form + Content + Destructive — новый шаблон только через отдельный TZ); backdrop 50% вместо editorial 30%; shadow = `0 8px 32px rgba(0,0,0,0.24)` light / 0.48 dark через `--dialog-shadow` токен; radius 8px глобально; modal by default; animation = fade-in + scale 0.96→1.0 за 180ms с disabled@`prefers-reduced-motion`; padding 24px в body контента + 16px между sections; audit table обязательна; **polymorphic wrapper** (один `<app-pi-dialog variant>` вместо 4 отдельных компонентов).

**Audit Table (`tasks/TZ-90.md` §3) — verified 2026-07-11:**
- T1 Alert (sm): 1 dialog — `pi-alert-dialog.component.ts`
- T2 Form (lg): 8 dialogs — `module-form-dialog`, `work-type-form-dialog`, `product-form-dialog`, `contract-form-dialog`, `material-form-dialog`, `order-form-dialog`, `organization-form-dialog`, `module-materials-form-dialog`
- T3 Content (xl): 3 dialogs — `product-module-picker-dialog`, `text-block-dialog`, `table-template-dialog`
- T3 Content (xl): 1 dialog — `cost-calculation-detail-dialog` ⏳ pending TZ-85D
- T4 Destructive (md): 1 future dialog — `pi-confirm-destructive-dialog` (deferred per TZ-90 §7)
- **13/13 dialogs ↔ reality match verified via filesystem enumeration** (no expansion, no merge, no rename needed).

**Phases A → E:** A (Layer 1: tokens + shadow/animation CSS), B (Layer 2: polymorphic wrapper + animation trigger), C (Layer 3 SERIAL: migration existing 11+ dialogs), D (Layer 3 SERIAL: `/kit/overlays` Section V showcase + TZ-85D wiring), E (Layer 1: docs sync).

**Must-NOT-regress (spec §8 cross-references):**
- **TZ-83 ✅** operational pages (где живут диалоги).
- **TZ-85 IN PROGRESS** — TZ-85D = `cost-calculation-detail-dialog` станет Template 3 (Phase D.2 conditional logic готов).
- **TZ-DIALOG-OVERFLOW-FIX rounds 1-5 ✅** — `max-height: 90vh !important; overflow-x: clip !important; overflow-y: auto !important;` сохраняются в `.pi-overlay-panel`.
- **TZ-DIALOG-VISIBILITY-FIX round 5 ✅** — `background-color: var(--color-paper)` сохраняется; backdrop RGB fallback chain сохраняется.
- TZ-AUDIT-6 (focus-ring), TZ-AUDIT-8 (hairline-first borders), TZ-AUDIT-9 (warm-paper palette) — TZ-90 их НЕ ломает (только потребляет).

**STATUS:** ⏳ READY — spec committed, execution pending.

## 🔥 IN WORK (агенты работают)

| TZ | Дата старта | Описание | Статус |
|---|---|---|---|

## ✅ DONE (недавно завершены)

| TZ | Дата | Описание | Архив |
|---|---|---|---|
| TZ-102 | 2026-07-19 | Backend route gaps (Currency module + Modules rename + Inventory summary) | `tasks/_archive/2026-07/TZ-102.md.done` |
| TZ-110 | 2026-07-19 | Category backend safety — cycle prevention + existing safety sweep | `tasks/_archive/2026-07/TZ-110.md.done` |
| TZ-111 | 2026-07-19 | Builder bulk-delete race condition — partial success + snapshot rollback | `tasks/_archive/2026-07/TZ-111.md.done` |
| TZ-115 | 2026-07-19 | Inventory pages — error toast + httpResource migration | `tasks/_archive/2026-07/TZ-115.md.done` |
| TZ-104 | 2026-07-19 | Pi-* UI-kit adoption (switches + pi-table + textarea + checkbox) | `tasks/_archive/2026-07/TZ-104.md.done` |
| TZ-120 | 2026-07-19 | Global Soft-Delete Mongoose plugin | `tasks/_archive/2026-07/TZ-120.md.done` |
| TZ-103 | 2026-07-19 | Dialog system audit + 4-bug fix (close · positioning · tab-switch · buttons) | `tasks/_archive/2026-07/TZ-103.md.done` |
| TZ-261 | 2026-08-02 | Admin dialogs — as-casts removed from templates (P0, ng build 0 errors) | `tasks/_archive/2026-08/TZ-261.done.md` |
| TZ-262 | 2026-08-02 | Admin gates capability alignment (`/admin/users` route+nav `user:read` → `user:admin`) | `tasks/_archive/2026-08/TZ-262.done.md` |
| TZ-263 | 2026-08-02 | Verifier — `ng build --configuration=development` added to run-project-checks (tsc не компилирует templates) | `tasks/_archive/2026-08/TZ-263.done.md` |
| TZ-265 | 2026-08-02 | Admin pages Paper & Ink compliance — `text-red-600` → `text-destructive`, hex → tokens in 3 dialogs | `tasks/_archive/2026-08/TZ-265.done.md` |
| TZ-264 | 2026-08-02 | Admin dialog unit tests — 3 additive spec files (smoke NG5xxx guard, canSubmit, loadCatalog, toggles) | `tasks/_archive/2026-08/TZ-264.done.md` |
| TZ-266 | 2026-08-02 | Generated-document organization scope before HTML/read/write side effects (imported workspace task, renumbered) | `tasks/_archive/2026-08/TZ-266.done.md` |
| TZ-267 | 2026-08-02 | Templates registry error state and SilentResult HTTP boundary (imported workspace task, renumbered) | `tasks/_archive/2026-08/TZ-267.done.md` |
| TZ-MATERIALS-301 | 2026-08-02 | Материалы — широкий структурированный диалог (content variant + maxWidth 1000px, sticky footer, двухколоночный layout) | `tasks/_archive/2026-08/TZ-MATERIALS-301.done.md` |
| TZ-MATERIALS-302 | 2026-08-02 | Материалы — единицы из API (listActive) + поставщики: active-фильтр, loading/error/empty, unitFallback для деактивированной единицы | `tasks/_archive/2026-08/TZ-MATERIALS-302.done.md` |
| TZ-MATERIALS-303 | 2026-08-02 | Материалы — понятный код: «Внутренний код материала», DTO-декларация sku (фикс 400), E11000→409, решение B + successor TZ-307 на серверную генерацию | `tasks/_archive/2026-08/TZ-MATERIALS-303.done.md` |
| TZ-MATERIALS-304 | 2026-08-02 | Материалы — остаток отделён от карточки: убраны input/payload/колонка stockQty, legacy deprecation, successor TZ-308 (material→склад) | `tasks/_archive/2026-08/TZ-MATERIALS-304.done.md` |
| TZ-MATERIALS-305 | 2026-08-02 | Материалы — габариты: one-click-one-row, следующий неиспользованный тип по порядку, fallback length, isImmutable gap → successor TZ-309 | `tasks/_archive/2026-08/TZ-MATERIALS-305.done.md` |
| TZ-MATERIALS-306 | 2026-08-02 | Материалы — фото и надёжное сохранение: save guard (submitting||uploading), mixed upload, main photo ∈ photoIds, orphan cleanup | `tasks/_archive/2026-08/TZ-MATERIALS-306.done.md` |
| TZ-DOC-307 | 2026-08-02 | Категории шаблонов — доменный контракт (отдельная сущность DocumentTemplateCategory, categoryId в DocumentTemplate, server-side default, RBAC, backfill migration) | `tasks/_archive/2026-08/TZ-DOC-307.done.md` |
| TZ-DOC-308 | 2026-08-02 | Категории шаблонов — UI: справочник-страница, выбор категории в setup-диалоге (default auto-select), колонка + фильтр в реестре шаблонов, form-dialog, тесты | `tasks/_archive/2026-08/TZ-DOC-308.done.md` |
| TZ-DOC-268 | 2026-08-02 | Builder — диалог создания шаблона закрывается после одного клика, без дубликата POST; regression-тесты | `tasks/_archive/2026-08/TZ-DOC-268.done.md` |
| TZ-DOC-269 | 2026-08-02 | Builder — строгая рамка выделения, opt-in сетка, snap/guides проверены; тесты + ревью | `tasks/_archive/2026-08/TZ-DOC-269.done.md` |
| TZ-DOC-270 | 2026-08-02 | Builder — удержание изображения внутри рамки (clip-контейнер vs resize-handles), NaN-safe corner resize | `tasks/_archive/2026-08/TZ-DOC-270.done.md` |
| TZ-DOC-271 | 2026-08-02 | Builder — порядок слоёв (front/back/raise/lower) через computeLayerOrder, rollback при ошибке API | `tasks/_archive/2026-08/TZ-DOC-271.done.md` |
| TZ-DOC-272 | 2026-08-02 | Builder — marquee-выделение + editor-only group/ungroup (persistence НЕ имитируется) | `tasks/_archive/2026-08/TZ-DOC-272.done.md` |
| TZ-DOC-273 | 2026-08-02 | Builder — фон и прозрачность блоков: строгий hex, кламп opacity, зеркальная валидация в сгенерированном HTML | `tasks/_archive/2026-08/TZ-DOC-273.done.md` |
| TZ-ADMIN-275 | 2026-08-02 | Role form — подтверждённые hex-fallback убраны из var() (токены глобальные), 0×hex, tsc/build/jest PASS | `tasks/_archive/2026-08/TZ-ADMIN-275.done.md` |
| TZ-279 | 2026-08-02 | Workflow — дубль build-команды устранён: check:build удалён, канон build:dev, docs синхронизированы (заказан как TZ-276, номер занят другой сессией) | `tasks/_archive/2026-08/TZ-279.done.md` |

## 🚀 Следующие шаги (предложения)

Все этапы до TZ-46 завершены + Paper & Ink editorial SPA rework (TZ-30..82) + палитра (TZ-AUDIT-9, TZ-WARMUP-100, TZ-LIGHT-XX) + 6-направленная сессия улучшений. Возможные направления:

1. **Нарастить operational pages** — products, orders, contracts, warehouse, production. Канон: materials/organizations/dictionaries (AppLayout + authGuard + service + dialog).
2. **E2E tests run** — реальный прогон test/setup/* + test/e2e/*.e2e-spec.ts (тесты созданы в TZ-17, не запускались регулярно).
3. **Консолидация data model** — 16 пар дублирующих сущностей (Proposal/Quotation, SupplierOrder/PurchaseOrder, Role/Roles и др.). Документированы в `docs/data-model.md`.
4. **highlight.js + axe-core** — повторить pnpm install после lockfile reconcile (TZ-78 fallback, TZ-79 deferred).
5. **Browser-use smoke test** — TZ-82 independent, можно запустить через `ng serve` без SSR.

---

## TZ-92 series (2026-07-11) — MCP integration (3 sequential TZs)

### TZ-92: codebase-memory MCP integration baseline (retired 2026-08-01)

- Historical record only: the optional vendored MCP bundle and `.mcp.json` were removed during the canonical cleanup because the application does not depend on them.
- Commit: feat(mcp): TZ-92 baseline — vendor bundle + .mcp.json + mcp:start
- Archive: tasks/_archive/2026-07/TZ-92.md.done
- Lock: OrchestratorKit/.mimocode/locks/TZ-92-mcp-integration.lock

Vendor-bundle codebase-memory-mcp v0.9.0 (DeusData 2025, MIT) — vendor/codebase-memory-mcp/{bin,doc,README.md} + .mcp.json (RFC 8259, no _comment) + package.json mcp:start script + 4 .gitignore excludes. install.ps1 помечен НЕ ЗАПУСКАТЬ (alien installer).

### TZ-92b: MCP docs sync + HTTP UI port :9749 verified

- Commit: docs(arch, mcp): TZ-92b baseline sync — UI port :9749 + Linux/macOS constraint + MCP Integration section
- Archive: tasks/_archive/2026-07/TZ-92b.md.done
- Lock: OrchestratorKit/.mimocode/locks/TZ-92b-mcp-docs.lock

HTTP UI port :9749 verified empirically (binary v0.9.0 log scrape). ARCHITECTURE.md — новая секция MCP Integration (TZ-92) между TZ-41 (Dev Tooling) и TZ-03 (Database Layer) + Zone table row. vendor/README.md — Поддерживаемые платформы table (Win AMD64/ARM64/Linux/macOS) + Troubleshooting :9749 + auto-start hint. Stale :8765 reference заменён на verified :9749.

### TZ-92b-ux: source-build spec (Linux + macOS + Win-from-source)

- Commit: docs(tasks): TZ-92b-ux spec — source-build for Linux/macOS/Win-from-source
- Archive: tasks/_archive/2026-07/TZ-92b-ux.md.done
- Lock: OrchestratorKit/.mimocode/locks/TZ-92b-ux-mcp-source-build.lock

Spec-only commit. Source-build codebase-memory-mcp на Linux/macOS/Windows-from-source через https://github.com/DeusData/codebase-memory-mcp (public MIT, scripts/build.sh --with-ui). Per-OS .mcp.<os>.json + cp switcher, scripts/build-mcp.mjs orchestrator с cross-FS-safe atomic-move, SIGINT handler, ENOSPC disk-space pre-check (3-OS branches via df -BG / df -g / fs.statfsSync), AUR alternative для Arch. 4-round code-review hardening complete. Implementation deferred to future TZ-NN.

---
---

## TZ-85: Cost Calculation (Расчёт себестоимости поверх модульной иерархии)

### TZ-85: Cost Calculation (5 phases, DONE 2026-07-11)

- Phase A: feat(TZ-85A): CostCalculationService rewrite — drop Bom/TechProcess, use ProductModule hierarchy (commit ea184df)
- Phase B-D: feat(TZ-85): Phase B-D — cost calculation frontend (service + Section V + breakdown dialog) (commit 111ca90)
- Phase E: feat(cost-calc): TZ-85 Phase E — e2e tests + DTO hardening + doc sync (Phase E commit)
- Archive: tasks/_archive/2026-07/TZ-85.md.done
- Lock: OrchestratorKit/.mimocode/locks/TZ-85-cost-calculation.lock

Расчёт себестоимости через ProductModule hierarchy — Material.pricePerUnit × quantity + WorkType.hourlyRate × hours + overhead%. 5 phases: A (backend rewrite, drop Bom/TechProcess), B (frontend service с silent-http pattern), C (Section V на /products/:id), D (breakdown dialog с polymorphic ui-component), E (e2e test 242 lines + DTO hardening @IsOptional productId + doc sync). 1 e2e test (cost-calculation.e2e-spec.ts: 7-step scenario — create materials, workType, productModule, product; POST cost-calculation; verify totals; activate; delete). Cross-references: TZ-83 (ProductModule hierarchy), TZ-86 (Document Constructor pattern reference).

---
### TZ-91 (2026-07-11) — Critical Security Hardening (Auth · RBAC · CORS · Swagger · Rate Limit · JWT)

**Мотивация:** Закрытие 3 CRITICAL + 5 HIGH security находок QA-01 (`/auth/register` открыт, admin password пустой, JWT secrets слабые, CORS misconfigured, Swagger без auth, rate-limit отсутствует, RBAC не на write endpoints). Полный TZ-91 разбит на 4 Phases, все успешно реализованы и архивированы в этом коммите.

**Phase A (Layer 1, `4a2d6bd`) — Quick Wins (5 surgical backend edits):**
- `register.dto.ts` — `@IsString() role` → `@IsOptional() @IsIn(['user','manager'])` whitelist (defense-in-depth, нельзя создать admin через `/register` даже если guard обходят).
- `auth.controller.ts` — `@Throttle({short: {ttl: 60_000, limit: 5}, long: {ttl: 3_600_000, limit: 20}})` на `/login` (5 req/min, 20 req/hour brute-force). JSDoc `@Public()` TEMPORARY tag на `/register` поясняет до-when TZ-91-extension invite-flow ships.
- `admin.seed.ts` — `@Inject` config admin password, `length < 8` → `logger.warn(...)` + `return` (admin NOT created, bootstrap continues). Per spec §2 Decision 3: WARN+SKIP безопаснее hardcoded fallback (security anti-pattern).
- `main.ts` — `CORS_ORIGIN` preferred envvar split comma-separated, `CORS_ORIGINS` legacy fallback.
- `.env` (working-tree only, gitignored) — `ADMIN_PASSWORD=admin12345678` (≥8 override `admin123`); `CORS_ORIGIN=http://localhost:4200,http://localhost:3000`.

**Phase B.2 (Layer 2, `e88c5b7` + `0db6e79`) — RBAC Sweep (47 files, ~211 lines):**
- `backend/scripts/audit-roles-coverage.ts` (NEW) — статический анализатор write endpoints без `@Roles()`. Output: console table + `tasks/audit-roles-coverage.json`.
- 45 auto-patched controllers (batched script) + 1 `product/product.controller.ts` (canonical nested) + 1 `product/product-subroutes.controller.ts` (3-level depth test) + 1 `organization/contacts/organization-contact.controller.ts` (3-level depth test).
- 2 MANUAL: `auth.controller.ts` (`@Roles('admin','manager','user')` on logout) + `user.controller.ts` (`@Roles('admin','manager','user')` on update + changePassword — self-service endpoints with internal `me.role !== 'admin' && me.id !== id` guard).
- Convention applied: `@Verb → @Roles('admin','manager') → @AuditAction` (matches canonical MaterialController).
- Final state: `pnpm exec ts-node scripts/audit-roles-coverage.ts` → `missingCount: 0`, `publicTempCount: 3` (unchanged at register/login/refresh), `okCount: 226`.

**Phase C (Layer 2, `d8df374`) — Swagger gating + drift (3 files):**
- `backend/src/main.ts` — `if (process.env.NODE_ENV !== 'production' || process.env.SWAGGER_ENABLED === 'true') { SwaggerModule.setup('docs', app, document); }`.
- `backend/src/common/seed/admin-password-drift-detector.ts` — graceful degradation на mismatched password (WARN log + auto-update OR warn).
- `start.mjs` — preflight check: warn если `JWT_SECRET` или `JWT_REFRESH_SECRET` содержит `dev` или `do-not-use` substr.

**Phase D (Layer 1, `b4c9826`) — Docs sync (4 files):**
- `STATUS.md` (project root) — Phase A + B.2 entries (разрозненные до архивирования).
- `ARCHITECTURE.md` — new «Security Architecture (TZ-91)» mini-section перед «Auth & Identity (TZ-04)» с defense-in-depth chain (JWT → Roles → @Roles decorator → rate-limiter → CORS multi-origin → Swagger gating).
- `backend/README.md` — new «Security & Admin setup» section (ADMIN_PASSWORD requirements, JWT secrets `openssl rand -hex 32`, CORS multi-origin format, rate-limit overrides, RBAC Phase B статус, Swagger Phase C статус, explicit "что НЕ покрыто в TZ-91" table).
- `progress.md` — chronologic entry этого коммита.

**Archival (this commit) — TZF-00 финализация:**
- tasks/TZ-91.md → tasks/_archive/2026-07/TZ-91.md.done (с ARCHIVE_MARKER блоком, 8 protected files listed).
- OrchestratorKit/.mimocode/locks/TZ-91-security-hardening.lock (NEW, 8 protected files: register.dto.ts, auth.controller.ts, admin.seed.ts, roles.guard.ts, main.ts, audit-roles-coverage.ts, start.mjs, backend/README.md).
- Унифицированная секция `### TZ-91 (2026-07-11)` (эта запись) заменила разрозненные Phase A / Phase B.2 / commit `b4c9826` entries.

**Code-reviewer verdict (2 review rounds per Phase A, 1 round per Phase B.2/C/D):** 🟢 Ship-ready, no blockers. Initial reviewer 🔴 flagged hardcoded fallback password как security anti-pattern → applied WARN+SKIP per spec §2 Decision 3. 🟡 MINORs closed: (1) A.2 defer rationale явный в commit body, (2) Phase D README docs sync для deferred A.4, (3) RBAC sweep 5-batch per-path guard, (4) self-service 'user' tuple preserves internal authorization checks.

**Затронутые файлы (TZ-91 cumulative, ~55+):**
- **Backend (8 files Phase A/C + 47 files Phase B.2 + 1 NEW script + 1 README):** `register.dto.ts`, `auth.controller.ts`, `admin.seed.ts`, `admin-password-drift-detector.ts`, `main.ts`, `roles.guard.ts`, `audit-roles-coverage.ts` (NEW), 47 controllers (RBAC sweep via 5 batches), `backend/README.md`.
- **Dev tooling:** `start.mjs` (JWT dev-secret warning).
- **Docs (3 files Phase D):** `STATUS.md`, `ARCHITECTURE.md`, `backend/README.md`, `progress.md`.
- **Archival (this commit):** `tasks/TZ-91.md` (deleted), `tasks/_archive/2026-07/TZ-91.md.done` (NEW), `OrchestratorKit/.mimocode/locks/TZ-91-security-hardening.lock` (NEW), `progress.md` (this entry).

**Verification:** `pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0 ✅ (per commit). `audit-roles-coverage.ts` reported `missingCount: 0` (per `0db6e79` body) ✅. 5/5 e2e suites re-run → 34/34 tests PASSED ✅ (TZ-86 baseline preserved).

**Известные ограничения (не блокеры):**
- A.2 defer (no invite-flow yet) → self-service `/register` allows user/manager accounts via DTO constraint; admin creation blocked. Acceptable per TZ-91 §2 Decision 1 trade-off (waiting for TZ-91-extension).
- A.4 WARN+SKIP → manual `ADMIN_PASSWORD ≥ 8` setting required для fresh DB. Documented в `backend/README.md`. Dev's `.env` ships ≥8 default (admin12345678) для bootstrap-safe dev experience.
- `audit-roles-coverage.ts` CI test env node version mismatch — local invocation confirmed `missingCount: 0`. Env issue, not logical bug.
- DEFERRED to TZ-91-extension: invite-flow endpoint (`POST /api/users/invite`), account lockout after N failures, JWT secret rotation tooling, username-enumeration prevention, MFA.
- 24/27 pre-existing `verify-status.sh` FAILs remain (TZ-30-40 + TZ-47-60 missing from kit's `OrchestratorKit/_archive/`) — convention mismatch (project uses `tasks/`, kit scans `OrchestratorKit/`), НЕ regression от этого архива. Out of scope для TZ-91.

**Code-reviewer verdict on archival:** (per parallel code-reviewer-minimax-m3 call).


### TZ-90 Phase A + B (2026-07-11) — Dialog System foundation + polymorphic wrapper

**Scope:** TZ-90 spec (5 phases, 18 CONFLICT KEYS) split into sub-tasks. This commit covers Phase A (CSS tokens + CDK overlay + animation) + Phase B (polymorphic 4-template × 4-width wrapper + service animation trigger). Phase C (12 dialogs migration), Phase D (/kit/overlays + TZ-85D wiring), Phase E (docs sync) deferred to TZ-90C/D/E.

**Phase A — CSS foundation** (`frontend/src/styles.css`):
- 6 new tokens: `--dialog-bg` (paper), `--dialog-text` (ink), `--dialog-shadow` (24% light / 48% dark per TZ-AUDIT L-bump), `--dialog-radius` (8px), `--overlay-bg` (50% oklch + 50% rgb fallback for Baz layer)
- CDK overlay overrides: `.pi-overlay-backdrop` (50% opacity, 2-layer fallback), `.pi-overlay-panel` (paper bg + 8px radius + shadow + overflow rules from TZ-DIALOG-OVERFLOW-FIX rounds 1-5)
- Animation: `.pi-dialog-host-open` keyframes (fade-in + scale 0.96→1.0, 180ms ease-out, respects `prefers-reduced-motion`)

**Phase B — polymorphic wrapper** (commit `818946c`):
- `pi-dialog.component.ts`: 4 templates (alert/form/content/destructive) × 4 widths (sm/md/lg/xl) per spec §B.1
- 5 computed signals: panelClass, headerClass, bodyClass, footerClass, effectiveLabel
- Fallback table for unsupported combos (e.g. alert × md → alert × sm)
- 8px radius (rounded-lg) matches `--dialog-radius` token
- Content variant: sticky footer + bg-paper on header+footer (prevents body bleed-through)
- Destructive variant: ⚠ icon prefix in header
- `pi-dialog.service.ts`: `DialogConfig.modal` field (default true), `hasBackdrop: config.modal !== false`, `panelEl.classList.add('pi-dialog-host-open')` triggers animation
- `.gitignore`: extended pattern to `tmp/tz9*-{commit,arch}-*.txt`

**NOT TOUCHED (deferred to TZ-90C/D/E):**
- `pi-alert-dialog.component.ts` — still uses own `w-[440px]` + `rounded-sm` structure (intentional T1 one-off, TZ-90C will migrate)
- 12 operational dialogs in `pages/` — Phase C migration
- `/kit/overlays` Section V — Phase D
- TZ-85D `cost-calculation-detail-dialog` — Phase D wiring
- Docs (`paper-and-ink.md`, `add-new-page.md`) — Phase E

**Code-reviewer verdict:** 🟢 Ship-ready. 3 rounds, all nits closed (sticky-footer bg-paper, effectiveLabel computed, content header bg).

**Затронутые файлы:** `frontend/src/styles.css`, `frontend/src/app/shared/ui/dialog/pi-dialog.component.ts`, `frontend/src/app/shared/ui/dialog/pi-dialog.service.ts`, `OrchestratorKit/.mimocode/locks/TZ-90-dialog-system.lock` (NEW), `.gitignore`.

**Verification:** frontend typecheck 0 errors, code-reviewer approved, atomic commits, branch ahead of origin/main (NOT pushed, user auth required).

**Известные ограничения:** see "NOT TOUCHED" above. Phase C/D/E will extend `TZ-90-dialog-system.lock` with their own protected files.

**Lock file:** `OrchestratorKit/.mimocode/locks/TZ-90-dialog-system.lock` (6 protected files, 2 future_extensions).

### TZ-93 Phase 1 (2026-07-11) — Brutalist Architectural UI Foundations

**Scope:** TZ-93 spec (3-phase plan, tasks/TZ-93.md). This commit covers Phase 1 only — CSS foundations (3 utility classes) + playground fixture. Phase 2 (TZ-94, 12 components adoption) and Phase 3 (TZ-95, /kit/* showcase + docs) deferred.

**Phase 1 — CSS foundations** (`frontend/src/styles.css`, commit `753d6d6`):
- 3 new utility classes adopted from `stitch_professional_desktop_crm_refinement`:
  - `.pi-tech-label` (`@utility`) — 10px monospace tech label, uppercase, 0.1em letter-spacing, AAA contrast via `--color-muted-foreground-strong` (8.0:1 light, 7.5:1 dark)
  - `.pi-dashed-panel` (`@utility`) — 1px dashed `var(--color-rule)`, transparent background
  - `.pi-corner-marks` (`@layer components`) — 8px L-shaped marks in top-left and bottom-right corners via `::before/::after`, pure CSS, `pointer-events: none`
- Никаких новых color tokens — reuse existing OKLCH palette (`--font-mono`, `--color-rule`, `--color-muted-foreground-strong`)
- Respects Paper & Ink conventions: hairline-first, no `box-shadow`, no `rounded-md/lg/3xl`, warm OKLCH palette, WCAG AA minimum

**Phase 1 — playground fixture** (`frontend/src/app/pages/playground/theme-editor.page.ts`, commits `11d88a1` + `6948512`):
- New Section III «Architectural Utilities» with 3 demo cards
- Card 1: `pi-corner-marks` + `pi-tech-label` (solid hairline border + corner marks + REF label)
- Card 2: `pi-dashed-panel` alone (transparent background, dashed border)
- Card 3: Combined (`pi-corner-marks` + `pi-dashed-panel` + `bg-paper` + `pi-tech-label`)
- Code-reviewer nits closed: z-index removed from pseudo-elements (round 1), bg-paper added to combined card (round 2)

**REJECTED from brutalist source** (documented in TZ-93 spec adoption matrix):
- 0px radius everywhere → kept `rounded-sm` (interactive) / `rounded-none` (structural)
- 2px offset shadow → global `* { box-shadow: none !important }` сохранён
- 1px solid black borders → kept warm `var(--color-rule)` (L=0.880, not pure black)
- JetBrains Mono everywhere → `--font-mono` только для tech-label, IDs, numeric cells
- Charcoal primary → kept `--color-ink` (warm espresso L=0.250)

**Code-reviewer verdict:** 🟢 Ship-ready. 2 rounds, all nits closed.

**Затронутые файлы:** `frontend/src/styles.css`, `frontend/src/app/pages/playground/theme-editor.page.ts`, `OrchestratorKit/.mimocode/locks/TZ-93-brutalist-architectural-ui.lock` (NEW).

**Verification:** frontend typecheck 0 errors, code-reviewer approved (2 rounds), 3 atomic commits, branch ahead of origin/main (NOT pushed, user auth required).

**Known limitations:**
- **Browser-use visual verify BLOCKED** — `/playground/theme` за authGuard, dev server redirects to `/login`. Typecheck — primary verification gate. Visual verify deferred до auth wall resolution.
- DEFERRED-to-TZ-94: 12 components adoption (PiEmptyState, PiBadge, PiTable headers, form labels) — Layer 3 SERIAL
- DEFERRED-to-TZ-95: `/kit/*` showcase + `docs/paper-and-ink.md` + `docs/add-new-page.md` — Layer 1

**Lock file:** `OrchestratorKit/.mimocode/locks/TZ-93-brutalist-architectural-ui.lock` (2 protected files, 2 future_extensions: TZ-94, TZ-95).

### TZ-93.1 (2026-07-12) — Rollback .pi-corner-marks

**Сводка:** Mid-flight scope adjustment per user. 3 → 2 utilities; `.pi-corner-marks` rolled back due to "1990s hacker terminal" aesthetic risk.

**Scope decision:** User selected **Option C** (drop `.pi-corner-marks`) over Options A (`pi-tabular-nums`, redundant vs Tailwind v4 built-in) and B (`pi-status-pill`, redundant vs existing direct-usage pattern in BadgeComponent). Analysis: spawn_agents/thinker-with-files-gemini + ask_user confirmation.

**Что изменилось:**
- `styles.css` — `@layer components { .pi-corner-marks }` block removed (29 lines, 5 nested selectors); JSDoc updated "3 → 2 utilities" with rollback rationale in REJECTED-bullet.
- `theme-editor.page.ts` — Section III 3 cards → 2 cards (Dashed Panel + Tech Label); grid-cols-3 → grid-cols-2; intro paragraph mentions the rollback.
- `tasks/TZ-94.md` — C.2 PiEmptyTile retired (~~C.2~~ marker); C.1 wrapper simplified; commit order 5 → 4; C-numbering clarification note added; Section 6 auth wall ref disambiguated from TZ-93.1.
- `tasks/TZ-93.1.md` (NEW) — Follow-up spec; archived to `tasks/_archive/2026-07/TZ-93.1.md.done`.
- Lock file — `modifications:` section added documenting TZ-93.1 (e5d25fe); `future_extensions` updated to 5 components / 4 commits.

**Verification:** 2 atomic commits (impl + archival); frontend typecheck 0 errors; code-reviewer 2 rounds.

**Архив:** `tasks/_archive/2026-07/TZ-93.1.md.done` (per TZF-00 § 6).

## 🆕 TZ-232.I ESLint Enforcement Rules (2026-08-01)

Autonomous frontend engineer (`Codebuff`) реализовал sub-task TZ-232.I из TZ-232 Master Plan (Wave F tooling).

| Deliverable | Status |
|-------------|--------|
| `frontend/eslint/rules/no-raw-http-in-components.cjs` + `.spec.cjs` | ✅ DONE |
| `frontend/eslint/rules/no-implements-oninit-in-pages.cjs` + `.spec.cjs` | ✅ DONE |
| `frontend/eslint.config.js` — kppdf-frontend-architecture plugin + 2 file blocks | ✅ DONE |
| `frontend/jest.config.js` — testRegex extended for `eslint[/\\].*\.spec\.cjs$` | ✅ DONE |

**Архитектурное решение:** rules — CommonJS `.cjs` (не `.ts`) — Node CommonJS `require()` в `eslint.config.js` не может runtime-load `.ts` (ts-node не в deps). Trade-off: lose TS typecheck coverage on rule logic; gain Node loadability + Linter spec coverage (>5 PASS + 2 FAIL tests per rule).

**Verification:**
- `pnpm exec tsc -p tsconfig.app.json --noEmit` → exit 0 ✅
- `pnpm exec tsc -p tsconfig.spec.json --noEmit` → exit 0 ✅
- `pnpm lint` → exit 0 (25 problems: 5 PRE-EXISTING errors + **20 NEW warnings** proving rules work correctly)
- `pnpm test` → 504 PASS / 25 FAIL (25 failures = 5 PRE-EXISTING suites в `capabilities/storage-items/forbidden/dsl-entity/capability-route.guard` — NOT in TZ-232.I scope)
- code-reviewer-minimax-m3 → **PASS-WITH-MINOR** (3 important issues documented as known follow-ups)

**Archive:** `tasks/_archive/2026-08/TZ-232.I.done.md` (12621 bytes, ARCHIVE_MARKER present).
**Lock:** `.mimocode/locks/TZ-232.I-eslint-rules.lock` (1435 bytes, DONE entry).

**Known follow-ups (3, non-blocking):** (1) Plugin registered in `**/*.html` block — harmless; (2) Severity `warn` for first rollout — escalates to `'error'` after TZ-232.H; (3) `HttpHandler`/`HttpInterceptor` imports not flagged by R1 — v1 scope decision.

**Cleanup this session:** orphan `.ts` files removed via `rm -f` (4 files). `frontend/tsconfig.app.json` + `tsconfig.spec.json` revert to original (rules excluded from app/spec typecheck scope).

**`bash OrchestratorKit/verify-status.sh`** — exit 0 с 82 pre-existing repo-wide discrepancies (TZ-66..82 missing from ✅ DONE table + TZ-110..127 listed in ⏳ but no `.txt` files в `OrchestratorKit/_archive/2026-08/`); **none caused by this session within scope** (root cause: pre-existing structural mismatch OrchestratorKit↔`tasks/`/TZ files from prior batches).

## 🆕 Frontend Wave 2 ORPHANED Batch (2026-08-01)

Autonomous frontend finalizer (Phase 0) подтвердил ORPHANED outcome для всех 3 задач этой категории — реальные task-файлы для TZ-154/176/177 отсутствуют, только записи в STATUS.md.

| TZ | Outcome | Supersedes | Successor |
|----|---------|------------|-----------|
| **TZ-154** | ✅ ORPHANED + SUPERSEDED | TZ-232 Wave C-D page migration + TZ-232.I ESLint rule already shipped 2026-08-01 | None required |
| **TZ-176** | ⚠️ ORPHANED + SUPERSEDED-PARTIAL | TZ-232.I covers `as any` cleanup | **TZ-176.1** — Logger/Telemetry provider (10 `console.*` instances, 1 production use in `app.config.ts`) |
| **TZ-177** | ✅ ORPHANED + SUPERSEDED | feat/builder-magnetic-grid worktree + TZ-235.B/C partial + TZ-232.J master plan | Continue TZ-232.J after feat/builder-magnetic-grid merges |

**Архивы:** `tasks/_archive/2026-08/TZ-{154,176,177}.orphaned.md` + `frontend-wave2-orphan-batch-2026-08-01.md`.

**Аудит baseline Phase 0:**
- `inject(HttpClient)` / `this.http.*` в production `*.page.ts`/`*.component.ts` → **0 matches**.
- `httpResource` adoption → **71 matches** в `frontend/src/app/`.
- `console.*` usage → **10 instances в 5 файлах** (1 production в `app.config.ts` GlobalErrorHandler; 9 в test specs/comments).
- `as any` в production → **2 matches** в test specs (capability-route.guard.spec.ts lines 30, 32) — НЕ production.

**Verification:** `pnpm exec tsc -p tsconfig.app.json --noEmit` exit 0 (inherited PASS); `bash OrchestratorKit/verify-status.sh` exit 0 (82 pre-existing repo-wide discrepancies — 0 introduced by this session).

**Notes:**
- Не придумываем acceptance criteria для ORPHANED задач (per Phase 1 protocol).
- Не создаём lock files для ORPHANED outcome (per TZF-00 §5).
- `TZ-176.1` successor требует PO decision по logging provider (Sentry vs in-house vs ErrorBanner).

## 🆕 Consolidated Triage Batch (2026-08-01)

Autonomous-codebuff-agent (Buffy) выполнила inventory + triage всех 24 активных task-файлов. Realistic session budget позволил закрыть только то, что подтверждается кодом.

### ✅ DONE (14 tasks — code already on disk per basher-verified evidence)

| TZ | Archive | Lock |
|----|---------|------|
| TZ-248 | `tasks/_archive/2026-08/TZ-248.done.md` | `.mimocode/locks/TZ-248-production-invariants.lock` |
| TZ-249 | `tasks/_archive/2026-08/TZ-249.done.md` | `.mimocode/locks/TZ-249-trust-proxy.lock` |
| TZ-250 | `tasks/_archive/2026-08/TZ-250.done.md` | `.mimocode/locks/TZ-250-upload-hardening.lock` |
| TZ-251 | `tasks/_archive/2026-08/TZ-251.done.md` | `.mimocode/locks/TZ-251-ownership-matrix.lock` |
| TZ-252 | `tasks/_archive/2026-08/TZ-252.done.md` | `.mimocode/locks/TZ-252-refresh-cookie.lock` |
| TZ-254 | `tasks/_archive/2026-08/TZ-254.done.md` | `.mimocode/locks/TZ-254-rbac-contract.lock` |
| TZ-255 | `tasks/_archive/2026-08/TZ-255.done.md` | `.mimocode/locks/TZ-255-permissions-guard.lock` |
| TZ-256 | `tasks/_archive/2026-08/TZ-256.done.md` | `.mimocode/locks/TZ-256-capability-routes.lock` |
| TZ-256.A | `tasks/_archive/2026-08/TZ-256.A.done.md` (icon Palette→ShieldCheck + /admin placeholder, e505b9b) | `.mimocode/locks/TZ-256.A-shieldcheck-placeholder.lock` |
| TZ-257 | `tasks/_archive/2026-08/TZ-257.done.md` (mutations shipped via TZ-257.A.1) | `.mimocode/locks/TZ-257-admin-module-readonly.lock` |
| TZ-257.A.1 | `tasks/_archive/2026-08/TZ-257.A.1.done.md` (user mutations + reset-password + LastAdminGuard demotion) | `.mimocode/locks/TZ-257.A.1-admin-user-mutations.lock` |
| TZ-256.B | `tasks/_archive/2026-08/TZ-256.B.done.md` (roles CRUD — real /admin body) | `.mimocode/locks/TZ-256.B-roles-crud.lock` |
| TZ-257.B | `tasks/_archive/2026-08/TZ-257.B.done.md` (admin DTO-whitelist + permission catalog UI) | `.mimocode/locks/TZ-257.B-permissions-catalog.lock` |
| TZ-258 | `tasks/_archive/2026-08/TZ-258.done.md` | `.mimocode/locks/TZ-258-protected-onboarding.lock` |
| TZ-259 | `tasks/_archive/2026-08/TZ-259.done.md` (builder UX 259.1–259.6) | `.mimocode/locks/TZ-259-builder-ux.lock` |
| TZ-261 | `tasks/_archive/2026-08/TZ-261.done.md` (admin-dialogs template as-casts fixed — P0, ng build 0 errors) | `.mimocode/locks/TZ-261-admin-dialogs-template-as-casts.lock` |
| TZ-262 | `tasks/_archive/2026-08/TZ-262.done.md` (admin-gates capability alignment: `/admin/users` route+nav `user:read` → `user:admin`) | `.mimocode/locks/TZ-262-admin-gates-capability-alignment.lock` |
| TZ-263 | `tasks/_archive/2026-08/TZ-263.done.md` (run-project-checks + ng build gate) | `.mimocode/locks/TZ-263-verifier-ng-build-in-checks.lock` |
| TZ-265 | `tasks/_archive/2026-08/TZ-265.done.md` (admin Paper & Ink token compliance) | `.mimocode/locks/TZ-265-admin-paper-ink-compliance.lock` |
| TZ-264 | `tasks/_archive/2026-08/TZ-264.done.md` (admin dialog unit tests, 3 spec files) | `.mimocode/locks/TZ-264-admin-dialogs-unit-tests.lock` |
| TZ-266 | `tasks/_archive/2026-08/TZ-266.done.md` (generated-document organization scope, imported workspace task renumbered from sandbox TZ-261) | `.mimocode/locks/TZ-266-generated-document-scope.lock` |
| TZ-267 | `tasks/_archive/2026-08/TZ-267.done.md` (templates error boundary, imported workspace task renumbered from sandbox TZ-262) | `.mimocode/locks/TZ-267-templates-error-boundary.lock` |
| TZ-MATERIALS-301 | `tasks/_archive/2026-08/TZ-MATERIALS-301.done.md` (материалы — широкий структурированный диалог) | `.mimocode/locks/TZ-MATERIALS-301-dialog-layout.lock` |
| TZ-MATERIALS-302 | `tasks/_archive/2026-08/TZ-MATERIALS-302.done.md` (материалы — единицы и поставщики) | `.mimocode/locks/TZ-MATERIALS-302-reference-data.lock` |
| TZ-MATERIALS-303 | `tasks/_archive/2026-08/TZ-MATERIALS-303.done.md` (материалы — понятный код и идентификация) | `.mimocode/locks/TZ-MATERIALS-303-identity-code.lock` |
| TZ-MATERIALS-304 | `tasks/_archive/2026-08/TZ-MATERIALS-304.done.md` (материалы — остатки отделены от карточки) | `.mimocode/locks/TZ-MATERIALS-304-stock-boundary.lock` |
| TZ-MATERIALS-305 | `tasks/_archive/2026-08/TZ-MATERIALS-305.done.md` (материалы — габариты и неизменяемость) | `.mimocode/locks/TZ-MATERIALS-305-dimensions-contract.lock` |
| TZ-MATERIALS-306 | `tasks/_archive/2026-08/TZ-MATERIALS-306.done.md` (материалы — фото и надёжное сохранение) | `.mimocode/locks/TZ-MATERIALS-306-media-and-save-audit.lock` |
| TZ-DOC-307 | `tasks/_archive/2026-08/TZ-DOC-307.done.md` (категории шаблонов — доменный контракт) | `.mimocode/locks/TZ-DOC-307-template-category.lock` |
| TZ-DOC-308 | `tasks/_archive/2026-08/TZ-DOC-308.done.md` (категории шаблонов — UI справочник + выбор в диалоге + реестр) | `.mimocode/locks/TZ-DOC-308-template-category-ui.lock` |

**Code evidence:** все 15 файлов подтверждены через grep/ls на диске (basher-verified this session). TZ-257.A.1 / TZ-256.B / TZ-259 / TZ-257.B реализованы и закоммичены в этой сессии; остальные — filesystem cleanup + archive creation.

### ⚫ SUPERSEDED (1 task)

| TZ | Archive | Lock | Reason |
|----|---------|------|--------|
| TZ-232 | `tasks/_archive/2026-08/TZ-232.superseded.md` | `.mimocode/locks/TZ-232-superseded.lock` | Master plan document; sub-TZs (TZ-232.A..N) — actual implementation units. Sub-TZ coverage: A,B,C,D,E,F,G,I = DONE (own locks in OrchestratorKit/.mimocode/locks/); J = DONE (TZ-237 magnetic-grid shipped); H,K,L,M,N = DEFERRED |

### ⏳ DEFERRED — вне сессионного scope (5+5 tasks)

| TZ | Reason | Successor |
|----|--------|-----------|
| TZ-247 (Backend Idempotency Middleware) | DONE: backend/src/common/idempotency/ — idempotency.middleware.ts + idempotency-storage.* + smoke-скрипт | TZ-247.A — 2-3h dedicated session |
| TZ-238, TZ-239, TZ-240, TZ-241 (Multi-Tenant chain) | OrgScopeGuard + @RequireOrgScope() на 10 контроллерах; TZ-240 миграции DONE | TZ-238.A+bundle — 4-8h chain session |
| TZ-253 (Dependabot + body-size + runbook) | NO `.github/dependabot.yml`, NO `docs/runbook/`, Mongo exposure check needed | TZ-253.A — 2-3h |
| TZ-251.A | Path relocation spec scripts/ → src/scripts/ | **TZ-251.A — ATTEMPT this session (atomic)** |
| TZ-255.A | Mongo e2e harness not available; dunder rename | TZ-255.B — post-Mongo-harness |
| TZ-257.A | DONE via TZ-257.A.1 (admin user mutations + LastAdminGuard per-method + dialogs) → см. ✅ DONE | **TZ-257.B — CLOSED 2026-08-01** (DTO-whitelist + permission catalog UI) |
| TZ-258.A | ORPHANED — «spec relocate» устарел: `audit-policy-metadata.spec.ts` не существует в репо (find=0, 259.10); живых пунктов нет | — |

### Per-task verification (this session)

- `pnpm exec tsc -p tsconfig.build.json --noEmit` — exit 0 ✅ (backend)
- `pnpm exec tsc -p tsconfig.app.json --noEmit` — exit 0 ✅ (frontend)
- 82 pre-existing discrepancies в verify-status.sh (NOT caused by this session — baseline from prior sessions)

### Lock-file policy

- For DONE outcomes: lock file created in `.mimocode/locks/`
- For SUPERSEDED: separate `TZ-232-superseded.lock` for meta-archive tracking
- For DEFERRED: NO lock file (per orchestrator template §5 — deferred never gets lock)

### Lessons learned (this session)

- 11+ tasks имели "claimed DONE in body text" без archive record. **Lesson:** sessions должны архивировать сразу, иначе specs drift.
- Pre-existing 82-discrepancy baseline — orchestrator verify-status.sh скрипт could be tightened, but isn't blocking.
