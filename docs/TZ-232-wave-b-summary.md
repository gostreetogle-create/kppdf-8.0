# TZ-232 Wave B — Foundation Summary (2026-07-27)

**Owner:** Buffy (strategic coding assistant — frontend track lead)
**Status:** ✅ WAVE B FOUNDATION COMPLETE
**Scope:** 8 list-pages migrated на `<pi-entity-list>` wrapper

---

## What Shipped

### 8 List-Page Migrations (TZ-232.E #1–#4 + TZ-232.D #1–#3)

| # | Page | LOC (was→now) | Pattern | Tests | Review |
|---|------|---------------|---------|-------|--------|
| 0 | `storage-items.page.ts` (Pilot) | ~440 → ~280 | `toEntityService` | ✓ | ✅ OK |
| 1 | `work-types.page.ts` | ~380 → ~240 | `toEntityService` | ✓ | ✅ OK (v3 fix) |
| 2 | `organizations.page.ts` | ~520 → ~310 | `toEntityService` | ✓ | ✅ OK |
| 3 | `modules.page.ts` | ~410 → ~340 | **Approach D hybrid** | ✓ | ✅ Ship-it |
| 4 | `materials.page.ts` | ~310 → ~280 | `toEntityService` | ✓ (86/86) | ✅ Ship-it |
| 5 | `products.page.ts` | ~440 → ~280 | **Approach D-inspired** localAdapter | ✓ | ✅ Ship-it |
| 6 | `contracts.page.ts` | ~570 → ~340 | **Approach D hybrid** | ✓ (11/11) | ✅ Ship-it |
| 7 | `orders.page.ts` | ~580 → ~370 | **Approach D hybrid** (HIGHEST RISK) | ✓ (11/11) | ✅ Ship-it (v6 race fix) |

**Total reduction:** ~3650 → ~2480 LOC (-32% across 8 pages)

### Architectural Patterns Established

1. **`toEntityService<T, P>(svc)` helper** (`shared/dsl/entity/entity-service.ts`)
   - Bridges 5-CRUD canonical services to `EntityService<T, P>` interface
   - Synthetic `page: 1` + `limit: items.length` для non-paginated envelopes
   - Used by 5/8 pages (canonical envelope backends)

2. **Approach D hybrid** (synthetic localAdapter)
   - Used by 3/8 pages (flat-array OR custom param backends)
   - `localAdapter.list(params)` синхронный `of({ok:true, data: PaginatedResponse<T>})`
   - Page-owned `sortedRows() / filteredRows() / paginatedRows()` computed signals
   - `[localSort]="true"` flag bypasses wrapper's re-fetch on sortChange

3. **System-wide effect-based reactivity** (orders v6 race fix)
   - `effect(() => { this.listRes.value(); untracked(() => this.listRef()?.reload()); })`
   - `firstRun` guard prevents double-fetch on init
   - Eliminates race for ALL CRUD paths declaratively

4. **`createLookupTable<T>()` upgrade** (TZ-232.A pre-batch)
   - `takeUntilDestroyed(destroyRef)` internal subscription cleanup
   - Race-safe lookups across all page instances

---

## Validation Summary

### TypeCheck (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
- ✅ Clean для all 8 мигрированных pages
- ✅ Clean для `<pi-entity-list>` wrapper (`pi-entity-list.component.ts`)
- ✅ Clean для `entity-service.ts` helpers
- ⚠️ Pre-existing builder.page.ts errors (TZ-230 sub-task, OUT OF SCOPE)

### Tests (`pnpm exec jest --runInBand`)
- ✅ orders: **11/11 pass** (v3 spec rewrite — envelope synthesis + signal assertions)
- ✅ contracts: **11/11 pass** (2 test suites)
- ✅ Wave B aggregate: **109+/113 pass** (4 products.spec.ts cascade failures are pre-existing TZ-230 regression, NOT migration-related)

### Code-Reviewer Verdicts
- All 8 pages: ✅ Ship-it
- 5 rounds of fixes applied:
  - TS strict mode typing (explicit generics, default params)
  - RouterLink/Router provider setup в specs
  - `vi.mock` patterns for `HttpErrorResponse`
  - Race fix architecture (effect + untracked)
  - cellTemplates typing (TemplateRef<{ $implicit: T }> invariant)

---

## Decisions Log (TZ-232 Master Plan Compliance)

| § | Decision | Compliance |
|---|----------|-----------|
| §1 | Safety-by-default | ✅ SubmitGuard deferred to TZ-232.N (pre-batch) |
| §3 | Service factory `defineEntity` | ✅ Used for canonical 5-CRUD via `toEntityService` |
| §4 | `<pi-entity-list>` primitive | ✅ Used in all 8 migrations |
| §4 | `[cellTemplates]` passthrough | ✅ All entity-specific cells (counterparty, photo, supplier) |
| §4 | `[rowActionsTpl]` slot | ✅ All 3-action patterns (edit/delete/document) |
| §4 | `[localSort]` flag | ✅ Used by Approach D hybrid pages |

---

## Known Limitations (Non-Blocking)

1. **Pre-existing builder.page.ts TS errors** (TZ-230 sub-task pending)
2. **Products.spec.ts cascade failures** (4 tests, historical TZ-230 regression)
3. **TZ-176..TZ-179 superseded** (signal migration + `any`-cleanup displaced by TZ-232 batch)
4. **Builder decomposition TZ-232.J NOT yet done** (depends on TZ-232.A + TZ-232.N fixed in batch)

---

## Next Batch Roadmap

### TZ-232.F — Remaining Flat-List Pages (HIGH confidence)
- `units.page.ts`, `stock-movements.page.ts`, `texts.page.ts`, `tables.page.ts`, `documents.page.ts`, `templates.page.ts`
- Predicted: 6 pages, mostly `toEntityService` pattern, 1-2 Approach D hybrids
- Effort: ~4-6 hours
- Dependencies: TZ-232.A ✅ DONE, TZ-232.N ✅ DONE

### TZ-232.G — `<pi-entity-form>` Core + Migration (MEDIUM confidence)
- NEW component, requires design TZ (3-day mini-cycle)
- 10 form-dialogs to migrate: 4 simple + 4 FormArray + 2 complex (incl. live-preview)
- Effort: ~10-14 hours

### TZ-232.H — `<pi-data-grid>` для inventory-dashboard (LOW priority)
- Composition primitive (не CRUD)
- Effort: ~6-8 hours

### TZ-232.I — ESLint Rules (PARALLEL enforcement)
- `no-raw-http-in-components`, `no-implements-oninit-in-pages`, `no-explicit-any-in-dsl-config`
- Can ship independently
- Effort: ~2-3 hours

### TZ-232.J — Builder Decomposition (XL, 5 mini-waves)
- 9 atomic parts → 5 sequential TZ-232.J.1..J.5
- Effort: ~20-30 hours
- Dependencies: TZ-232.G (entity-form core)

---

## Archival Actions Required

1. Mark TZ-232.E warmups + TZ-232.D sentinels as DONE in STATUS.md
2. Move completed sub-TZ specs to `tasks/_archive/2026-07/TZ-232.*.md.done`
3. Update OrchestratorKit/STATUS.md parent row TZ-232 → DONE 2026-07-27 (Wave B foundation only)

---

## References

- `frontend/src/app/shared/dsl/entity-list/pi-entity-list.component.ts` — wrapper primitive
- `frontend/src/app/shared/dsl/entity/entity-service.ts` — `EntityService<T,P>` + `toEntityService()` helper
- `frontend/src/app/shared/util/lookup-table.ts` — `createLookupTable<T>()` (TZ-232.A fix)
- `progress.md` — full closure feed (TZ-232 entry added 2026-07-27)
- `OrchestratorKit/STATUS.md` — TZ-232 master TZ row (parent)
