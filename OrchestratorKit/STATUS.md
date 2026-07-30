# STATUS — kppdf-8.0

> 📊 **Single-source-of-truth** о состоянии тех-заданий в этом проекте.
> Откройте этот файл **первым делом** — он сразу показывает картину.

---

## 🛠️ КТО И КОГДА ОБНОВЛЯЕТ ЭТОТ ФАЙЛ

| Событие | Кто | Что делает в STATUS.md |
|---------|-----|------------------------|
| Создал `TZ-NN.txt` в корне OrchestratorKit | PO (или агент-оркестратор) | +строка в ⏳ READY |
| Начал работу (ШАГ 0 TZF-00): TZ-NN → `_active/` | Агент | строка ⏳ READY → 🔥 IN WORK + дата старта |
| Закончил работу (ШАГ 6 TZF-00): TZ-NN → `_archive/` | Агент | строка 🔥 IN WORK → ✅ DONE (или ❌ FAILED) + дата + путь |
| Пере-выпуск проваленного TZ | PO | строка ❌ FAILED → ⏳ READY, новый номер если правило требует |

> Если этот файл повредился — его можно **полностью восстановить**, просканировав
> файловую систему (см. секцию «🔧 ВОССТАНОВЛЕНИЕ» внизу).

---

## 🔥 IN WORK (агенты работают прямо сейчас, файл в `_active/`)

*Пусто — никаких TZ в работе.*

---

## ⏳ READY (готовы к выдаче агенту; файл лежит в `tasks/TZ-NN.md`)

**22 активных TZ Paper & Ink editorial SPA (TZ-61..82) — это и есть фронт работ.**

> См. секцию `📊 WAVE PLAN` для группировки по wave-ам с учётом CONFLICT KEYS.

| № | Название | Conflict Keys | Зависит от |
|---|----------|---------------|------------|
| ~~TZ-61~~ | ~~Progress (linear + circular bar)~~ | DONE 2026-07-05 | — |
| ~~TZ-62~~ | ~~Skeleton (loader placeholder)~~ | DONE 2026-07-05 | — |
| ~~TZ-63~~ | ~~Avatar (image + initials/lucide fallback)~~ | DONE 2026-07-05 | — |
| ~~TZ-64~~ | ~~Separator (hr OR label-on-line)~~ | DONE 2026-07-05 | — |
| ~~TZ-65~~ | ~~ScrollArea (themed scrollbar)~~ | DONE 2026-07-05 | — |
| ~~TZ-66~~ | ~~Chart wrapper (ngx-charts, monochrome)~~ | DONE 2026-07-05 (pure-Angular fallback, ngx-charts install FAILED) | — |
| ~~TZ-67~~ | ~~KitLayout enrich (sticky + ⌘K + theme-toggle)~~ | DONE 2026-07-05 | TZ-30..33 (✓) · kit-layout базовый ✓ |
| ~~TZ-68~~ | ~~Page primitives (PageHeader · Section · Demo)~~ | DONE 2026-07-05 | TZ-30..33 (✓) |
| ~~TZ-69~~ | ~~Overview page (`/overview`)~~ | DONE 2026-07-05 | TZ-30..68 |
| ~~TZ-70~~ | ~~Foundations page (`/foundations`)~~ | DONE 2026-07-05 | TZ-30..68 |
| ~~TZ-71~~ | ~~Basics page (`/basics`)~~ | DONE 2026-07-05 | TZ-34..39 (✓) · TZ-30..68 |
| ~~TZ-72~~ | ~~Forms page (`/forms`)~~ | DONE 2026-07-05 | TZ-40..47 (✓ строчное) · TZ-30..68 |
| ~~TZ-73~~ | ~~Overlays page (`/overlays`)~~ | DONE 2026-07-05 | TZ-48..57 (✓ строчное) · TZ-30..68 |
| ~~TZ-74~~ | ~~Navigation page (`/navigation`)~~ | DONE 2026-07-05 | TZ-58..60 (✓) · TZ-61..66 · TZ-30..68 |
| ~~TZ-75~~ | ~~⌘K Command Palette (fuzzy search + nav)~~ | DONE — archived 2026-07-05 | — |
| ~~TZ-76~~ | ~~Prop Playground (Button + Badge live controls)~~ | DONE 2026-07-05 | TZ-34..35 • TZ-68 |
| ~~TZ-77~~ | ~~Theme Editor (OKLCH live sliders, non-destructive overrides)~~ | DONE 2026-07-05 | TZ-32 + TZ-33 • TZ-67 |
| ~~TZ-78~~ | ~~Live Code Preview (highlight.js)~~ | DONE 2026-07-05 (fallback) | TZ-68 + TZ-69..74 |
| ~~TZ-79~~ | ~~Print stylesheet + axe-core a11y audit~~ | DONE 2026-07-05 (@media print only) | TZ-31..32 • TZ-67..78 |
| TZ-80 | ~~SSR / hydration + Lighthouse ≥95 config~~ | **REJECTED 2026-07-05** (out of project scope) | TZ-30 • TZ-67 + TZ-69..74 |
| ~~TZ-81~~ | ~~README + docs (Russian editorial)~~ | DONE 2026-07-05 | TZ-30..79 |
| ~~TZ-82~~ | ~~Browser-use smoke test~~ | pending | TZ-67 + TZ-69..74 • TZ-79 |
| ~~TZ-90~~ | ~~Диалоговая система (Phase A+B shipped; Phase C/D/E deferred)~~ | DONE — Phase A+B archived 2026-07-12 | — |
| TZ-232 | DSL Master Plan (Angular Assembly) — sub-TZ A-N. **DONE parts:** A, B-shim, C, D, E, F, G, H, I, J (partial via TZ-235), K (FormErrorI18n 2026-07-30), **+ organizations PoC (storage-items → orgs) 2026-07-30**, **+ TZ-232.W2 list-pages migration (materials/products/work-types/modules/tables — −1612 lines, −69%) 2026-07-30, commit 98dc960**. Остаются runtime work: TZ-232.D (Sentinel list-pages для counterparties/persons/units/currencies), TZ-232.E (OnInit migration). | frontend/src/app/shared/dsl/*; frontend/src/app/shared/ui/*; frontend/src/app/pages/* | — |
| TZ-235 | Конструктор v2 UX-апгрейд (16 sub-TZ, 7 waves, ~140-180h) — planning doc. **Wave 1 R2 (BuilderStateService: 16 handlers extraction) DONE** (commit 3633b9c). **Wave 1 R3 (page.ts dual-source cleanup: -607 lines) DONE** (commit 0cb8e60). **Wave 2 R1 (block-renderer: 1484 → 941 lines, -37%) DONE** (commit 7a27443). **Wave 2 R2 (builder-inspector: 1856 → 464 lines, -75%, decomposed into 5 files) DONE 2026-07-30** (commit 5837981): BuilderInspectorStateService + TemplatePropertiesFormComponent + BlockInspectorComponent + MultiSelectInspectorComponent + thin switcher. Pattern: per-instance service + sub-component hierarchical DI + Subject↔output bridge. builder.page.ts: 0 lines changed. Pending sub-waves: TZ-235.C.1 (imageHeight bugfix + audit pre-existing issue), TZ-235.D (group drag), TZ-235.E (undo/redo), TZ-235.G (scroll-aware drag). | frontend/src/app/pages/doc-constructor/builder/* | TZ-232.J |
| TZ-236 | PDF/Print стек (4 waves, ~140-180h) — planning doc. **Wave A.1 (Gotenberg Docker + Cyrillic fonts + start.mjs integration) DONE 2026-07-30** (commit 3b3ed16). **Wave B (PdfRender NestJS module + Gotenberg HTTP integration) DONE 2026-07-30** (commit 84d912c). **Wave C (background images via host.docker.internal + async render queue + Chromium header/footer) DONE 2026-07-30** (commit ec54189). Phase A.2 (PT Sans/Serif/Mono) + Wave D (UI integration on frontend) pending. | docker-compose.yml; docker/Dockerfile.gotenberg; backend/src/modules/pdf-render/* | — |
| ~~TZ-110~~ | ~~Category backend safety (cycle prevention + fullPath cascade + ObjectId validation)~~ | DONE 2026-07-19 | — |
| ~~TZ-111~~ | ~~Builder bulk-delete race condition (partial success + snapshot rollback)~~ | DONE 2026-07-19 | — |
| ~~TZ-112~~ | ~~Table Template Dialog — column metadata preservation + edit init + sampleRows limit~~ | DONE 2026-07-19 | — |
| ~~TZ-113~~ | ~~Builder Canvas — keyboard accessible multi-select (ARIA listbox + roving tabindex)~~ | DONE 2026-07-19 | TZ-111 |
| ~~TZ-114~~ | ~~Categories Page — drag-reorder UI + optimistic update~~ | DONE 2026-07-19 | TZ-110 |
| ~~TZ-115~~ | ~~Inventory pages — httpResource migration + error toast + forkJoin race fix~~ | DONE 2026-07-19 | — |
| ~~TZ-116~~ | ~~Sort state reactivity bug + numeric-flag mismatch + initialSortKey accessor~~ | DONE 2026-07-19 | TZ-115 |
| ~~TZ-117~~ | ~~Toolbar UX — Reload button + PiSearchInput + accessible table row activation~~ | DONE 2026-07-19 | — |
| ~~TZ-118~~ | ~~Cross-page Type Safety — PiErrorBanner + dialog callback-tightening~~ | DONE 2026-07-19 | TZ-115..117 |
| ~~TZ-119~~ | ~~Backend safety sweep — ObjectId validation + atomic bulkWrite (5 modules)~~ | DONE 2026-07-19 | TZ-110 |
| ~~TZ-120~~ | ~~Global Soft-Delete Filter — Mongoose plugin (30+ services)~~ | DONE 2026-07-19 | — |
| ~~TZ-121~~ | ~~Cross-Service Transaction Integrity — shared Mongo sessions (Order/Contract/Reservation/Shipment)~~ | DONE 2026-07-19 | TZ-120 |
| ~~TZ-122~~ | ~~Optimistic Locking — Mongoose versionKey + 409 Conflict filter (30+ services)~~ | DONE 2026-07-19 | TZ-120 |
| ~~TZ-123~~ | ~~Type-Safe ObjectId Refactoring — @ToOptionalObjectId() decorator (12+ services)~~ | DONE 2026-07-19 | — |
| ~~TZ-124~~ | ~~List-Query Populate Optimization — batch populate + lean() (6+ services)~~ | DONE 2026-07-19 | — |
| ~~TZ-125~~ | ~~Interceptor RxJS Leaks — tap(async) → mergeMap+catchError, leak fixes~~ | DONE 2026-07-19 | — |
| ~~TZ-126~~ | ~~EAV Partial Writes — bulkWrite в transaction() + enum .trim()~~ | DONE 2026-07-19 | TZ-120 |
| ~~TZ-127~~ | ~~Auth Rate-Limit Bypass — tiered throttler + HttpOnly cookies~~ | DONE 2026-07-19 | — |
| ~~TZ-233~~ | ~~TZ-AUDIT — 19 Freebuff skills ↔ archive evidence table (DOC-ONLY)~~ | DONE 2026-07-30 | — |
| ~~TZ-233~~ | ~~TZ-AUDIT — обоснование 19 скиллов через архивные TZ (DOC-ONLY)~~ | DONE 2026-07-30 | TZ-232 (DONE context) |
| TZ-111 | Builder bulk-delete race condition (per-item mergeMap + rollback snapshot + ghost counter) | frontend/src/app/pages/doc-constructor/builder/builder.page.ts; frontend/src/app/shared/services/pi-template-blocks.service.ts | — |
| TZ-112 | Table Template Dialog — column metadata preservation on field toggle + edit init + sampleRows limit | frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.ts | — |
| TZ-113 | Builder Canvas — keyboard accessible multi-select (ARIA listbox + roving tabindex + range select) | frontend/src/app/pages/doc-constructor/builder/block-renderer.component.ts; frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts; frontend/src/app/pages/doc-constructor/builder/builder.page.ts | TZ-111 |
| TZ-114 | Categories Page — drag-reorder UI + optimistic update + cascade visual feedback | frontend/src/app/pages/dictionaries/categories.page.ts; frontend/src/app/shared/services/categories.service.ts | TZ-110 |
| TZ-115 | Inventory pages — silent-http error toast + httpResource migration + forkJoin race fix | frontend/src/app/pages/inventory/storage-items.page.ts; frontend/src/app/pages/inventory/stock-movements.page.ts; frontend/src/app/pages/inventory/inventory-dashboard.page.ts | — |
| TZ-116 | Sort state reactivity bug + numeric-flag mismatch + initialSortKey accessor gap | frontend/src/app/pages/work-types/work-types.page.ts; frontend/src/app/pages/inventory/storage-items.page.ts; frontend/src/app/pages/inventory/stock-movements.page.ts; (опц.) frontend/src/app/shared/ui/pi-table.component.ts | TZ-115 (если оба edit inventory/*) |
| TZ-117 | Toolbar UX — Reload button + PiSearchInput component + accessible table row activation | frontend/src/app/shared/page/pi-toolbar.component.ts; frontend/src/app/shared/page/pi-search-input.component.ts (NEW); 7+ list-pages | — |
| TZ-118 | Cross-page Type Safety — PiErrorBanner extraction + dialog callback-tightening + empty-route guards | frontend/src/app/shared/ui/error-banner/pi-error-banner.component.ts (NEW); frontend/src/app/shared/util/on-dialog-close-once.ts; product-detail.page.ts; 7+ list-pages | TZ-115 → TZ-117 → TZ-118 (sequencing); TZ-105.3 coordination |
| TZ-119 | Backend safety sweep — ObjectId validation + atomic bulkWrite + cascade across products/orders/contracts/work-types/materials modules | backend/src/modules/{products, orders, contracts, work-types, materials}/*; may create `backend/src/common/validators/is-object-id.pipe.ts` (NEW module-wide helper) | TZ-110 (pattern reuse) |
| TZ-120 | Global Soft-Delete Filter — Mongoose плагин для auto-исключения `deletedAt` документов из findAll/findById по 30+ сервисам | backend/src/common/mongoose/soft-delete.plugin.ts (NEW); backend/src/app.module.ts (connectionFactory); все *.schema.ts с полем deletedAt | — (параллельно с TZ-121..124) |
| TZ-121 | Cross-Service Transaction Integrity — shared Mongo sessions для Order.reserveStock/cancel/ship и Contract.activate | backend/src/common/db/run-in-session.ts (NEW); backend/src/modules/order/order.service.ts; backend/src/modules/contract/contract.service.ts; backend/src/modules/reservation/reservation.service.ts; backend/src/modules/shipment/shipment.service.ts | TZ-110 (pattern reuse); TZ-120 желательно ДО |
| TZ-122 | Optimistic Locking — Mongoose versionKey + VersionError → 409 Conflict filter + safe assign refactor в 30+ update-сервисах | backend/src/common/mongoose/optimistic-lock.plugin.ts (NEW); backend/src/common/filters/version-conflict.filter.ts (NEW); backend/src/main.ts; все update-сервисы | TZ-120 желательно ДО (чтобы locking не mask deleted) |
| TZ-123 | Type-Safe ObjectId Refactoring — устранение `as unknown as Types.ObjectId` хаков в 12+ сервисах через `@ToOptionalObjectId()` decorator | backend/src/common/decorators/to-object-id.decorator.ts (NEW); backend/src/modules/*/dto/*.dto.ts (12+); backend/src/modules/*/*.service.ts | — |
| TZ-124 | List-Query Populate Optimization — batch populate + select для list views + lean() в 6+ сервисах (material/product/order/contract/org) | backend/src/common/mongoose/fast-populate.ts (NEW); backend/src/modules/{material,product,order,contract,organization}/*.service.ts | — |
| TZ-125 | Interceptor RxJS Leaks — `tap(async)` → `mergeMap+catchError` в audit, manual `new Observable` → `from+firstValueFrom` в user-context, `finalize()` в logging | backend/src/common/interceptors/audit.interceptor.ts; backend/src/common/interceptors/user-context.interceptor.ts; backend/src/common/interceptors/logging.interceptor.ts; backend/src/common/interceptors/audit.interceptor.spec.ts (NEW) | — (параллельно с TZ-126, TZ-127) |
| TZ-126 | EAV Partial Writes — `resolveAttributes` → bulkWrite в `startSession().withTransaction()` + enum `.trim()` policy | backend/src/common/eav/eav.service.ts; backend/test/eav.service.spec.ts (NEW) | TZ-120 (soft-delete) желательно ДО (иначе TZ-125/126 partial-state mask) |
| TZ-127 | Auth Rate-Limit Bypass + XSS Tokens — tiered throttler (anon 20/user 300/admin 1500 RPM) + refresh в HttpOnly cookie + access только в memory signal | backend/src/common/guards/tiered-throttler.guard.ts (NEW); backend/src/common/guards/throttler-behind-auth.guard.ts (DELETE); backend/src/main.ts (cookie-parser); backend/src/modules/auth/auth.{controller,service}.ts; frontend/src/app/core/auth.{service,interceptor}.ts | — (параллельно с TZ-125) |

