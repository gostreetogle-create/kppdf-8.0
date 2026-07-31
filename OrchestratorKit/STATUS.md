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
| ~~TZ-82~~ | ~~Browser-use smoke test~~ | partial coverage (TZ-LIGHT-XX + TZ-AUDIT-9 visual audits); stand-alone full-page smoke run deferred (NOT blocker) | TZ-67 + TZ-69..74 • TZ-79 |
| ~~TZ-90~~ | ~~Диалоговая система (Phase A+B shipped; Phase C/D/E deferred)~~ | DONE — Phase A+B archived 2026-07-12 | — |
| TZ-232 | DSL Master Plan (Angular Assembly) — sub-TZ A-N. **DONE parts:** A, B-shim, C, D, E, F, G, H, I, J (partial via TZ-235), K (FormErrorI18n 2026-07-30), **+ organizations PoC (storage-items → orgs) 2026-07-30**, **+ TZ-232.W2 list-pages migration (materials/products/work-types/modules/tables — −1612 lines, −69%) 2026-07-30, commit 98dc960**. Остаются runtime work: TZ-232.D (Sentinel list-pages для counterparties/persons/units/currencies), TZ-232.E (OnInit migration). | frontend/src/app/shared/dsl/*; frontend/src/app/shared/ui/*; frontend/src/app/pages/* | — |
| TZ-235 | Конструктор v2 UX-апгрейд (16 sub-TZ, 7 waves, ~140-180h) — planning doc. **Wave 1 R2 (BuilderStateService: 16 handlers extraction) DONE** (commit 3633b9c). **Wave 1 R3 (page.ts dual-source cleanup: -607 lines) DONE** (commit 0cb8e60). **Wave 1 R4 (template-symbol regressions close: builder.textsRes/tablesRes + contract-form-dialog.hasError + table-template.NG8107; 3 files, +17/-7) DONE 2026-07-30** (commit 84e2665). **Wave 2 R1 (block-renderer: 1484 → 941 lines, -37%) DONE** (commit 7a27443). **Wave 2 R2 (builder-inspector: 1856 → 464 lines, -75%, decomposed into 5 files) DONE 2026-07-30** (commit 5837981): BuilderInspectorStateService + TemplatePropertiesFormComponent + BlockInspectorComponent + MultiSelectInspectorComponent + thin switcher. Pattern: per-instance service + sub-component hierarchical DI + Subject↔output bridge. builder.page.ts: 0 lines changed. Pending sub-waves: TZ-235.C.1 (imageHeight bugfix + audit pre-existing issue), TZ-235.D (group drag), TZ-235.E (undo/redo), TZ-235.G (scroll-aware drag). | frontend/src/app/pages/doc-constructor/builder/* | TZ-232.J |
| TZ-236 | PDF/Print стек (4 waves, ~140-180h) — planning doc. **Wave A.1 (Gotenberg Docker + Cyrillic fonts + start.mjs integration) DONE 2026-07-30** (commit 3b3ed16). **Wave B (PdfRender NestJS module + Gotenberg HTTP integration) DONE 2026-07-30** (commit 84d912c). **Wave C (background images via host.docker.internal + async render queue + Chromium header/footer) DONE 2026-07-30** (commit ec54189). Phase A.2 (PT Sans/Serif/Mono) + Wave D (UI integration on frontend) pending. | docker-compose.yml; docker/Dockerfile.gotenberg; backend/src/modules/pdf-render/* | — |
| ~~TZ-110~~ | ~~Category backend safety (cycle prevention + fullPath cascade + ObjectId validation)~~ | DONE 2026-07-19 | — |
| ~~TZ-111~~ | ~~Builder bulk-delete race condition (partial success + snapshot rollback)~~ | DONE 2026-07-19 | — |
| ~~TZ-112~~ | ~~Table Template Dialog — column metadata preservation + edit init + sampleRows limit~~ | DONE 2026-07-19 | — |
