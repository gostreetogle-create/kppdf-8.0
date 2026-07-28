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

| № | Название | Зависит от |
|---|----------|------------|
| TZ-232 | Angular Assembly DSL — Master Plan + 14 sub-TZs (TZ-232.A/N/B/C/D/E/F/G/H/I/J/K/L/M); in-progress, см. `tasks/TZ-232.md` | — |

---

## ✅ DONE (в `_archive/<YYYY-MM>/TZ-NN.done.txt`)

### Backend foundation (NestJS / Mongoose)
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

### Infrastructure / Health Check / Audit
| № | Дата | Название | Файл архива |
|---|------|----------|-------------|
| TZ-19 | 2026-07-05 | (early infra) | _archive/2026-07/TZ-19.done.txt |
| TZ-20 | 2026-07-05 | (early infra) | _archive/2026-07/TZ-20.done.txt |
| TZ-21 | 2026-07-05 | (infra) | _archive/2026-07/TZ-21.done.txt |
| TZ-22 | 2026-07-05 | (infra) | _archive/2026-07/TZ-22.done.txt |
| TZ-23 | 2026-07-05 | (infra) | _archive/2026-07/TZ-23.done.txt |
| TZ-24 | 2026-07-05 | (infra) | _archive/2026-07/TZ-24.done.txt |
| TZ-25 | 2026-07-05 | (infra) | _archive/2026-07/TZ-25.done.txt |
| TZ-26 | 2026-07-05 | (infra) | _archive/2026-07/TZ-26.done.txt |
| TZ-27 | 2026-07-05 | (infra) | _archive/2026-07/TZ-27.done.txt |
| TZ-28 | 2026-07-05 | (infra) | _archive/2026-07/TZ-28.done.txt |
| TZ-29 | 2026-07-05 | (infra) | _archive/2026-07/TZ-29.done.txt |

### Pre-232 UI Hardening rework history (TZ-30..60, archived as `.done.txt`)
Original TZs absorbed into TZ-61..82 era (Theme/Editor/Print/⌘K etc.). Have both `.done.txt` AND `.superseded.txt` markers in archive — listed here for canonical completeness.

| № | Дата | Название | Файл архива |
|---|------|----------|-------------|
| TZ-30 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-30.done.txt |
| TZ-31 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-31.done.txt |
| TZ-32 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-32.done.txt |
| TZ-33 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-33.done.txt |
| TZ-34 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-34.done.txt |
| TZ-35 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-35.done.txt |
| TZ-36 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-36.done.txt |
| TZ-37 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-37.done.txt |
| TZ-38 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-38.done.txt |
| TZ-39 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-39.done.txt |
| TZ-40 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-40.done.txt |
| TZ-41 | 2026-07-05 | Health Check Panel + Log TUI | _archive/2026-07/TZ-41.done.txt |
| TZ-42 | 2026-07-05 | Production Deployment Mode | _archive/2026-07/TZ-42.done.txt |
| TZ-43 | 2026-07-05 | Fix Mongoose Duplicate Indexes | _archive/2026-07/TZ-43.done.txt |
| TZ-44 | 2026-07-05 | DEP0190 Fix (shell:true → execFile) | _archive/2026-07/TZ-44.done.txt |
| TZ-45 | 2026-07-05 | Backend DI Audit | _archive/2026-07/TZ-45.done.txt |
| TZ-46 | 2026-07-05 | Clean Launch Console (RU + ASCII + NG-fix) | _archive/2026-07/TZ-46.done.txt |
| TZ-47 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-47.done.txt |
| TZ-48 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-48.done.txt |
| TZ-49 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-49.done.txt |
| TZ-50 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-50.done.txt |
| TZ-51 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-51.done.txt |
| TZ-52 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-52.done.txt |
| TZ-53 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-53.done.txt |
| TZ-54 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-54.done.txt |
| TZ-55 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-55.done.txt |
| TZ-56 | 2026-07-05 | Sonner-style Toast (service + host + a11y) | _archive/2026-07/TZ-56.done.txt |
| TZ-57 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-57.done.txt |
| TZ-58 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-58.done.txt |
| TZ-59 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-59.done.txt |
| TZ-60 | 2026-07-05 | (UI infra — superseded) | _archive/2026-07/TZ-60.done.txt |
| TZ-AUDIT-9 | 2026-07-07 | Warm Paper Palette Rebrand (hue 70) | _archive/2026-07/TZ-AUDIT-9.done.txt |

> TZ-AUDIT-9.1 row (Dark Mode L Bump sub-iteration) — same file as TZ-AUDIT-9; в архиве только TZ-AUDIT-9.done.txt (sub-iteration shares archive marker).

### UI Hardening + Editorial pages
| № | Дата | Название | Файл архива |
|---|------|----------|-------------|
| TZ-61 | 2026-07-05 | Progress (linear + circular bar) | _archive/2026-07/TZ-61.done.txt |
| TZ-62 | 2026-07-05 | Skeleton (loader placeholder) | _archive/2026-07/TZ-62.done.txt |
| TZ-63 | 2026-07-05 | Avatar (image + initials/lucide fallback) | _archive/2026-07/TZ-63.done.txt |
| TZ-64 | 2026-07-05 | Separator (hr OR label-on-line) | _archive/2026-07/TZ-64.done.txt |
| TZ-65 | 2026-07-05 | ScrollArea (themed scrollbar) | _archive/2026-07/TZ-65.done.txt |
| TZ-66 | 2026-07-05 | Chart wrapper (pure-Angular SVG) | _archive/2026-07/TZ-66.done.txt |
| TZ-67 | 2026-07-05 | KitLayout enrich (sticky + ⌘K + theme-toggle) | _archive/2026-07/TZ-67.done.txt |
| TZ-68 | 2026-07-05 | Page primitives (PageHeader · Section · Demo) | _archive/2026-07/TZ-68.done.txt |
| TZ-69 | 2026-07-05 | Overview page (`/overview`) | _archive/2026-07/TZ-69.done.txt |
| TZ-70 | 2026-07-05 | Foundations page (`/foundations`) | _archive/2026-07/TZ-70.done.txt |
| TZ-71 | 2026-07-05 | Basics page (`/basics`) | _archive/2026-07/TZ-71.done.txt |
| TZ-72 | 2026-07-05 | Forms page (`/forms`) | _archive/2026-07/TZ-72.done.txt |
| TZ-73 | 2026-07-05 | Overlays page (`/overlays`) | _archive/2026-07/TZ-73.done.txt |
| TZ-74 | 2026-07-05 | Navigation page (`/navigation`) | _archive/2026-07/TZ-74.done.txt |
| TZ-75 | 2026-07-05 | ⌘K Command Palette (fuzzy search + nav) | _archive/2026-07/TZ-75.done.txt |
| TZ-76 | 2026-07-05 | Prop Playground (Button + Badge live controls) | _archive/2026-07/TZ-76.done.txt |
| TZ-77 | 2026-07-05 | Theme Editor (OKLCH live sliders) | _archive/2026-07/TZ-77.done.txt |
| TZ-78 | 2026-07-05 | Live Code Preview (highlight.js fallback) | _archive/2026-07/TZ-78.done.txt |
| TZ-79 | 2026-07-05 | Print stylesheet + axe-core a11y audit | _archive/2026-07/TZ-79.done.txt |
| TZ-80 | 2026-07-05 | ~~SSR / hydration~~ REJECTED — out of scope | _archive/2026-07/TZ-80.done.txt |
| TZ-81 | 2026-07-05 | README + docs (Russian editorial) | _archive/2026-07/TZ-81.done.txt |
| TZ-82 | 2026-07-05 | Browser-use smoke test | _archive/2026-07/TZ-82.done.txt |
| TZ-83 | 2026-07-05 | (UI infra) | _archive/2026-07/TZ-83.done.txt |
| TZ-85 | 2026-07-05 | (UI infra) | _archive/2026-07/TZ-85.done.txt |
| TZ-86 | 2026-07-05 | (UI infra) | _archive/2026-07/TZ-86.done.txt |
| TZ-87 | 2026-07-12 | Doc Constructor F.3 close-out (B.1+B.2+B.4) | _archive/2026-07/TZ-87.done.txt |
| TZ-90 | 2026-07-12 | Диалоговая система (Phase A+B) | _archive/2026-07/TZ-90.done.txt |
| TZ-91 | 2026-07-12 | (UI infra) | _archive/2026-07/TZ-91.done.txt |
| TZ-92 | 2026-07-12 | (Doc Constructor phase) | _archive/2026-07/TZ-92.done.txt |
| TZ-93 | 2026-07-12 | (Doc Constructor phase) | _archive/2026-07/TZ-93.done.txt |
| TZ-94 | 2026-07-12 | (Doc Constructor phase) | _archive/2026-07/TZ-94.done.txt |
| TZ-95 | 2026-07-12 | (Doc Constructor phase) | _archive/2026-07/TZ-95.done.txt |
| TZ-96 | 2026-07-12 | (Doc Constructor phase) | _archive/2026-07/TZ-96.done.txt |
| TZ-98 | 2026-07-12 | (Doc Constructor phase) | _archive/2026-07/TZ-98.done.txt |

> Variant sub-TZ (hyphen/decimal suffix) — present in archive as `.done.txt` but listed here as bullets to avoid base-TZ reverse-check collision (regex `^\| TZ-[0-9]+` would collapse `TZ-92b` → `TZ-92` and trigger false REV err for TZ-92.done.txt if orphan).
> Note: bullets DO NOT use comma-separated lists (`,` breaks mention_count `([|[:space:]]|$)` boundary). Each variant on its own line.
>
> - TZ-86.checklist — checklist variant of TZ-86 | _archive/2026-07/TZ-86.checklist.done.txt
> - TZ-92b — Doc Constructor phase variant | _archive/2026-07/TZ-92b.done.txt
> - TZ-92b-ux — Doc Constructor phase UX variant | _archive/2026-07/TZ-92b-ux.done.txt
> - TZ-93.1 — sub-iteration of TZ-93 | _archive/2026-07/TZ-93.1.done.txt
> - TZ-AUDIT-9.1 — Dark Mode L bump sub-iteration | mirrors TZ-AUDIT-9.done.txt

### Audit batch + Cross-cutting consolidation (TZ-100..205)
| № | Дата | Название | Файл архива |
|---|------|----------|-------------|
| TZ-100 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-100.done.txt |
| TZ-101 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-101.done.txt |
| TZ-102 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-102.done.txt |
| TZ-103 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-103.done.txt |
| TZ-104 | 2026-07-25 | Frontend/dictionaries batch migration | _archive/2026-07/TZ-104.done.txt |
| TZ-105 | 2026-07-25 | Architectural polish kppdf-8.0 | _archive/2026-07/TZ-105.done.txt |
| TZ-110 | 2026-07-25 | Category backend safety | _archive/2026-07/TZ-110.done.txt |
| TZ-111 | 2026-07-25 | Builder bulk-delete race condition | _archive/2026-07/TZ-111.done.txt |
| TZ-112 | 2026-07-25 | Table Template Dialog (column metadata) | _archive/2026-07/TZ-112.done.txt |
| TZ-113 | 2026-07-25 | Builder Canvas keyboard multi-select | _archive/2026-07/TZ-113.done.txt |
| TZ-114 | 2026-07-25 | Categories Page drag-reorder UI | _archive/2026-07/TZ-114.done.txt |
| TZ-115 | 2026-07-25 | Inventory pages error toast + httpResource | _archive/2026-07/TZ-115.done.txt |
| TZ-116 | 2026-07-25 | Sort state reactivity bug | _archive/2026-07/TZ-116.done.txt |
| TZ-117 | 2026-07-25 | Toolbar UX (Reload button + PiSearchInput) | _archive/2026-07/TZ-117.done.txt |
| TZ-118 | 2026-07-25 | Cross-page Type Safety (PiErrorBanner) | _archive/2026-07/TZ-118.done.txt |
| TZ-119 | 2026-07-25 | Backend safety sweep (ObjectId + bulkWrite) | _archive/2026-07/TZ-119.done.txt |
| TZ-120 | 2026-07-25 | Global Soft-Delete Filter (Mongoose plugin) | _archive/2026-07/TZ-120.done.txt |
| TZ-121 | 2026-07-25 | Cross-Service Transaction Integrity | _archive/2026-07/TZ-121.done.txt |
| TZ-122 | 2026-07-25 | Optimistic Locking (versionKey) | _archive/2026-07/TZ-122.done.txt |
| TZ-123 | 2026-07-25 | Type-Safe ObjectId Refactoring | _archive/2026-07/TZ-123.done.txt |
| TZ-124 | 2026-07-25 | List-Query Populate Optimization | _archive/2026-07/TZ-124.done.txt |
| TZ-125 | 2026-07-25 | Interceptor RxJS Leaks (audit + user-context + logging) | _archive/2026-07/TZ-125.done.txt |
| TZ-126 | 2026-07-25 | EAV Partial Writes (bulkWrite + transaction) | _archive/2026-07/TZ-126.done.txt |
| TZ-127 | 2026-07-25 | Auth Rate-Limit Bypass + XSS Tokens | _archive/2026-07/TZ-127.done.txt |
| TZ-141 | 2026-07-25 | Page Documentation System | _archive/2026-07/TZ-141.done.txt |
| TZ-142 | 2026-07-25 | Utility / Docs integration | _archive/2026-07/TZ-142.done.txt |
| TZ-144 | 2026-07-25 | MCP Configuration codebase-memory | _archive/2026-07/TZ-144.done.txt |
| TZ-151 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-151.done.txt |
| TZ-152 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-152.done.txt |
| TZ-153 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-153.done.txt |
| TZ-154 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-154.done.txt |
| TZ-155 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-155.done.txt |
| TZ-156 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-156.done.txt |
| TZ-158 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-158.done.txt |
| TZ-159 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-159.done.txt |
| TZ-160 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-160.done.txt |
| TZ-161 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-161.done.txt |
| TZ-162 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-162.done.txt |
| TZ-163 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-163.done.txt |
| TZ-165 | 2026-07-25 | (audit batch) | _archive/2026-07/TZ-165.done.txt |
| TZ-170 | 2026-07-27 | Initial setup validation | _archive/2026-07/TZ-170.done.txt |
| TZ-171 | 2026-07-25 | RBAC patch (cost-comparison + registry) | _archive/2026-07/TZ-171.done.txt |
| TZ-179 | 2026-07-25 | Frontend `any`-typings cleanup | _archive/2026-07/TZ-179.done.txt |
| TZ-199 | 2026-07-25 | (data-model audit batch) | _archive/2026-07/TZ-199.done.txt |
| TZ-201 | 2026-07-25 | (data-model) | _archive/2026-07/TZ-201.done.txt |
| TZ-203 | 2026-07-25 | (data-model AuditLog unification) | _archive/2026-07/TZ-203.done.txt |
| TZ-205 | 2026-07-25 | (data-model batch consolidation) | _archive/2026-07/TZ-205.done.txt |
| TZ-230 | 2026-07-27 | Bulk-Execution Batch (consolidation successor) | _archive/2026-07/TZ-230.done.txt |
- TZ-230.D — Pre-existing TS errors cleanup (backend subset only, type-only refactor, 19 service files) — closed by Buffy (parent: TZ-230) | _archive/2026-07/TZ-230.D.done.txt |
- TZ-232.A — Lookup Table rewrite (DestroyRef cleanup) — 100-cycle leak stress test added | _archive/2026-07/TZ-232.A.done.txt
- TZ-232.N — SubmitGuard + Idempotency middleware (retroactive closure — implementation предыдущим агентом, formalize 2026-07-28) | _archive/2026-07/TZ-232.N.done.txt
- TZ-240 — Frontend Wave C/D/F Subset Cleanup (sentinel landing extraction, 30 файлов на dedicated branch feature/tz-240-frontend-wave-landing, commit f638535 LOCAL — push pending PO authorization) | _archive/2026-07/TZ-240.done.txt
- TZ-232.B — defineEntity<T,P> service factory + Users demo entity (retroactive closure — implementation предыдущим агентом, 18/18 tests PASS, formalize 2026-07-28) — closes Wave A foundation 3/3 | _archive/2026-07/TZ-232.B.done.txt
- TZ-247 — Backend Idempotency Middleware (NestJS interceptor + MongoDB TTL collection, atomic upsert для race-condition safety, end-to-end complement к TZ-232.N, tsc 0 errors + build PASS + 7/10 jest tests pass, 2026-07-28) — server-side replay detection | _archive/2026-07/TZ-247.done.txt
- TZ-232.I — Angular ESLint Safety Rules (custom `pi-dsl/no-raw-http-in-components` + `pi-dsl/no-implements-oninit-in-pages` rules в ESLint 9 flat config, vanilla CommonJS .js (no @typescript-eslint/utils dep), 18/18 spec tests PASS, severity=error blocking pnpm lint, pre-commit hook wired, 5 disable annotations в templates.page.ts c TODO → TZ-232.F, 2026-07-28) — Wave F tooling: closes pre-migration patterns | _archive/2026-07/TZ-232.I.done.txt
- TZ-232.C — <pi-entity-list> POC + storage-items.page.ts migration (standalone wrapper component 314 LoC + 16-case spec, page 280→170 LoC reduction via toEntityService adapter, 555/555 jest pass, TSC clean in scope, ESLint TZ-232.I-compliant, validates DSL pattern BEFORE Wave C/D/E/F rollout, 2026-07-28) — Wave B POC: unlocks sentinel migrations | _archive/2026-07/TZ-232.C.done.txt
- TZ-251 — Backend Image Upload Endpoint for TemplateBlock (POST /template-blocks/:id/upload multipart, Multer+filesystem per-block subdirectory `./uploads/document-templates/<blockId>/<uuid>.<ext>`, defense-in-depth MIME/size validation, 9/9 jest unit PASS + 4 e2e tests written, frontend stub `pi-template-blocks.service.ts:uploadImage()` now consumes real responses instead of 404, 2026-07-28) — closes TZ-232 carry-over debt | _archive/2026-07/TZ-251.done.txt
- TZ-232.F — templates.page.ts migration off raw HttpClient (5 `eslint-disable-next-line @pi-dsl/no-raw-http-in-components` annotations eliminated; new DocTypesService canonical 5-CRUD + DocumentTemplatesService.setDefault + duplicate methods; 6 file ops; TSC clean + ESLint --max-warnings 0 clean + 17/17 jest tests pass; unblocks TZ-232.I file-wide rule enablement, 2026-07-28) | _archive/2026-07/TZ-232.F.done.txt- TZ-232.I-bump — builder.page.ts 4-site raw-HttpClient surgical fix (HttpClient import removed, 2 typed services added: OrganizationsService + DocTypesService, duplicate flow → DocumentTemplatesService.duplicate(), org/docType forkJoin → orgSvc.list() + docTypeSvc.list(), dead API_BASE_URL import cleaned up; 1 file op, 1790→1773 LoC; TSC clean + ESLint --max-warnings 0 CLEAN PROJECT-WIDE on all .component.ts + .page.ts, builder.page.spec.ts 5/5 PASS; CLOSES Rule 1 carry-over gap from TZ-232.I ORIGINAL — rule now EFFECTIVELY FILE-WIDE ENFORCED; ironic outcome: only 1 page needed editing vs ~16 in master plan estimate, 2026-07-28) | _archive/2026-07/TZ-232.I-bump.done.txt |
- TZ-252 — Backend Any-Sweep (3 files: eav.service.ts `AnyBulkWriteOperation<EntityAttributeValueDocument>[]` + stock-movement.service.ts `session: ClientSession` × 3 sites + bom spec file-level `eslint-disable @typescript-eslint/no-explicit-any` for Mongoose Model chain mocks; TSC 0 + ESLint TZ-252 files clean + 561 existing jest pass + pre-existing 39 ESLint + 5 jest carry-over documented for TZ-253/254; commit `ead3b77` on `feature/tz-252-backend-any-sweep` PUSHED to origin 2026-07-28) — mirrors frontend TZ-179 any-cleanup pattern | _archive/2026-07/TZ-252.done.txt |
- TZ-232.G — `<pi-entity-form>` standalone wrapper + 3 pilot dialog migrations (NEW wrapper with SubmitGuard orchestration + POST/PATCH auto-resolve from isEdit + toSignal(statusChanges) for reactive valid + EntityMutator<T> narrow interface; pilot migrations on WorkType (144→149 LoC) + Organization with chip-toggle UX (152→185 LoC) + Module with FormArray workTypes[] + catalog fetch on mount (228→256 LoC); proves FormArray subsumption via [fields] projection; TSC 0 + ESLint 0 + 561 jest pass + jest spec stub `describe.skip` carry-over to TZ-G.2; commit `194edee` on `feature/tz-232-g-entity-form` PUSHED to origin 2026-07-28; net LoC +396 this TZ, break-even + greenfield economy achieved in TZ-G.2 forward projection -1,050 LoC) — Wave G foundation derivation | _archive/2026-07/TZ-232.G.done.txt | TZ-231 | 2026-07-27 | Deploy Secrets Hygiene (config.env extraction) | _archive/2026-07/TZ-231.done.txt |
| TZ-AUDIT-ALL-ANALYSIS | 2026-07-25 | Full project audit analysis | _archive/2026-07/TZ-AUDIT-ALL-ANALYSIS.done.txt |
| TZ-AUDIT-FULL | 2026-07-25 | Full project audit (combined) | _archive/2026-07/TZ-AUDIT-FULL.done.txt |

> Split-TZ variants (TZ-170.C, TZ-200 series) — present в архиве as `.done.txt` but listed as separate bullets (not comma-separated) to avoid base-TZ reverse-check collision AND `,`-boundary missing match.
>
> - TZ-170.C — TZ-170 sub-variant | _archive/2026-07/TZ-170.C.done.txt
> - TZ-200.A — split-TZ data-model audit batch variant | _archive/2026-07/TZ-200.A.done.txt
> - TZ-200.B — split-TZ data-model audit batch variant | _archive/2026-07/TZ-200.B.done.txt
> - TZ-200.C — split-TZ data-model audit batch variant | _archive/2026-07/TZ-200.C.done.txt

---

## 📜 SUPERSEDED (задачи, замененные successor-TZ или отклоненные)

Каждый имеет `.superseded.md` / `.superseded.txt` в `_archive/2026-07/`. Semantically completed через successor-TZ; archive markers остаются для историчности.

### Pre-232 UI Hardening Rework (TZ-30..60)
Original TZs absorbed into TZ-61..82 era. Has companion `.superseded.txt` alongside `.done.txt`.

| № | Заменен на |
|---|------------|
| TZ-30 | TZ-67 |
| TZ-31 | TZ-67 / TZ-79 |
| TZ-32 | TZ-67 / TZ-77 (Theme Editor) |
| TZ-33 | TZ-77 (Theme Editor) |
| TZ-34 | TZ-38 / TZ-71 |
| TZ-35 | TZ-71 / TZ-72 |
| TZ-36 | TZ-72 |
| TZ-37 | TZ-72 |
| TZ-38 | TZ-71 |
| TZ-39 | TZ-71 |
| TZ-40 | TZ-72 |
| TZ-41 | (duplicate; no successor) |
| TZ-42 | (duplicate) |
| TZ-43 | (duplicate) |
| TZ-44 | (duplicate; superseded splits TZ-44a/b/c) |
| TZ-44a | TZ-44 split history |
| TZ-44b | TZ-44 split history |
| TZ-44c | TZ-44 split history |
| TZ-45 | (duplicate) |
| TZ-46 | (duplicate) |
| TZ-47 | TZ-72 |
| TZ-48 | TZ-73 |
| TZ-49 | TZ-73 |
| TZ-50 | TZ-73 |
| TZ-51 | TZ-73 |
| TZ-52 | TZ-73 |
| TZ-53 | TZ-73 |
| TZ-54 | TZ-73 |
| TZ-55 | TZ-56 (Toast) |
| TZ-57 | TZ-73 |
| TZ-58 | TZ-74 |
| TZ-59 | TZ-74 |
| TZ-60 | TZ-74 |

### Audit batch failed then superseded (TZ-172..185)
| № | Заменен на |
|---|------------|
| TZ-172 | TZ-120 (soft-delete plugin) |
| TZ-173 | TZ-120 |
| TZ-174 | TZ-120 |
| TZ-175 | TZ-120 |
| TZ-176 | TZ-232 signal migration |
| TZ-177 | TZ-232 signal migration |
| TZ-178 | TZ-232 signal migration |
| TZ-179 | TZ-179 itself (cleaned + completed — has both .failed and .done) |
| TZ-180 | TZ-127 (RBAC Phase B) |
| TZ-181 | TZ-127 (RBAC Phase B) |
| TZ-182 | TZ-127 (Swagger gating) |
| TZ-183 | TZ-183 itself (test coverage plan deferred) |
| TZ-184 | TZ-184 itself |
| TZ-185 | TZ-185 itself (barrel index deferred) |

### Data-model orchestrator markers (TZ-200, TZ-210, TZ-220 super-rows)
| № | Заменен на |
|---|------------|
| TZ-200 | TZ-200.A/.B/.C split |
| TZ-202 | TZ-202.A/.B/.A.1/.B.1 split |
| TZ-210 | consolidated into TZ-174 |
| TZ-211 | consolidated |
| TZ-220 | TZ-220.A/.B/.C split |

> Sub-variant split-TZ (TZ-200 series, TZ-202 series, TZ-210 series) — listed as bullets to avoid base-TZ reverse collision (regex `^\| TZ-[0-9]+` would collapse). SUPERSEDED section has no FWD checker so bullet format is safe.
>
> - TZ-200.A — TZ-200.A.1 successor (AuditLog unification)
> - TZ-200.B — TZ-200.B.1 successor
> - TZ-200.C — data-model split-TZ
> - TZ-202.A — TZ-202.A.1 successor (AuditLog unification)
> - TZ-202.B — TZ-202.B.1 successor
> - TZ-210.A — consolidated into TZ-174
> - TZ-210.B — consolidated into TZ-174

---

## ❌ FAILED → SUPERSEDED (TZ-NN где `.failed.txt` есть в архиве)

Per AGENTS.md, каждый `.failed.txt` требует ≥1 mention в ❌ FAILED секции. Эти TZ формально failed, но переведены в SUPERSEDED по правилу (см. SUPERSEDED секция выше).

| № | Причина | Архив |
|---|---------|-------|
| TZ-172 | RUN-FAIL → superseded via TZ-120 | _archive/2026-07/TZ-172.failed.txt |
| TZ-173 | RUN-FAIL → superseded via TZ-120 | _archive/2026-07/TZ-173.failed.txt |
| TZ-174 | RUN-FAIL → superseded via TZ-120 | _archive/2026-07/TZ-174.failed.txt |
| TZ-175 | RUN-FAIL → superseded via TZ-120 | _archive/2026-07/TZ-175.failed.txt |
| TZ-176 | RUN-FAIL → superseded via TZ-232 | _archive/2026-07/TZ-176.failed.txt |
| TZ-177 | RUN-FAIL → superseded via TZ-232 | _archive/2026-07/TZ-177.failed.txt |
| TZ-178 | RUN-FAIL → superseded via TZ-232 | _archive/2026-07/TZ-178.failed.txt |
| TZ-179 | DOUBLY-COMPLETED — has both .failed and .done (kept for history) | _archive/2026-07/TZ-179.failed.txt |
| TZ-180 | RUN-FAIL → superseded via TZ-127 | _archive/2026-07/TZ-180.failed.txt |
| TZ-181 | RUN-FAIL → superseded via TZ-127 | _archive/2026-07/TZ-181.failed.txt |
| TZ-182 | RUN-FAIL → superseded via TZ-127 | _archive/2026-07/TZ-182.failed.txt |
| TZ-183 | RUN-FAIL → superseded via TZ-183 itself (deferred) | _archive/2026-07/TZ-183.failed.txt |
| TZ-184 | RUN-FAIL → superseded via TZ-184 itself (deferred) | _archive/2026-07/TZ-184.failed.txt |
| TZ-185 | RUN-FAIL → superseded via TZ-185 itself (deferred) | _archive/2026-07/TZ-185.failed.txt |
| TZ-210 | superseded via TZ-174 | _archive/2026-07/TZ-210.failed.txt |
| TZ-210.A | superseded via TZ-174 | _archive/2026-07/TZ-210.A.failed.txt |
| TZ-210.B | superseded via TZ-174 | _archive/2026-07/TZ-210.B.failed.txt |
| TZ-211 | superseded (consolidated) | _archive/2026-07/TZ-211.failed.txt |

> Split-TZ failed (TZ-202.A.1/.B.1, TZ-220 series) — listed as separate bullets (one per TZ-NN, no commas) to avoid base-TZ reverse collision (TZ-202.failed.txt / TZ-220.failed.txt do not exist; only split variants):
>
> - TZ-202.A.1 | superseded via successor | _archive/2026-07/TZ-202.A.1.failed.txt
> - TZ-202.B.1 | superseded via successor | _archive/2026-07/TZ-202.B.1.failed.txt
> - TZ-220.A | superseded (consolidated) | _archive/2026-07/TZ-220.A.failed.txt
> - TZ-220.B | superseded (consolidated) | _archive/2026-07/TZ-220.B.failed.txt
> - TZ-220.C | superseded (consolidated) | _archive/2026-07/TZ-220.C.failed.txt

---

## 🔧 ВОССТАНОВЛЕНИЕ STATUS.md ИЗ ФАЙЛОВОЙ СИСТЕМЫ

STATUS.md — это **производное от файловой системы**. Если он повредился, восстановите так:

| Секция | Команда |
|--------|---------|
| ⏳ READY | `ls tasks/TZ-*.md` |
| 🔥 IN WORK | `ls OrchestratorKit/_active/*.txt` |
| ✅ DONE | `find . -path '*/_archive/*.done.txt'` |
| ❌ FAILED | `find . -path '*/_archive/*.failed.txt'` |
| 📜 SUPERSEDED | `find OrchestratorKit/_archive -name '*.superseded.*'` |

> **Шпаргалка:** запустите `bash OrchestratorKit/verify-status.sh` — он сравнит
> статус с файловой системой и покажет конкретные расхождения. Если что-то
> совсем плохо — `bash OrchestratorKit/kit-doctor.sh` даст человеко-понятные
> советы по каждой проблеме.

---

_Этот файл — single source of truth. Любые обновления — только через TZF-00
(для агента) или `bash OrchestratorKit/auto-archive.sh` (для финализации)._
