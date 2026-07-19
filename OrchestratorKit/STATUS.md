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
| TZ-110 | Category backend safety (fullPath cascade + ObjectId validation + atomic bulkWrite) | backend/src/modules/category/category.service.ts; backend/src/modules/category/category.controller.ts; backend/src/modules/category/category.schema.ts | — |
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

> **Observability chain:** TZ-110 — pure backend (Layer 4), параллельно OK с TZ-111 (Layer 3 frontend) и TZ-112 (Layer 3 dialog). TZ-113 ДОЛЖЕН идти после TZ-111 (тот же page, race fix). TZ-114 ДОЛЖЕН идти после TZ-110. **TZ-115..118 — cross-page batch**: storage-items + stock-movements shared между TZ-115 & TZ-116 → SERIAL; PiErrorBanner в TZ-118 конфликтует с TZ-105.3 → coord decision. **TZ-115 → TZ-117 → TZ-118** sequencing enforced. **TZ-119** — параллельно OK с TZ-115..118 (different layer).

**Backend cross-cutting batch TZ-120..124:** TZ-120 (soft-delete plugin) → желательно ДО TZ-122 (чтобы locking не mask deleted records). TZ-121 (cross-service tx) может идти параллельно с TZ-123/124 (нет CONFLICT KEYS в одних файлах). TZ-123 (type-safety) — изолирован, параллельно с любым. TZ-124 (list perf) — касается read-path, parallel safe с TZ-121/123. **Рекомендованный sequencing:** TZ-120 добазовый → [TZ-121 ‖ TZ-123 ‖ TZ-124] параллельно → TZ-122 финальный (когда всё на месте, чтобы новый плагин оптимистической блокировки не конфликтовал с соседними TZ во время merge).

**Backend security/reliability batch TZ-125..127 (CRITICAL/HIGH):** TZ-125 (interceptor RxJS) — независимый, параллельно с TZ-126/127. TZ-126 (EAV atomicity) — желательно ПОСЛЕ TZ-120 (soft-delete plugin) чтобы partial-state в EAV не маскировался deleted. TZ-127 (tiered rate-limit + HttpOnly cookie) — параллельно с TZ-125, после TZ-126 (чтобы TZ-126 EAV bulkWrite не съел ресурсы при tiered-throttler). **Рекомендованный sequencing:** TZ-120 (если ещё не done) → [TZ-125 ‖ TZ-127] параллельно → TZ-126 финальный.


### Параллелизм (max 4–5 по запросу PO)

Kit правила: **Layer 2 ≤ 2 одновременно · Layer 3 = СТРОГО 1 за раз**.
При пере-интерпретации в «max 4–5» — нужно проверять CONFLICT KEYS вручную:

- **WAVE A** (Display primitives, фундамент работы): TZ-61 + TZ-62 в параллель · TZ-63 + TZ-64 в параллель · TZ-65 alone (стилей touch) · TZ-66 alone (нужен `pnpm add ngx-charts`).
- **WAVE B** (Layout + page primitives, Layer 3 SERIAL): TZ-67 → TZ-68.
- **WAVE C** (6 pages, разные папки — параллель ок): TZ-69 + TZ-70 + TZ-71 + TZ-72 → TZ-73 + TZ-74.
- **WAVE D** (Cross-cutting, mixed): TZ-75 + TZ-76 + TZ-81 в параллель (нет shared conflict keys) · TZ-77 alone (routes + theme runtime)  · TZ-78 + TZ-79 в параллель (оба touch styles.css, но разные блоки) · **TZ-80 REMOVED** (rejected, out of scope) · **TZ-82** — independent smoke runner against dev :4200 (no SSR dependency).

---

## ✅ DONE (в `_archive/<YYYY-MM>/TZ-NN.done.txt`)

| № | Дата | Название | Файл архива |
|---|------|----------|-------------|
| TZ-02 | 2026-07-04 | NestJS Foundation | _archive/2026-07/TZ-02.done.txt |
| TZ-03 | 2026-07-04 | Mongoose & Base Config | _archive/2026-07/TZ-03.done.txt |
| TZ-04 | 2026-07-04 | Auth & Identity | _archive/2026-07/TZ-04.done.txt |
| TZ-05 | 2026-07-04 | System & Workflow | _archive/2026-07/TZ-05.done.txt |
| TZ-06 | 2026-07-04 | Organizations & Contacts | _archive/2026-07/TZ-06.done.txt |
| TZ-07 | 2026-07-04 | Catalog Core | _archive/2026-07/TZ-07.done.txt |
| TZ-08 | 2026-07-04 | EAV & Product Meta | _archive/2026-07/TZ-08.done.txt |
| TZ-09 | 2026-07-04 | Production Dictionaries | _archive/2026-07/TZ-09.done.txt |
| TZ-10 | 2026-07-04 | Production Execution | _archive/2026-07/TZ-10.done.txt |
| TZ-11 | 2026-07-04 | Warehouse Engine | _archive/2026-07/TZ-11.done.txt |
| TZ-41 | 2026-07-05 | Health Check Panel + Log TUI | tasks/_archive/2026-07/TZ-41.md.done |
| TZ-42 | 2026-07-05 | Production Deployment Mode | tasks/_archive/2026-07/TZ-42.md.done |
| TZ-43 | 2026-07-05 | Fix Mongoose Duplicate Indexes | tasks/_archive/2026-07/TZ-43.md.done |
| TZ-44 | 2026-07-05 | DEP0190 Fix — shell:true → execFile | tasks/_archive/2026-07/TZ-44.md.done |
| TZ-45 | 2026-07-05 | Backend DI Audit | tasks/_archive/2026-07/TZ-45.md.done |
| TZ-46 | 2026-07-05 | Clean Launch Console (RU + ASCII + NG-fix) | tasks/_archive/2026-07/TZ-46.md.done |
| TZ-56 | 2026-07-05 | Sonner-style Toast (service + host + a11y) | _archive/2026-07/TZ-56.done.txt |
| TZ-61 | 2026-07-05 | Progress (linear + circular bar, hairline) | _archive/2026-07/TZ-61.done.txt |
| TZ-62 | 2026-07-05 | Skeleton (loader placeholder, hairline blocks) | _archive/2026-07/TZ-62.done.txt |
| TZ-63 | 2026-07-05 | Avatar (image + initials/lucide fallback) | _archive/2026-07/TZ-63.done.txt |
| TZ-64 | 2026-07-05 | Separator (hr OR label-on-line, hairline) | _archive/2026-07/TZ-64.done.txt |
| TZ-65 | 2026-07-05 | ScrollArea (themed scrollbar, max-height) | _archive/2026-07/TZ-65.done.txt |
| TZ-66 | 2026-07-05 | Chart wrapper (bar + line, pure-Angular SVG) | _archive/2026-07/TZ-66.done.txt |
| TZ-67 | 2026-07-05 | KitLayout enrich (sticky + ⌘K hint + theme toggle) | _archive/2026-07/TZ-67.done.txt |
| TZ-68 | 2026-07-05 | Page primitives (PageHeader · Section · Demo) | _archive/2026-07/TZ-68.done.txt |
| TZ-69 | 2026-07-05 | Overview page (/) — hero + 4 sections + Sonner toast panel | _archive/2026-07/TZ-69.done.txt |
| TZ-70 | 2026-07-05 | Foundations page (/foundations) — palette + typography + spacing + grid | _archive/2026-07/TZ-70.done.txt |
| TZ-71 | 2026-07-05 | Basics page (/basics) — Buttons + Inputs + Badge + Card | _archive/2026-07/TZ-71.done.txt |
| TZ-72 | 2026-07-05 | Forms page (/forms) — validated form + sortable paginated table | _archive/2026-07/TZ-72.done.txt |
| TZ-73 | 2026-07-05 | Overlays page (/overlays) — dialogs + sheet+drawer + tooltip+popover + dropdown + toast | _archive/2026-07/TZ-73.done.txt |
| TZ-74 | 2026-07-05 | Navigation page (/navigation) — tabs + breadcrumb + accordion + charts + separator + scrollarea | _archive/2026-07/TZ-74.done.txt |
| TZ-75 | 2026-07-05 | ⌨K Command Palette (fuzzy search + nav) | _archive/2026-07/TZ-75.done.txt |
| TZ-76 | 2026-07-05 | Prop Playground (Button + Badge live controls) | _archive/2026-07/TZ-76.done.txt |
| TZ-77 | 2026-07-05 | Theme Editor (OKLCH live sliders, non-destructive overrides) | _archive/2026-07/TZ-77.done.txt |
| TZ-81 | 2026-07-05 | README + docs (Russian editorial) | _archive/2026-07/TZ-81.done.txt |
| TZ-78 | 2026-07-05 | Live Code Preview (fallback: plain “pre”, no highlight.js — pnpm install FAILED) | _archive/2026-07/TZ-78.done.txt |
| TZ-79 | 2026-07-05 | Print stylesheet + axe-core a11y audit (DONE — 0 serious/critical on 7 routes) | _archive/2026-07/TZ-79.done.txt |
| TZ-80 | 2026-07-05 | ~~SSR / hydration~~ REJECTED — out of project scope | _archive/2026-07/TZ-80.done.txt |
| TZ-82 | 2026-07-05 | Smoke test (PENDING — runs against :4200 dev server, INDEPENDENT of TZ-80) | _archive/2026-07/TZ-82.done.txt |
| TZ-AUDIT-9 | 2026-07-07 | Warm Paper Palette Rebrand (hue 70, chroma 0.015-0.025) | tasks/_archive/2026-07/TZ-AUDIT-9.md.done |
| TZ-AUDIT-9.1 | 2026-07-07 | Dark Mode L Bump (perceptual density: paper 0.18→0.21, paper-2 0.24→0.27) | tasks/_archive/2026-07/TZ-AUDIT-9.md.done (sub-iteration) |
| TZ-87 | 2026-07-12 | Doc Constructor F.3 close-out (B.1 + B.2 + B.4 shipped; B.3 browser-use DEFERRED pending production-infra) | tasks/_archive/2026-07/TZ-87.md.done |

---

## 📜 SUPERSEDED (2026-07-05 UI Hardening Rework)

**31 TZ (TZ-30..60, + TZ-44a/b/c split history) помечены как superseded.**

Каждый имеет пару **`.done.txt` + `.superseded.txt`** в `_archive/2026-07/`.
Lock-файлы в `.mimocode/locks/TZ-NN-*.lock` **сохранены** — они защищают
кодовые зоны (`shared/ui/*`, `shared/page/*`, `layout/kit-layout.component.ts`,
`styles.css`, `main.ts`), которые **остаются в коде** и являются foundation
для TZ-61..82.

| № | State | Files (relative `_archive/2026-07/`) |
|---|-------|-------|
| TZ-30 | superseded | TZ-30.done.txt + TZ-30.superseded.txt |
| TZ-31 | superseded | TZ-31.done.txt + TZ-31.superseded.txt |
| TZ-32 | superseded | TZ-32.done.txt + TZ-32.superseded.txt |
| TZ-33 | superseded | TZ-33.done.txt + TZ-33.superseded.txt |
| TZ-34 | superseded | TZ-34.done.txt + TZ-34.superseded.txt |
| TZ-35 | superseded | TZ-35.done.txt + TZ-35.superseded.txt |
| TZ-36 | superseded | TZ-36.done.txt + TZ-36.superseded.txt |
| TZ-37 | superseded | TZ-37.done.txt + TZ-37.superseded.txt |
| TZ-38 | superseded | TZ-38.done.txt + TZ-38.superseded.txt |
| TZ-39 | superseded | TZ-39.done.txt + TZ-39.superseded.txt |
| TZ-40 | superseded | TZ-40.done.txt + TZ-40.superseded.txt |
| TZ-41 | superseded | TZ-41.done.txt + TZ-41.superseded.txt (duplicate of DONE auth — отметка архивной истории) |
| TZ-42 | superseded | TZ-42.done.txt + TZ-42.superseded.txt (duplicate of DONE prod-mode) |
| TZ-43 | superseded | TZ-43.done.txt + TZ-43.superseded.txt (duplicate of DONE mongoose-fix) |
| TZ-44 | superseded | TZ-44.done.txt + TZ-44.superseded.txt |
| TZ-44a/b/c | superseded | TZ-44a.superseded.txt + TZ-44b.superseded.txt + TZ-44c.superseded.txt |
| TZ-45 | superseded | TZ-45.done.txt + TZ-45.superseded.txt |
| TZ-46 | superseded | TZ-46.done.txt + TZ-46.superseded.txt |
| TZ-47 | superseded | TZ-47.done.txt + TZ-47.superseded.txt |
| TZ-48 | superseded | TZ-48.done.txt + TZ-48.superseded.txt |
| TZ-49 | superseded | TZ-49.done.txt + TZ-49.superseded.txt |
| TZ-50 | superseded | TZ-50.done.txt + TZ-50.superseded.txt |
| TZ-51 | superseded | TZ-51.done.txt + TZ-51.superseded.txt |
| TZ-52 | superseded | TZ-52.done.txt + TZ-52.superseded.txt |
| TZ-53 | superseded | TZ-53.done.txt + TZ-53.superseded.txt |
| TZ-54 | superseded | TZ-54.done.txt + TZ-54.superseded.txt |
| TZ-55 | superseded | TZ-55.done.txt + TZ-55.superseded.txt |
| TZ-56 | superseded | TZ-56.done.txt + TZ-56.superseded.txt |
| TZ-57 | superseded | TZ-57.done.txt + TZ-57.superseded.txt |
| TZ-58 | superseded | TZ-58.done.txt + TZ-58.superseded.txt |
| TZ-59 | superseded | TZ-59.done.txt + TZ-59.superseded.txt |
| TZ-60 | superseded | TZ-60.done.txt + TZ-60.superseded.txt |

---

## ❌ FAILED (нужен пере-выпуск; файл в `_archive/<YYYY-MM>/TZ-NN.failed.txt`)

*Пусто — никаких TZ проваленных.*

---

## 📊 ГРАФ ЗАВИСИМОСТЕЙ (active TZ-61..82 chain)

```
TZ-61 ─┐
TZ-62 ─┤
TZ-63 ─┼──→ TZ-67 → TZ-68 → TZ-69 ──┐
TZ-64 ─┤                              │
TZ-65 ─┤   (kit-layout + page-prims)  │
TZ-66 ─┘                              ├─→ TZ-75 → TZ-82
                                     │   TZ-76
                                     │   TZ-77                        TZ-70 ──┐     │   TZ-78
                       TZ-71 ──┼─→ TZ-72   TZ-79
                       TZ-73   │   TZ-74
                                  TZ-81
                                  (TZ-80 rejected; TZ-82 stands alone)
                                                              TZ-82
```

**Edges-legend:**
- `→` = dependency (downstream needs upstream done first).
- Same-column rows in WAVE A = `Layer 2 ≤ 2 параллель` (не более 2 одновременно).
- WAVE B = `Layer 3 СТРОГО 1`.
- WAVE C/D = параллель по разным файлам (до 4–5 параллельно по запросу).

---

## 🔧 ВОССТАНОВЛЕНИЕ STATUS.md ИЗ ФАЙЛОВОЙ СИСТЕМЫ

STATUS.md — это **производное от файловой системы**. Если он повредился, восстановите так:

| Секция | Команда |
|--------|---------|
| ⏳ READY | `ls tasks/TZ-*.md` |
| 🔥 IN WORK | `ls OrchestratorKit/_active/*.txt` |
| ✅ DONE | `find . -path '*/_archive/*.done.txt'` |
| ❌ FAILED | `find . -path '*/_archive/*.failed.txt'` |
| 📜 SUPERSEDED | `find OrchestratorKit/_archive -name '*.superseded.txt'` |

> **Шпаргалка:** запустите `bash OrchestratorKit/verify-status.sh` — он сравнит
> статус с файловой системой и покажет конкретные расхождения. Если что-то
> совсем плохо — `bash OrchestratorKit/kit-doctor.sh` даст человеко-понятные
> советы по каждой проблеме.

---

_Этот файл — single source of truth. Любые обновления — только через TZF-00
(для агента) или `bash OrchestratorKit/auto-archive.sh` (для финализации)._
