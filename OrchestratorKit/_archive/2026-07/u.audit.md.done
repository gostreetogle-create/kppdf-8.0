# Архитектурный аудит kppdf-8.0 — план рефакторинга (TZ list)

**Контекст:** Angular 20 + Paper & Ink design system, NestJS backend, signal-based state (httpResource), TZ-104 pi-table миграция в процессе (1/27 страниц мигрировано в коммит `fc398a2` на 2026-07-12). 21+ TZ уже завершены в `tasks/_archive/2026-07/`. Аудит проводится параллельно с другими AI-агентами.

---

## JSON для импорта в таск-менеджер

```json
[
  {
    "id": 1,
    "title": "TZ-AUDIT-1: cycle-import audit через `madge`",
    "description": "Установить `madge --circular frontend/src/app`, сгенерировать dependency-graph.svg в docs/. Найти любые циклы между `pages/*` ↔ `shared/*`. Особое внимание: shared/ui/dialog ↔ pages/{materials,products,orders}/form-dialog, shared/ui/pi-row-actions ↔ pages/*/list. Циклы блокируют tree-shaking и ломают lazy-роутинг. Действие: либо инвертировать зависимость через inject()/provide(), либо выделить общие токены.",
    "priority": "High",
    "stage": 1,
    "acceptance_criteria": "madge-цикл пустой; ci-скрипт `pnpm audit:cycles` падает с ненулевым exit code на любом новом цикле; задокументировано в docs/architecture/circular-deps.md",
    "tags": ["angular", "architecture", "imports", "tree-shaking"]
  },
  {
    "id": 2,
    "title": "TZ-AUDIT-2: bundle size аудит с source-map-explorer",
    "description": "Запустить `pnpm build:dev && npx source-map-explorer 'frontend/dist/**/*.js'` + построить сравнительную таблицу по роутам (initial vs lazy bundle). Целевые метрики: initial <250kb (gzipped), каждая lazy-страница <80kb. Зафиксировать топ-5 крупнейших зависимостей в shared/ui. На основе аудита выбрать 3 кандидата на code-split.",
    "priority": "High",
    "stage": 1,
    "acceptance_criteria": "bundle-report.md с метриками per-route + diff vs main; metric alert в CI если initial >250kb; новые страницы не должны пушить initial bundle >5kb",
    "tags": ["angular", "performance", "bundle", "ci"]
  },
  {
    "id": 3,
    "title": "TZ-AUDIT-3: a11y аудит axe-core на /kit/* + диалогах",
    "description": "Прогнать axe-core (headless Chrome) на ключевых /kit страницах: foundations, materials, doc-constructor/tables, builder (если есть). Проверить: contrast >=4.5:1 для body-text и >=3:1 для UI, all-inputs-have-label, role='alert' на ошибках, focus-trap в dialog. На основе отчёта составить список исправлений (отдельные TZ ниже).",
    "priority": "High",
    "stage": 1,
    "acceptance_criteria": "axe-отчёт сгенерирован; zero violations на /kit/foundations (эталон); violations на других /kit-страницах оформлены как отдельные TZ-PERF-A11Y-N",
    "tags": ["angular", "a11y", "wcag", "axe-core"]
  },
  {
    "id": 4,
    "title": "TZ-104.7: TZ-104.7-batch-1 — migrate 3 page templates easier follow-up",
    "description": "Continue TZ-104.3 Phase B after commit fc398a2 (materials). Migrate products.page.ts (server-side sort pattern, [localSort]=false + (sortChange) handler that updates sortBy/sortOrder signals — httpResource re-fires via single listParams=computed(). Use the v4 pattern (any-typed @ViewChild + ngOnInit assignment + plain property bindings) verbatim from materials.",
    "priority": "High",
    "stage": 2,
    "acceptance_criteria": "products.page.ts использует <app-pi-table> + [total] wired to listRes.value().total + (pageChange) updates pageSig → httpResource re-fires; createSortState dropped; ts-clean; products.page.spec.ts (если есть) проходит",
    "tags": ["angular", "TZ-104", "pi-table", "migration", "server-sort"]
  },
  {
    "id": 5,
    "title": "TZ-104.8: orders.page.ts migration (client paginate)",
    "description": "Migrate orders.page.ts — backend returns flat Order[] (no envelope). Apply: client paginate via (data, pageSig, pageSize, slice) computed; [total]=filteredAndSorted.length; (pageChange)→pageSig.set(p); preserve client-side createSortState + createClientSearchState wiring; cell templates for counterparty lookup name. Reuse materials v4 pattern.",
    "priority": "High",
    "stage": 2,
    "acceptance_criteria": "orders.page.ts использует <app-pi-table>; [total] from filtered.length (NOT response); cell template для counterparty name; client slice working; orders.page.spec.ts (if exists) passes",
    "tags": ["angular", "TZ-104", "pi-table", "migration", "client-paginate"]
  },
  {
    "id": 6,
    "title": "TZ-104.9: rework TZ-86 offenders (work-types, texts, tables-templates) to pi-table",
    "description": "Already migrated from inline button role=switch to app-pi-switch (TZ-104.2 commit 39f269b). Now migrate from inline <table> to <app-pi-table>. Work-types, text-blocks and table-templates are 3 small pages with similar shape. Reuse materials v4 pattern.",
    "priority": "High",
    "stage": 2,
    "acceptance_criteria": "All 3 pages use <app-pi-table>; no remaining <table> markup; per-page tsc GREEN; <app-pi-switch> still used (page has switch column on each row)",
    "tags": ["angular", "TZ-104", "TZ-86", "pi-table", "migration"]
  },
  {
    "id": 7,
    "title": "TZ-104.10: organizations + organizations members pages to pi-table",
    "description": "Migrate organizations.page.ts (probably has similar table-of-customers shape). Reuse v4 pattern. Add sticky-left on name. cellClass: 'empty-cell' on inn/contact columns. sindicate lookup tables required for counterparty references.",
    "priority": "High",
    "stage": 2,
    "acceptance_criteria": "organizations.page.ts uses <app-pi-table>; counterparty lookup pattern preserved; per-spec passing",
    "tags": ["angular", "TZ-104", "pi-table", "migration"]
  },
  {
    "id": 8,
    "title": "TZ-104.11: contracts + modules + builder-inspector to pi-table",
    "description": "These 3 page-templates have heavier dialog-form integration. Apply: server-side pagination (contracts/modules), client-paginate for builder-inspector's inline tree. cellTemplates for dependant lookup columns (counterpartyId, moduleId).",
    "priority": "High",
    "stage": 3,
    "acceptance_criteria": "All 3 pages use <app-pi-table>; per-key column with cellTemplates; tsc clean; spec coverage",
    "tags": ["angular", "TZ-104", "pi-table", "migration", "contracts"]
  },
  {
    "id": 9,
    "title": "TZ-104.12: inventory pages (storage-items, stock-movements, inventory-dashboard) to pi-table",
    "description": "Three inventory pages just landed via TZ-100/TZ-101 (sessions recently). Likely use inline tables still. Migrate to <app-pi-table>. Storage-items SHOWS-photo cells (similar to materials); stock-movements has date+amount numeric; inventory-dashboard aggregating view.",
    "priority": "Medium",
    "stage": 3,
    "acceptance_criteria": "All 3 inventory pages use <app-pi-table>; image cells for storage-items; numeric alignment for stock-movements; aggregation cards preserved on dashboard",
    "tags": ["angular", "TZ-104", "pi-table", "inventory", "migration"]
  },
  {
    "id": 10,
    "title": "TZ-104.13: doc-constructor (builder, builder-inspector, doc-templates, texts, tables) to pi-table",
    "description": "Heaviest migration: doc-constructor has 5+ pages with template-driven content. builder-inspector has inline textarea + metadata table. Apply: [rowActions] for edit/delete on prototype rows; cellTemplates for type-icon + thumbnail; complex sorting/grouping (preserves TZ-86 builder semantics).",
    "priority": "Medium",
    "stage": 3,
    "acceptance_criteria": "All doc-constructor pages use <app-pi-table>; no inline <table> markup remaining; builder inspector preserves extensible section semantics; templates-side nesting via [expandedRow] supported",
    "tags": ["angular", "TZ-104", "pi-table", "doc-constructor", "TZ-86"]
  },
  {
    "id": 11,
    "title": "TZ-104.14: remaining 17 pages (orders, contracts, etc.) to pi-table",
    "description": "Sweep: work-types/dictionaries (already migrated TZ-104.2). Counterparties/contacts. Quotations. Pickup-delivery. Calendar. Notifications. Apply v4 pattern progressively per-page with per-page atomic commits.",
    "priority": "Medium",
    "stage": 4,
    "acceptance_criteria": "All 27 catalog pages migrated; pi-table spec coverage 100%; per-page ješt passing",
    "tags": ["angular", "TZ-104", "pi-table", "migration", "final-sweep"]
  },
  {
    "id": 12,
    "title": "TZ-104.6: restore typed cellTemplates via generic re-parameterization",
    "description": "From materials v4 code-reviewer nit: cellTemplates=Record<string,T>"> (Material-keyed by `any`) sidesteps TemplateRef invariance. Add a generic Type parameter to <app-pi-table> — pi-table<T> — so consumers get TemplateRef<{ $implicit: T }> typing at build sites. Removing the 'any' escape hatch restores compile-time safety across all 27 migrated pages.",
    "priority": "High",
    "stage": 4,
    "acceptance_criteria": "pi-table accepts generic T; consumers re-parameterize: <app-pi-table<Product> [...]; 'as Material' casts eliminated from page code; cellTemplates input typed as Record<string, TemplateRef<{ $implicit: T }>>; all 27 migrated pages still tsc-green after eschewing any",
    "tags": ["angular", "TZ-104", "TZ-104.6", "pi-table", "typescript", "generics"]
  },
  {
    "id": 13,
    "title": "TZ-104.4: search debounce + pageSig coordination via effect()",
    "description": "From materials v4 code-reviewer nit: keystroke fires 2 httpResource fetches (page reset + 300ms-deferred search). Use Angular effect() that listens to debouncedSearch → resets pageSig.set(1) ONLY on actual debounced flip (not on initial load). Single fetch per debounced search event.",
    "priority": "Medium",
    "stage": 4,
    "acceptance_criteria": "effect() in constructor (or ngOnInit) coordinates page reset + search; single httpResource fetch per debounced keystroke; tests using debouncedSearch.set() verify single re-fire; materials/products/orders all updated to this pattern",
    "tags": ["angular", "TZ-104", "TZ-104.4", "search", "httpResource", "performance"]
  },
  {
    "id": 14,
    "title": "TZ-STD-1: extract listResource<T>(url, params) helper wrapping httpResource + computed params",
    "description": "Pattern duplicated across 27 pages: httpResource<TResponse>( () => ({ url, params: this.listParams() })). Create shared/util/list-resource.ts: listResource<T>({ url, pageSize, search?, sort? }) → returns { data, total, loading, error, page, reload, setPage }. Single source of truth for paginated list pattern.",
    "priority": "High",
    "stage": 5,
    "acceptance_criteria": "listResource exported from @app/shared/util/list-resource; spec covers pagination + sort + search; all 27 migrated pages updated to use listResource (drops ~400 LOC of duplicate signal wiring)",
    "tags": ["angular", "httpResource", "stdlib", "DRY"]
  },
  {
    "id": 15,
    "title": "TZ-STD-2: extract createDialogForm<FormGroup>() helper for dialog FormBuilder setup",
    "description": "Material/Product/WorkType/Order/Contract/Module/TextBlock dialogs duplicate FormBuilder setup + onDialogCloseOnce refresh + PiDialogService.open pattern. Create shared/util/create-dialog-form.ts: {open(data: T | null) → returns ref + cleanup hook}. Centralized dialog lifecycle for the 9+ form-dialog components.",
    "priority": "Medium",
    "stage": 5,
    "acceptance_criteria": "createDialogForm exported; mock-test for ref-creation + cleanup; 9 form-dialog components updated to use the helper; per-dialog LOC drops by ~30%",
    "tags": ["angular", "forms", "dialogs", "stdlib"]
  },
  {
    "id": 16,
    "title": "TZ-STD-3: extract createLookupTable<TResult> with better types + readonly byId",
    "description": "createLookupTable is used by ~10 pages for org/photo/unit/category/role/etc. references. Currently input is `Observable<SilentResult<{items?:T[]} | T[]>>` — too loose. Tighten: createLookupTable<TResult>(fetcher: () => Observable<SilentResult<TResult[]>>) — preserves keyed map shape; add byId fetched-time to enable refresh race-resolution.",
    "priority": "Medium",
    "stage": 5,
    "acceptance_criteria": "createLookupTable now throws on bad input; LOC of pages using it drops ~15%; full typescript compilation green",
    "tags": ["angular", "DRY", "stdlib", "types"]
  },
  {
    "id": 17,
    "title": "TZ-ARCH-1: split smart/dumb for materials/products/orders (currently 250+ LOC pages)",
    "description": "Materials page is 250+ LOC (post-migration). Split: extract MaterialsListContainerComponent (smart, shell + data) + MaterialsTableComponent (presentational, props in). Same for products + orders. Three new dumb components per page. Container < 100 LOC, table < 150 LOC.",
    "priority": "Medium",
    "stage": 6,
    "acceptance_criteria": "Each of materials/products/orders split into smart container + dumb table; container LOC < 100, table LOC < 150; per-component spec passes; visual regression A/B diff (Pi browser A/B compare)",
    "tags": ["angular", "smart-dumb", "architecture", "split"]
  },
  {
    "id": 18,
    "title": "TZ-ARCH-2: consolidate OrdersService to canonical {items,total,page,limit} envelope",
    "description": "OrdersService.list() returns flat Order[] (no envelope) per its v1 backend. Moved to client-paginate via pi-table. But contracts/quotations/deliveries will need same. Either: (a) update backend to canonical envelope (preferred), or (b) promote order-via-envelope flattening helper to shared/util. Aim for canonical envelope project-wide.",
    "priority": "Medium",
    "stage": 6,
    "acceptance_criteria": "All *Service.list() return {items,total,page,limit}; backend controllers order.controller.ts + (whichever other flat) updated to paginate; per-page spec passes without client-side compensating logic",
    "tags": ["angular", "backend", "api-contract", "canonical"]
  },
  {
    "id": 19,
    "title": "TZ-ARCH-3: feature-area dir restructure (pages/materials/{list,edit}/, etc.)",
    "description": "Current /pages/* flat: each page = page.ts + service.ts + form-dialog.component.ts + spec.ts scattered. Switch to feature-areas: /pages/materials/{list/, list/materials-list.page.ts, list/materials-table.component.ts, edit/material-form-dialog.component.ts, service.ts, spec.ts, types.ts}. Same for all 27 catalog pages. Improves findability and extractability (matches Angular feature-module convention in spirit despite standalone).",
    "priority": "Low",
    "stage": 6,
    "acceptance_criteria": "pages/materials/list/, pages/materials/edit/, etc. created; imports reorganized; tsc green; spec passing; all 27 catalogs restructured; navigation tests pass",
    "tags": ["angular", "architecture", "directory"]
  },
  {
    "id": 20,
    "title": "TZ-PERF-1: lazy-route each catalog page (currently all pre-loaded by /kit shell)",
    "description": "Per TZ-AUDIT-2 finding, pages/materials/products/orders/etc. likely part of initial bundle via router/import-all. Use loadComponent (already supported by Angular 20) to split per-page bundles. Currently only /kit/* uses lazy; extend to /materials/* and /orders/* and /contracts/* and /inventory/* and /doc-constructor/*.",
    "priority": "Medium",
    "stage": 7,
    "acceptance_criteria": "All 27 catalog pages lazy-loaded via loadComponent; initial bundle <250kb (asserted in CI); per-page bundles <80kb; route-level loading skeleton (pi-skeleton-card) shown during fetch",
    "tags": ["angular", "performance", "lazy-routes", "bundle"]
  },
  {
    "id": 21,
    "title": "TZ-TEST-1: extend page-spec coverage (22 → 80%)",
    "description": "Pi-table spec covers 22 cases. Page-level specs: only materials has 4, plus storage-items/stock-movements/inventory-dashboard just landed. Add page-spec per migration step: each migrated page gets spec covering httpResource initial load + 500/401 contract + (pageChange) refire + (sortChange) handler. Aim 80% page-spec coverage.",
    "priority": "Medium",
    "stage": 7,
    "acceptance_criteria": "27/27 page.spec.ts exist + all green; CI enforces 80% coverage threshold on /pages/*",
    "tags": ["angular", "testing", "jest", "coverage"]
  },
  {
    "id": 22,
    "title": "TZ-TEST-2: browser A/B compare pi-table vs inline-table on materials/products/orders",
    "description": "After TZ-104.7-14 complete, run Playwright browser_use agent to capture before/after screenshots of /materials, /products, /orders. Compare pixel diffs at +/-10% tolerance. Flag visual regressions. Touch TZ-AUDIT-3's axe-core — combine into single report.",
    "priority": "High",
    "stage": 8,
    "acceptance_criteria": "Visual diff report generated; zero regressions >10% pixel diff; per-page screenshots stored in docs/screenshots/ for future baseline",
    "tags": ["angular", "TZ-104", "browser-use", "A/B-compare", "regression"]
  },
  {
    "id": 23,
    "title": "TZ-104.5.1..5: implement TZ-104.5 sub-tasks (checkbox + textarea + select spec)",
    "description": "Tasks/TZ-104.5.md (commit 211baf1) identifies 3 sub-tasks: (a) PiCheckbox + id input extension + 7 site migration, (b) PiTextarea className override input + 4 broader site migration, (c) PiSelect deferral + pi-styling normalization (~14 files, batched 4 per commit). Implement after TZ-104 full-batch completes (Stage 4 above). Designer sign-off pending on TZ-104.6 (pi-dropdown for select, mark as a separate TZ).",
    "priority": "Medium",
    "stage": 4,
    "acceptance_criteria": "All TZ-104.5 sub-tasks authored + spec code shipped; PiCheckbox id input added; PiTextarea customClass input added; native <select>/<option> → pi-input styling normalized project-wide; spec coverage +50% on dialog-form paths",
    "tags": ["angular", "TZ-104", "TZ-104.5", "pi-checkbox", "pi-textarea", "select", "primitives"]
  },
  {
    "id": 24,
    "title": "TZ-DOC-1: expand docs/paper-and-ink.md with stdlib cookbook (sub-pages)",
    "description": "Current docs: add-new-page.md (page-author checklist), paper-and-ink.md (design system). New sub-pages: (a) docs/stdlib/list-resource.md (usage + spec), (b) docs/stdlib/dialog-form.md, (c) docs/stdlib/lookup-table.md, (d) docs/migrations/pi-table.md (migration playbook — captures the TZ-104 v4 pattern). Avoid docs-drift: hook into audit-ci to detect missing usage-notes for new exports.",
    "priority": "Low",
    "stage": 8,
    "acceptance_criteria": "4 new docs sub-pages authored; docs-link-check validates all internal anchor refs; per-section's access via kit-exposed doc-toc component",
    "tags": ["angular", "documentation", "stdlib", "DX"]
  }
]
```

---

## Сводка по этапам

| Этап | Описание | TZ | Кол-во | Кумулятивный эффект |
|------|----------|----|----|--------------------|
| 1 | Структурный аудит (no behavior change) | TZ-AUDIT-1, 2, 3 | 3 | Метрики: cycle, bundle, a11y |
| 2 | Materials/products/orders TZ-104 завершение | TZ-104.7, 8 | 2 | Приоритетные 3 страницы используют pi-table |
| 3 | Продолжение TZ-104 на 6-странычные catalog группы | TZ-104.9, 10, 11, 12, 13 | 5 | ~12/27 страниц на pi-table |
| 4 | Sweep + типовая реставрация + TZ-104.5 | TZ-104.14, 6, 5, 4 | 4 | 18/27 → 27/27 + typed cellTemplates + TZ-104.5 primitivess |
| 5 | Хелперы stdlib | TZ-STD-1, 2, 3 | 3 | LOC вычитания во всех 27 страницах |
| 6 | Smart/dumb split + Order canonical | TZ-ARCH-1, 2, 3 | 3 | Container < 100 LOC, единая пагинация |
| 7 | Performance / Lazy / Tests | TZ-PERF-1, TEST-1 | 2 | initial bundle < 250kb, 80% spec coverage |
| 8 | Validation + Docs | TZ-TEST-2, DOC-1 | 2 | A/B compare green + 4 stdlib docs |

---

## Cross-reference (TZ-104 split):

TZs 4-13 — **пакетное закрытие TZ-104.3 Phase B** (28 страниц → <100kb локализации страниц). По пользовательскому запросу 2026-07-12 «27-page pi-table mass migration» — это TZs 4-13, 22, выполняются в TZ-104.7-14 sweep + follow-up.

---

## Замечания по контексту

1. **TZ-104 уже 1/3 inbound** (`fc398a2` — materials) — это результат сегодняшней сессии. Остальные 26 страниц нужно мигрировать последовательно. При batch 3-страницы/неделю получается ~9 недель.

2. **`any`-escape hatch в materials.page.ts** — это documented technical debt. TZs 12 (TZ-104.6) + 13 (TZ-104.4) + 14 (TZ-STD-1) снимают эту задолженность один за другим.

3. **TZ-104.1 (a2d1e84), TZ-104.2 (39f269b), TZ-104.3 (34b0ba1+fc398a2), TZ-104.5 (211baf1)** — это уже завершённые/начатные sub-ZZs, перечисление задач выше следует их нумерации.

4. **Backend канонический envelope** — материалы и продукты используют `{items,total,page,limit}`. Заказы → flat array. TZ-ARCH-2 унифицирует.

5. **Cycle-imports** — подозреваю shared/ui/dialog ↔ pages/*/form-dialog ↔ shared/util/lookup-table. TZ-AUDIT-1 (madge) формализует.

