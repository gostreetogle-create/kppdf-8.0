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

## ✅ DONE (recent)

| № | Название | Closed | Archive |
|---|----------|--------|---------|
| TZ-CATALOG-DEDUP-302 | Retire ModuleMaterials dialog | 2026-08-08 | `tasks/_archive/2026-08/TZ-CATALOG-DEDUP-302.done.md` |
| TZ-UX-FACT-301 | PiFactCard + FactStack UI kit | 2026-08-08 | `tasks/_archive/2026-08/TZ-UX-FACT-301.done.md` |
| TZ-UX-312 | Composition tree larger thumb + denser row | 2026-08-08 | `tasks/_archive/2026-08/TZ-UX-312.done.md` |
| TZ-CATALOG-DEDUP-301 | Strip composition from Product FullEditor | 2026-08-08 | `tasks/_archive/2026-08/TZ-CATALOG-DEDUP-301.done.md` |
| TZ-UX-311 | Composition tree thumb + name wrap | 2026-08-08 | `tasks/_archive/2026-08/TZ-UX-311.done.md` |
| TZ-UX-308 | Nav «Справ.» yellow active on /categories | 2026-08-08 | `tasks/_archive/2026-08/TZ-UX-308-nav-reference-active-highlight.done.md` |

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
| ~~TZ-81~~ | ~~README + docs (Russian editorial)~~ | DONE 2026-07-05 | TZ-30..79 |
| ~~TZ-82~~ | ~~Browser-use smoke test~~ | pending | TZ-67 + TZ-69..74 • TZ-79 |
| ~~TZ-90~~ | ~~Диалоговая система (Phase A+B shipped; Phase C/D/E deferred)~~ | DONE — Phase A+B archived 2026-07-12 | — |
| **TZ-266** | Generated-document organization scope before HTML/read/write side effects (imported workspace task, renumbered from TZ-261) | `tasks/_archive/2026-08/TZ-266.done.md` | DONE 2026-08-02 |
| **TZ-267** | Templates registry error state and SilentResult HTTP boundary (imported workspace task, renumbered from TZ-262) | `tasks/_archive/2026-08/TZ-267.done.md` | DONE 2026-08-02 |
| **TZ-MATERIALS-301** | Материалы — широкий структурированный диалог (imported workspace task) | `tasks/_archive/2026-08/TZ-MATERIALS-301.done.md` | DONE 2026-08-02 |
| **TZ-MATERIALS-302** | Материалы — единицы из API и поставщики (imported workspace task) | `tasks/_archive/2026-08/TZ-MATERIALS-302.done.md` | DONE 2026-08-02 |
| **TZ-MATERIALS-303** | Материалы — понятный код и идентификация (imported workspace task; successor TZ-307 Layer 4) | `tasks/_archive/2026-08/TZ-MATERIALS-303.done.md` | DONE 2026-08-02 |
| **TZ-MATERIALS-304** | Материалы — остатки отделены от карточки (imported workspace task; successor TZ-308 Layer 4) | `tasks/_archive/2026-08/TZ-MATERIALS-304.done.md` | DONE 2026-08-02 |
| **TZ-MATERIALS-305** | Материалы — габариты и неизменяемость (imported workspace task; successor TZ-309 Layer 4) | `tasks/_archive/2026-08/TZ-MATERIALS-305.done.md` | DONE 2026-08-02 |
| **TZ-MATERIALS-306** | Материалы — фото и надёжное сохранение (imported workspace task) | `tasks/_archive/2026-08/TZ-MATERIALS-306.done.md` | DONE 2026-08-02 |
| **TZ-DOC-307** | Категории шаблонов — доменный контракт | `backend/src/modules/document-template/*; backend/src/modules/category/*; docs/data-model.md` | — |
| **TZ-DOC-308** | Категории шаблонов — справочник и форма | `frontend/src/app/pages/doc-constructor/*; frontend/src/app/pages/dictionaries/*` | TZ-DOC-307 |

> **Observability chain:** TZ-110 — pure backend (Layer 4), параллельно OK с TZ-111 (Layer 3 frontend) и TZ-112 (Layer 3 dialog). TZ-113 ДОЛЖЕН идти после TZ-111 (тот же page, race fix). TZ-114 ДОЛЖЕН идти после TZ-110. **TZ-115..118 — cross-page batch**: storage-items + stock-movements shared между TZ-115 & TZ-116 → SERIAL; PiErrorBanner в TZ-118 конфликтует с TZ-105.3 → coord decision. **TZ-115 → TZ-117 → TZ-118** sequencing enforced. **TZ-119** — параллельно OK с TZ-115..118 (different layer).

> **Builder batch TZ-DOC-268..273 (2026-08-02) ✅ DONE** — 6 задач конструктора документов: автозакрытие диалога создания (268), строгая рамка + opt-in сетка (269), удержание изображения внутри рамки (270), порядок слоёв (271), marquee + editor-only группы (272), фон/прозрачность блоков (273). Верификация: FE jest 699/699, BE jest 320/320, tsc FE+BE 0, ng build 0, git diff --check 0, verify-status PASS, ревью PASS. Плюс successors: **TZ-ADMIN-275 ✅** (hex-fallback убраны из role-form) и **TZ-279 ✅** (дубль build-команды устранён; заказан как TZ-276, но номер TZ-276 занят файлом другой сессии `tasks/TZ-276-builder-template-dialog-autoclose.md` — тема автозакрытия уже реализована в TZ-DOC-268; переименован в TZ-279 по правилу «не создавай дубликаты номеров»). **TZ-DOC-274** (browser acceptance) — DEFERRED: браузерная среда недоступна, MANUAL_BROWSER_CHECK_REQUIRED.

> **QA-аудит 2026-08-02 (TZ-261..267; imported workspace tasks renumbered as TZ-266/TZ-267 to avoid canonical ID collisions)** — найдено P0: frontend не компилируется (`as`-касты в template 3 admin-диалогов, NG5002/TS2339/TS2531). **TZ-261 ✅ DONE 2026-08-02** (archive: `tasks/_archive/2026-08/TZ-261.done.md`; lock: `.mimocode/locks/TZ-261-admin-dialogs-template-as-casts.lock`) — 11 кастов заменены на методы-обработчики, ng build 0 errors, tsc 0, jest 5/5. **TZ-262 ✅ DONE 2026-08-02** (archive: `tasks/_archive/2026-08/TZ-262.done.md`; lock: `.mimocode/locks/TZ-262-admin-gates-capability-alignment.lock`) — `/admin/users` route+nav гейт выровнен с backend (`user:read` → `user:admin`), `/admin/roles` остаётся `role:read`; unit-тест доказывает: manager с `user:read` без `user:admin` → `/forbidden`. **TZ-263 ✅ DONE 2026-08-02** (archive: `tasks/_archive/2026-08/TZ-263.done.md`; lock: `.mimocode/locks/TZ-263-verifier-ng-build-in-checks.lock`) — в run-project-checks добавлен шаг `ng build --configuration=development` (tsc не компилирует templates); регрессия доказана (сломанный template → NG5002 exit 1, откат → exit 0); алиас `pnpm check:build`. **TZ-265 ✅ DONE 2026-08-02** (archive: `tasks/_archive/2026-08/TZ-265.done.md`; lock: `.mimocode/locks/TZ-265-admin-paper-ink-compliance.lock`) — Paper & Ink комплаенс 5 admin-файлов: `text-red-600` → `text-destructive`, hex-фолбэки убраны из `var()` в 3 диалогах; grep 0×red-600, 0×hex; ng build 0 errors; jest admin 5/5. **TZ-264 ✅ DONE 2026-08-02** (archive: `tasks/_archive/2026-08/TZ-264.done.md`; lock: `.mimocode/locks/TZ-264-admin-dialogs-unit-tests.lock`) — 3 аддитивных spec-файла для admin-диалогов; каждый smoke-тест инстанцирует диалог через TestBed (NG5xxx-гард); покрыты canSubmit, mismatch-пароли, loadCatalog, toggleKey/toggleSection; jest admin 23/23. **Все активные TZ в tasks/ закрыты (263→265→264).**

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


> **REMOVED FROM ⏳ READY (2026-08-01)**: TZ-80, TZ-110, TZ-111, TZ-112, TZ-113, TZ-114, TZ-115, TZ-116, TZ-117, TZ-118, TZ-119, TZ-120, TZ-121, TZ-122, TZ-123, TZ-124, TZ-125, TZ-126, TZ-127. Archive presence (.done.txt / .failed.txt) supersedes READY list —
> см. ✅ DONE и ❌ FAILED sections above.

## 📋 DRAFT / ROADMAP (multi-tenant — TZ-238..241, 2026-07-31, audit-driven)

> **Статус:** DRAFT-кандидаты. **НЕ готовы к выдаче агенту** — требуют ручной review от PO и архитектурного sign-off.
> **Контекст:** Audit 2026-07-31 показал, что multi-tenant data isolation сейчас NOT ENFORCED на уровне services — каждый из TZ-238..241 закрывает отдельный слой риска. Включать в roadmap ПОСЛЕ завершения активного batch TZ-110..127.
> **Sequencing (жёсткий):** TZ-238 (foundation) → TZ-239 (TX interceptor) → TZ-240 (ref data scoping) → TZ-241 (counterparty + isActive). Parallel execution НЕ допускается.

| № | Название | Layer | Conflict Keys (top-level) | Зависит от | Effort |
|---|----------|-------|---------------------------|------------|--------|
| TZ-238 | User.organizationId + JWT propagation (multi-tenant foundation) | 4 | `backend/src/modules/user/user.schema.ts; backend/src/modules/auth/auth.service.ts; backend/src/modules/auth/jwt.strategy.ts; backend/src/common/decorators/current-user.decorator.ts; backend/src/modules/user/dto/create-user.dto.ts; backend/src/database/migrations/2026-07-31-TZ-238-user-organizationId.ts (NEW); backend/src/common/seed/admin.seed.ts; frontend/src/app/core/auth.service.ts` | — | ~95 LOC + migration |
| TZ-239 | OrgScopeGuard — enforced multi-tenant TX filter (contract/order/document-template/generated-document/quotation/reconciliation-act/tender/reservation/shipment/order-closing/production-order) | 4 | `backend/src/common/decorators/require-org-scope.decorator.ts (NEW); backend/src/common/interceptors/org-scope.interceptor.ts (NEW); backend/src/common/interceptors/org-scope.interceptor.spec.ts (NEW); 10 controllers в backend/src/modules/{contract,order,document-template,generated-document,quotation,reconciliation-act,tender,reservation,shipment,order-closing,production-order}/` | TZ-238 | ~150 LOC |
| TZ-240 | Reference Data Scoping (Product, Material, Category per-Org) | 4 | `backend/src/modules/{product,material,category}/{product,material,category}.schema.ts + .service.ts + dto/*.dto.ts; backend/src/database/migrations/2026-07-31-TZ-240-refdata-scoped.ts (NEW); backend/src/database/migrations/2026-07-31-TZ-240-refdata-scoped.spec.ts (NEW)` | TZ-238 | ~180 LOC |
| TZ-241 | Counterparty Org-Scoping + JwtAuthGuard isActive + 30s user-activity cache | 4 | `backend/src/modules/counterparty/counterparty.schema.ts + counterparty.service.ts + dto/*.dto.ts; backend/src/common/guards/jwt-auth.guard.ts; backend/src/common/guards/user-activity-cache.ts (NEW); backend/src/common/guards/user-activity-cache.spec.ts (NEW); backend/src/database/migrations/2026-07-31-TZ-241-counterparty-orgid.ts (NEW); backend/src/modules/{user,role}/*.service.ts (cache invalidation wiring)` | TZ-238 | ~130 LOC |

**Suggested sequencing:** TZ-238 first (foundation prerequisite для остальных) → TZ-239 + TZ-240 + TZ-241 могут выполняться **параллельно** после TZ-238 ships (no shared CONFLICT KEYS → Layer 4 safe parallel per TZF-00 §ПРАВИЛА).

**Opt-out path:** если multi-tenant НЕ планируется в ближайший год — все 4 TZ cтановятся DEFERRED без архивации (можно в `tasks/_archive/<YYYY-MM>/TZ-NN.deferred.txt`).

**Reserved numbers (out of this batch):** **TZ-242** (Frontend per-role Guards + nav UI hiding) — отдельная дорожная карта, не входит.

---

### Canonical security/RBAC batch — TZ-247..258 (Wave 1-9, materialized 2026-07-31, senior-orchestrator)

> **Преambula:** «BACKEND AUTHORIZATION = SECURITY. FRONTEND VISIBILITY = UX.» (per user). Multi-tenancy / ABAC / SSO / LDAP NOT in scope this round.

> **Premise:** «BACKEND AUTHORIZATION = SECURITY. FRONTEND VISIBILITY = UX.» (per user). Multi-tenancy / ABAC / SSO / LDAP NOT in scope this round.
> **Scheduler:**
> Wave 1 → TZ-248 · Wave 2 → TZ-249 · Wave 3 → TZ-{250 ‖ 254} parallel (no shared files) · Wave 4 → TZ-252 → TZ-253 sequential (main.ts overlap addressed via pre-split regions in each TZ's CONFLICT KEYS) · Wave 5 → TZ-{247 ‖ 251} parallel · Wave 6 → TZ-255 · Wave 7 → TZ-256 · Wave 8 → TZ-258 · Wave 9 → TZ-257.
> **Cross-batch note:** TZ-238..241 (multi-tenant DRAFT) lives in the next section. NOT duplicates of TZ-247..258 — different scope (4096 TZ-247..258 = intra-tenant RBAC + admin module; TZ-238..241 = organizationId-scoped enforcement, separate roadmap).

| № | Название | Layer | Conflict Keys (top-level) | Зависит от |
|---|----------|-------|---------------------------|------------|
| TZ-247 | Backend idempotency middleware | 4 | `backend/src/main.ts; backend/src/common/idempotency/{idempotency.middleware.ts, idempotency-storage.service.ts, idempotency-storage.schema.ts}` | TZ-249 |
| TZ-248 | Production secrets + credential hygiene → ✅ DONE 2026-07-31 (archive: tasks/_archive/2026-07/TZ-248.md.done) | 4 | `backend/src/config/secret-validation.service.ts (NEW); backend/.env.example; backend/src/main.ts; docs/SECURITY-OPERATIONS.md (NEW)` | — |
| TZ-249 | Auth entry + anti-automation → ✅ DONE 2026-07-31 (archive: tasks/_archive/2026-07/TZ-249.md.done) | 4 | `backend/src/modules/auth/{auth.controller.ts, auth.service.ts}; backend/src/common/guards/throttler-behind-auth.guard.ts; backend/src/main.ts; backend/src/common/login-softlock/login-softlock.service.ts (NEW); docs/SECURITY-OPERATIONS.md` | TZ-248 recommended |
| TZ-250 | Secure file uploads | 4 | `backend/src/modules/*/upload controllers; backend/src/main.ts (MulterModule); backend/src/static/{static.controller.ts, file-validation.service.ts (NEW), sanitize-svg.ts (NEW)}` | TZ-249 |
| TZ-251 | Object-level authorization / IDOR ✅ DONE 2026-07-31 | 4 | `backend/src/common/guards/ownership/{ownership.guard.ts (NEW), ownership.decorator.ts (NEW), ownership.guard.spec.ts (NEW)}; backend/src/common/contracts/rbac-contract.ts (added AuthenticatedUserLike + read by ownership.guard); backend/src/modules/document-template/{document-template.schema.ts (+createdBy opt/indexed), document-template.module.ts (+OwnershipGuard provider), document-template.controller.ts (@OwnerOnly + @UseGuards class-level + @Req pass-down), document-template.service.ts (create/duplicate accept userId)}` + **TZ-251.A DEFERRED** (e2e Mongo harness required) | TZ-254 |
| TZ-251.A | Object-level authorization E2E matrix — DEFERRED (Mongo harness unavailable) | 4 | `backend/test/object-authz.e2e-spec.ts (NEW, gated on harness); backend/test/object-authz.e2e-fixtures.ts (NEW helper)` | TZ-251 |
| TZ-252 | Auth token storage + refresh contract | 4+3 | `backend/src/modules/auth/{auth.controller.ts, auth.service.ts}; backend/src/main.ts (own region: cookie-parser + CORS; sequential after TZ-253 SUNSET); frontend/src/app/core/{auth.service.ts, auth.interceptor.ts}` | TZ-249 |
| TZ-253 | Dependency + deployment checks | 4 | `backend/package.json; frontend/package.json; backend/.github/dependabot.yml (NEW); scripts/nightly-dep-check.sh (NEW); docs/runbook/operational-checklist.md (NEW); docker-compose.yml; backend/src/main.ts (own region: trust-proxy + HTTPS + body-size; sequential: TZ-252 → TZ-253)` | TZ-248 recommended |
| TZ-254 | RBAC contract → ✅ DONE 2026-07-31 (archive: tasks/_archive/2026-07/TZ-254.md.done) | 4 | `backend/src/common/contracts/{rbac-contract.ts, permissions-catalog.ts} (NEW); docs/RBAC-CONTRACT.md (NEW); ARCHITECTURE.md (light update)` | — |
| TZ-255 | Server-side permissions enforcement ✅ DONE 2026-07-31 | 4 | `backend/src/common/{decorators/permissions.decorator.ts (NEW), guards/permissions.guard.ts (NEW), guards/permissions.guard.spec.ts (NEW), middleware/permissions-boot-validator.ts (NEW), middleware/permissions-boot-validator.module.ts (NEW), middleware/permissions-boot-validator.spec.ts (NEW)}; backend/src/app.module.ts (+ APP_GUARD PermissionsGuard between JwtAuthGuard and RolesGuard); archive: tasks/_archive/2026-07/TZ-255.md.done. e2e scheduled as TZ-255.A (DEFERRED, Mongo harness unavailable). **Deliberate design decision (TZ-255 OR semantics):** decorator args `Permissions('user:read','role:read')` are OR alternatives (any-of) per TZ-256 frontend flexibility rationale; routes that need AND semantics must stack decorators. Deviation from TZ-255 §ШАГ 5 test text 'missing 1 of N → 403' is intentional; rationale + STATUS entry documented to prevent silent flip in a future TZ.` | TZ-251, TZ-254 |
| TZ-255.A | PermissionsGuard E2E + boot validator container test + semver polish — DEFERRED | 4 | `backend/test/permissions-full.e2e-spec.ts (NEW, gated on Mongo harness); backend/src/common/middleware/permissions-boot-validator.spec.ts (extend with Nest TestingModule); backend/src/common/decorators/permissions.decorator.ts (dunder rename)` | TZ-255 |
| TZ-256 | Capability-aware routes + navigation ✅ DONE 2026-07-31 (frontend typecheck PASS; TZ-256.A DEFERRED for jest TestBed scaffold + UX polish + /admin/* route registration + SKIP_FORBIDDEN_REDIRECT blast-radius survey — **PRODUCTION-SHIP-FIX C1 applied 2026-07-31: SKIP_FORBIDDEN_REDIRECT default flipped `false→true` for migration-safe opt-IN redirect pattern, docstring updated; existing conditional `!req.context.get(...)` semantics unchanged so callers get inline error/toast by default and MUST explicitly set `SKIP_FORBIDDEN_REDIRECT: false` to opt into the bounce**) | 3 | `frontend/src/app/core/capabilities/{capabilities.service.ts (NEW), capability-route.guard.ts (NEW), capabilities.metadata.ts (NEW)}; frontend/src/app/app.routes.ts (+ /forbidden route + /admin/* data.metadata DEFERRED to TZ-256.A); frontend/src/app/shared/ui/forbidden/{forbidden.page.ts (NEW)}; /kit/* exempted (TZ-92b); frontend/src/app/layout/app-layout.component.ts (admin nav category + computed navCategories filter); frontend/src/app/core/auth.interceptor.ts (+ SKIP_FORBIDDEN_REDIRECT HttpContextToken + 403 → /forbidden redirect with C1 ship-fix default flip). Jest specs added but TestBed scaffold incomplete — deferred to TZ-256.A.` | TZ-255, TZ-252 |
| TZ-256.A | TZ-256 close-out follow-ups — DEFERRED | 3 | `frontend/src/app/core/capabilities/{3 specs} (TestBed scaffold rewrite); frontend/src/app/layout/app-layout.component.ts (Palette → ShieldCheck); frontend/src/app/app.routes.ts (+ /admin/* placeholder routes); frontend/src/app/core/auth.interceptor.ts (SKIP_FORBIDDEN_REDIRECT default flip + caller survey); frontend/src/app/pages/admin/_admin-placeholder.page.ts (NEW stub)` | TZ-256 |
| TZ-257 | Admin module ✅ DONE 2026-07-31 (read-only slice; mutations deferred to TZ-257.A) | 3+4 | `backend/src/modules/admin/{admin.module.ts (NEW), users-admin.controller.ts (NEW), roles-admin.controller.ts (NEW), dto/mapper.ts (NEW)} (NEW); backend/src/common/guards/last-admin.guard.ts (NEW) + spec; backend/src/app.module.ts (+ AdminModule); frontend/src/app/pages/admin/{users-admin.page.ts (NEW), roles-admin.page.ts (NEW)}; frontend/src/app/app.routes.ts (+ /admin/users + /admin/roles with capability gates); archive: tasks/_archive/2026-07/TZ-257.md.done. **Deliberate TZ-257 spec divergence:** LastAdminGuard throws `ForbiddenException (403)` with `code: 'LAST_ADMIN_INVARIANT'`, NOT 409 ConflictException as the original spec text says. Rationale: capability-style rejection ("you may not perform this action") matches 403 better than 409 ("operation state forbids").` | TZ-258 |
| TZ-258 | Protected-page onboarding contract ✅ DONE 2026-07-31 (audit script spec relocation deferred to TZ-258.A) | 1 | docs/protected-page-contract.md (NEW, 10-section runbook); backend/scripts/audit-policy-metadata.ts (NEW, static-scan CLI script); backend/scripts-fields-helpers/LEGACY_RBAC_EXCEPTIONS.json (NEW, 9 entries); docs/RBAC-CONTRACT.md and ARCHITECTURE.md cross-link updates. Archive: tasks/_archive/2026-07/TZ-258.md.done. Spec file at backend/scripts/audit-policy-metadata.spec.ts not under jest's src-only regexscope; relocation deferred to TZ-258.A. | TZ-256 |

---

## ✅ DONE (завершены, перенесены в `_archive/YYYY-MM/`)

Auto-generated forward-link table below lists every `.done.txt`
archive marker — single source of forward-link reconciliation.

<!-- BULK-DONE 2026-08-01 (auto-reconciled v5) -->
<!-- Convention: rows use `(archived · см. файл архива)` for historical-flavor entries.
     TZ-79, TZ-80, TZ-82 keep descriptive titles because they carry
     forward-looking semantics. Per-TZ rationale registry:
     `OrchestratorKit/_meta/done-titles.yaml`. Inline "→ [см. архив]()"
     anchors on those three rows open the archive file directly; the
     `next_steps:` field there carries the recurring-semantics marker. -->

| № | Дата | Название | Файл архива |
|---|------|----------|-------------|
| TZ-02 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-02.done.txt` |
| TZ-03 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-03.done.txt` |
| TZ-04 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-04.done.txt` |
| TZ-05 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-05.done.txt` |
| TZ-06 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-06.done.txt` |
| TZ-07 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-07.done.txt` |
| TZ-08 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-08.done.txt` |
| TZ-09 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-09.done.txt` |
| TZ-10 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-10.done.txt` |
| TZ-11 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-11.done.txt` |
| TZ-30 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-30.done.txt` |
| TZ-31 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-31.done.txt` |
| TZ-32 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-32.done.txt` |
| TZ-33 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-33.done.txt` |
| TZ-34 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-34.done.txt` |
| TZ-35 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-35.done.txt` |
| TZ-36 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-36.done.txt` |
| TZ-37 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-37.done.txt` |
| TZ-38 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-38.done.txt` |
| TZ-39 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-39.done.txt` |
| TZ-40 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-40.done.txt` |
| TZ-41 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-41.done.txt` |
| TZ-42 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-42.done.txt` |
| TZ-43 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-43.done.txt` |
| TZ-44 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-44.done.txt` |
| TZ-45 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-45.done.txt` |
| TZ-46 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-46.done.txt` |
| TZ-47 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-47.done.txt` |
| TZ-48 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-48.done.txt` |
| TZ-49 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-49.done.txt` |
| TZ-50 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-50.done.txt` |
| TZ-51 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-51.done.txt` |
| TZ-52 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-52.done.txt` |
| TZ-53 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-53.done.txt` |
| TZ-54 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-54.done.txt` |
| TZ-55 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-55.done.txt` |
| TZ-56 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-56.done.txt` |
| TZ-57 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-57.done.txt` |
| TZ-58 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-58.done.txt` |
| TZ-59 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-59.done.txt` |
| TZ-60 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-60.done.txt` |
| TZ-61 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-61.done.txt` |
| TZ-62 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-62.done.txt` |
| TZ-63 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-63.done.txt` |
| TZ-64 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-64.done.txt` |
| TZ-65 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-65.done.txt` |
| TZ-66 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-66.done.txt` |
| TZ-67 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-67.done.txt` |
| TZ-68 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-68.done.txt` |
| TZ-69 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-69.done.txt` |
| TZ-70 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-70.done.txt` |
| TZ-71 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-71.done.txt` |
| TZ-72 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-72.done.txt` |
| TZ-73 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-73.done.txt` |
| TZ-74 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-74.done.txt` |
| TZ-75 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-75.done.txt` |
| TZ-76 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-76.done.txt` |
| TZ-77 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-77.done.txt` |
| TZ-78 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-78.done.txt` |
| TZ-79 | 2026-07-01 | TZ-79 — axe-core a11y audit · DONE → [см. архив](OrchestratorKit/_archive/2026-07/TZ-79.done.txt) | `OrchestratorKit/_archive/2026-07/TZ-79.done.txt` |
| TZ-80 | 2026-07-01 | TZ-80 — SSR / Hydration · REJECTED → [см. архив](OrchestratorKit/_archive/2026-07/TZ-80.done.txt) | `OrchestratorKit/_archive/2026-07/TZ-80.done.txt` |
| TZ-81 | 2026-07-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-07/TZ-81.done.txt` |
| TZ-82 | 2026-07-01 | TZ-82 — Browser-use smoke test · PENDING (INDEPENDENT) → [см. архив](OrchestratorKit/_archive/2026-07/TZ-82.done.txt) | `OrchestratorKit/_archive/2026-07/TZ-82.done.txt` |
| TZ-110 | 2026-08-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-08/TZ-110.done.txt` |
| TZ-119 | 2026-08-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-08/TZ-119.done.txt` |
| TZ-120 | 2026-08-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-08/TZ-120.done.txt` |
| TZ-121 | 2026-08-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-08/TZ-121.done.txt` |
| TZ-122 | 2026-08-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-08/TZ-122.done.txt` |
| TZ-123 | 2026-08-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-08/TZ-123.done.txt` |
| TZ-124 | 2026-08-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-08/TZ-124.done.txt` |
| TZ-125 | 2026-08-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-08/TZ-125.done.txt` |
| TZ-126 | 2026-08-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-08/TZ-126.done.txt` |

---

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

<!-- BULK-FAILED 2026-08-01 (auto-reconciled v5) -->

| № | Дата | Название | Файл архива |
|---|------|----------|-------------|
| TZ-119.1 | 2026-08-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-08/TZ-119.1.failed.txt` |
| TZ-127 | 2026-08-01 | (archived · см. файл архива) | `OrchestratorKit/_archive/2026-08/TZ-127.failed.txt` |

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
