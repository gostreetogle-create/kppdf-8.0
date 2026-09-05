# TZ-NX-SUPPLY-S1-PAGE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude

## Verification

- acceptance criteria: PASS — no in-memory mock seed ported (registry-only page, no quick-order mode); `?orderId=` filter + status transitions (confirm/ordered/received) live; `nx build` PASS.
- focused Jest: PASS — `pi-supply-tasks.service.spec.ts` (8/8), `supply.page.spec.ts` (9/9).
- frontend-nx app typecheck: PASS — `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`.
- frontend-nx data-access typecheck: PASS — `cd frontend-nx && pnpm exec tsc -p libs/data-access/tsconfig.lib.json --noEmit`.
- lint: PASS — changed-path ESLint on all new/edited S1 files, 0 errors.
- architecture: PASS — `pnpm architecture:check` (1451 files; baseline 17, 2 resolved) + `pnpm architecture:check:nx` (393 files, 0 violations).
- full suite: PASS — `nx test data-access` 21/21 suites, 103/103 tests; `nx test kppdf-web` — only pre-existing known `app-shell.component.spec.ts` failures remain (N/A, unrelated to S1, present before this TZ).
- final gate: PASS — `cd frontend-nx && pnpm exec nx build kppdf-web` (only pre-existing known warnings: Studio NG8102, Gantt CSS budget).

## Delivered

- `PiSupplyTasksService` (`frontend-nx/libs/data-access/src/lib/supply/{supply-task.types,pi-supply-tasks.service}.ts` + spec) — mirrors legacy `SupplyTaskService` 1:1 on the `SilentResult<T>` pattern: `list/create/explode/update/confirm/markOrdered/markReceived/remove`.
- `/supply` NX page (`frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.ts` + spec) — live SupplyTask registry only; manual CSS-grid table (current NX convention, matches `storage-items.page.ts`); status filter; `?orderId=` deep-link filter with clear chip (router-driven); explode-from-order + manual create form; per-status transition buttons (draft→confirm, confirmed→ordered, ordered→received).
- Route registered in `app.routes.ts` (`canMatch: [capabilityRouteGuard]`, `data: { pageKey: 'supply', capabilities: ['procurement:read'] }`); nav item in `nav-categories.ts` given the same capability (route path/pageKey/label were already scaffolded pre-TZ).
- `docs/pages/supply.page.md` — new NX S1 section (routes, data-access API table, UI, known_limitation, tests); legacy quick/registry content left untouched as cutover reference.
- `docs/DOMAIN-MAP.md`, `docs/pages/PAGE-TZ-INDEX.md`, `docs/agent-checklists/WAVE-NX-SUPPLY.md`, `docs/agent-checklists/_NOW.md` — Supply row/status updated to reflect S1 live.

## Architectural decision (SupplyTask vs SupplyRequest)

Confirmed via direct reads that legacy's real (non-mock) `/supply?view=registry` mode already uses `SupplyTaskService`, not `SupplyRequest` — and the TZ's AC wording (confirm/ordered/received, explode from order composition) matches `SupplyTask`'s exact action set. `SupplyRequest` (separate entity, ad-hoc quick-order created by S0's kit-reserve shortfall path) is out of scope for S1 — it is S2's concern ("hub confirm + S0 kit-reserve API").

## Known limitation (pre-existing backend gap, not invented here)

Neither `SupplyTaskService.markReceived` nor `SupplyRequestService.markReceived` write a `StockMovement` on the backend — receiving a supply task does not reflect in the warehouse ledger. Documented in `docs/pages/supply.page.md`; not worked around or masked in the NX frontend.

## Test-infra note (reusable pattern)

`supply.page.spec.ts` required a real `Router` (`provideRouter([])` + a `navigate` spy via `jest.spyOn`) instead of a bare `{ navigate: jest.fn() }` stub, because the template's `[routerLink]` (order link) exercises `RouterLink` internals (`createUrlTree`, `router.events`) that a minimal stub does not satisfy. Provider order matters: `provideRouter([])` must be listed before a custom `{ provide: ActivatedRoute, useValue: ... }` override, otherwise the router's own root `ActivatedRoute` provider wins.

## Scope disclosure

- No `warehouse/**`, `Purchase*`, or `desktop/**` files touched.
- `SupplyRequest` data-access (pre-existing from TZD-69) left untouched — not part of S1's registry.

## Commit

- see git log
