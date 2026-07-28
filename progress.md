---

## [2026-07-28] — Завершено: TZ-232.I-bump (`@pi-dsl/no-raw-http-in-components` FILTR-WIDE ENABLED + builder.page.ts surgical fix)
**Исполнитель:** Buffy (Layer 2 surgical fix + ESLint validation)
**Статус:** Выполнено (closes carry-over debt from TZ-232.I ORIGINAL which scaffolded rule but did NOT enforce; 5 surgical edits + 1 cleanup = net 17 LoC reduction in builder.page.ts; TSC clean + ESLint --max-warnings 0 CLEAN PROJECT-WIDE on all .component.ts + .page.ts + jest builder.page.spec.ts 5/5 PASS)

### Что сделано:
- **builder.page.ts** — 5 surgical edits + 1 cleanup:
  1. `import { HttpClient, ... }` → `import { HttpErrorResponse, httpResource }` (HttpClient removed; httpResource legitimate per Rule 1)
  2. Added imports: `OrganizationsService` + `DocTypesService` (services already existed)
  3. Removed DI: `private readonly http = inject(HttpClient)` + `private readonly baseUrl = inject(API_BASE_URL)`. Added `orgSvc` + `docTypeSvc`.
  4. `onDuplicateTemplate`: raw `this.http.post<DocumentTemplate>(.../duplicate)` → `this.templatesSvc.duplicate(t._id)` (new method from TZ-232.F)
  5. `onCreateTemplate`: `forkJoin([org$, dt$])` tuple of raw `this.http.get` → `forkJoin({orgs: orgSvc.list(), docTypes: docTypeSvc.list()})` object form with SilentResult navigation
  + cleanup: dead `import { API_BASE_URL }` removed after DI field elimination
- **Net LoC change:** builder.page.ts 1790 → 1773 (-17 lines)

### Verification (ALL GREEN):
- `pnpm exec eslint builder.page.ts --max-warnings 0` → **clean**
- `pnpm exec eslint 'src/app/**/*.{component,page}.ts' --max-warnings 0` → **CLEAN PROJECT-WIDE**
- `pnpm exec tsc -p tsconfig.app.json --noEmit` → 0 errors
- `pnpm exec jest src/app/pages/doc-constructor/builder/builder.page.spec.ts` → 5/5 PASS
- `grep -c 'HttpClient\b' builder.page.ts` → 0
- `grep -c 'this\.http\.' builder.page.ts` → 0

### SURPRISING OUTCOME (counterintuitive):

Counterintuitively, the project-wide ESLint scan post-fix returns **0 violations on all `.page.ts` + `.component.ts` files**. The only place where raw `HttpClient` lingered was `builder.page.ts`. Every other page already complies — meaning:

| Page | Status |
|------|--------|
| `storage-items.page.ts` | ✅ already EntityService-pattern (TZ-232.C POC) |
| `templates.page.ts` | ✅ migrated (TZ-232.F earlier this session) |
| `builder.page.ts` | ✅ migrated (TZ-232.I-bump THIS session) |
| `orders/products/contracts.page.ts` | ✅ already use typed services |
| `materials/work-types/organizations/modules.page.ts` | ✅ already use typed services |
| `documents/tables/texts/stock-movements.page.ts` | ✅ already use typed services |

This is much better than the TZ-232 master plan estimate of "~16 remaining pages to migrate over 24-40h". The actual remaining DSL coverage gaps are:
- ⚠️ 10 form-dialogs (TZ-232.G scope, 10-14h) — these are component.ts files, scanned separately
- ⚠️ builder decomposition (TZ-232.J: 9 atomic parts from 1790 → <200 LoC, 28-37h) — biggest single TZ
- ⚠️ inventory-dashboard composition (TZ-232.H, 4-6h)

### Cross-references:
- Archive: `OrchestratorKit/_archive/2026-07/TZ-232.I-bump.done.txt`
- Spec: `tasks/TZ-232.I-bump.md`
- Lock file: `.mimocode/locks/TZ-232.I-bump-eslint-file-wide-enable.lock` (Owner + 4 Unlock: TZ-232.J / TZ-232.G / TZ-232.H / TZ-232.K)
- Carried over from: TZ-232.I ORIGINAL (rule scaffolding, DONE 2026-07-28)
- Carried into: TZ-232.J (builder decomposition — next high-value single TZ)

### Unlocks:
- ✅ `@pi-dsl/no-raw-http-in-components` now file-wide enforced — guards future page work forever
- ✅ CI lint stage will block any new raw-HttpClient attempt on any `.page.ts` or `.component.ts`
- ✅ Pre-existing 22 frontend files in feature/tz-230-d-ts-cleanup branch validate as compliant

### Follow-up (next session priorities):
1. **TZ-232.J — Builder decomposition (28-37h, 9 atomic parts)** — reduces builder.page.ts from 1773 LoC to <200 while preserving visual + behavioral parity. PO sign-off mandatory per master plan.
2. **TZ-232.G — 10 form-dialogs on `<pi-entity-form>` helper (10-14h)** — heaviest ongoing coverage gap after the surprising rule 1 enforcement outcome.
3. **TZ-232.H + TZ-232.K** — inventory-dashboard + schematic generator (parallelizable)

---
