# TZ-NX-SUPPLY-S1-PAGE checklist — NX `/supply` реестр (без mock)

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-SUPPLY-S1-PAGE.done.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T22:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

## Preflight

- [x] `git status`/`tasks/_active/` empty before claim (WAVE-NX-WAREHOUSE W1-W4 all DONE; Freebuff idle)
- [x] S0 DONE (`285a4c2d`); W1 SHELL DONE (`/supply` nav entry already scaffolded in `nav-categories.ts`, route not yet registered)
- [x] TZ read, legacy `frontend/src/app/pages/supply/**` + services read, backend `supply-task.{controller,service,schema}.ts` + DTOs read, existing NX `libs/data-access/src/lib/supply/pi-supply-requests.service.ts` read

### Preflight Check Output
- **Context read:** `tasks/_ready/nx-supply/TZ-NX-SUPPLY-S1-PAGE.md`, `docs/pages/supply.page.md`, `frontend/src/app/pages/supply/supply.page.ts` (both quick-mock and registry modes), `frontend/src/app/shared/services/pi-supply.service.ts`, `backend/src/modules/supply/{supply-task.controller,supply-task.service,supply-task.schema}.ts`, `backend/src/modules/supply/dto/create-supply-task.dto.ts`, `frontend-nx/libs/data-access/src/lib/supply/*` (existing SupplyRequest-only client), `frontend-nx/apps/kppdf-web/src/app/app.routes.ts` + `layout/nav-categories.ts` (supply nav item already scaffolded, no route yet), `frontend-nx/libs/data-access/src/lib/capabilities/capabilities.metadata.ts` (`procurement:read`/`write` already defined), `frontend-nx/libs/ui/paper-and-ink/src/lib/pi-table.component.ts` (rowActions/cellTemplates API)
- **Key Constraints:** registry-only (no quick-order mock port — that's the explicit AC1 ban); reuse `SupplyTaskService` shape 1:1 (legacy's real, non-mock registry already uses SupplyTask, not SupplyRequest); no backend/warehouse/Purchase*/desktop changes
- **Planned Deliverable:** new NX `PiSupplyTasksService` (mirrors legacy `SupplyTaskService`) + `/supply` page (list/filters/orderId-deep-link/create/explode/confirm-ordered-received) + route + nav capability + page.md NX section
- **Validation Path:** focused Jest (service + page) + app typecheck/lint + architecture check + final `nx build kppdf-web`

**Проверено:** legacy `/supply`'s real (non-mock) registry mode already uses `SupplyTaskService`, not `SupplyRequest` — confirms which BE entity this TZ's AC (title/material, order link, qty, status, confirm/ordered/received) refers to. `SupplyRequest` (separate entity, already has a read-only NX client from TZD-69 Desktop Excel) is the S0 kit-reserve shortfall target — S2 note explicitly pairs "hub confirm + S0 kit-reserve API", so `SupplyRequest` surfacing is S2's concern, not S1's registry rewrite. Neither `SupplyTaskService.markReceived` nor `SupplyRequestService.markReceived` write a `StockMovement` — confirmed known_limitation for step 3, documented in page.md, not invented in FE.

---

## Acceptance (из TZ)

- [x] Нет in-memory mock seed как продуктовый путь (registry-only page, no quick-order port — verified: no `supply-quick-order` import in NX, no `[data-test="supply-view-quick"]`/`supply-view-registry"` in page).
- [x] `?orderId=` filter + status transitions (confirm/ordered/received).
- [x] `nx build` PASS + tests.

## Integrity slot

- [x] Type: page + data-access
- [x] `docs/pages/supply.page.md` — NX S1 section added; legacy quick/registry stays documented as-is (cutover reference)
- [x] `docs/DOMAIN-MAP.md` — Supply row NX FE column (currently `WAVE READY`) updated to live once route exists
- [x] `docs/pages/PAGE-TZ-INDEX.md` — `/supply` row gets an S1 DONE note
- [x] Chrome nav «Снабжение» — capability added to the already-scaffolded item, no new category
- [x] No warehouse/Purchase*/desktop files touched

## Gates (факт)

- [x] Focused Jest — `pi-supply-tasks.service.spec.ts` (8/8 PASS), `supply.page.spec.ts` (9/9 PASS)
- [x] `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — clean
- [x] `cd frontend-nx && pnpm exec tsc -p libs/data-access/tsconfig.lib.json --noEmit` — clean
- [x] Changed-path ESLint — clean (all S1 files)
- [x] `pnpm architecture:check` (1451 files; baseline 17, 2 resolved) + `pnpm architecture:check:nx` (393 files, 0 violations) — both PASS
- [x] Full `nx test data-access` — 21/21 suites, 103/103 tests PASS
- [x] Full `nx test kppdf-web` — only pre-existing known `app-shell.component.spec.ts` failures remain (N/A, unrelated to S1)
- [x] Final `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS (only pre-existing known warnings: Studio NG8102, Gantt CSS budget)

## Executor report

- New NX `PiSupplyTasksService` (`frontend-nx/libs/data-access/src/lib/supply/{supply-task.types,pi-supply-tasks.service}.ts` + spec) mirrors legacy `SupplyTaskService` 1:1 (list/create/explode/update/confirm/markOrdered/markReceived/remove) via `SilentResult` pattern.
- New `/supply` page (`frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.ts` + spec) — live SupplyTask registry only, no quick-order mock port. Manual CSS-grid table (current NX convention, matches `storage-items.page.ts`), status filter, `?orderId=` deep-link filter with clear chip, explode-from-order + manual create form, per-status transition buttons (confirm/ordered/received).
- Route registered in `app.routes.ts` (`canMatch: [capabilityRouteGuard]`, `data: { pageKey: 'supply', capabilities: ['procurement:read'] }`); nav item in `nav-categories.ts` given the same capability (route/pageKey/label were already scaffolded).
- `known_limitation` (pre-existing BE gap, not invented here): neither `SupplyTaskService.markReceived` nor `SupplyRequestService.markReceived` write a `StockMovement` — documented in `docs/pages/supply.page.md`, not worked around in the frontend.
- Test-infra note: `supply.page.spec.ts` needed a real `Router` (`provideRouter([])` + `navigate` spy) instead of a bare `{ navigate: jest.fn() }` stub, because the template's `[routerLink]` (order link) exercises `RouterLink` internals (`createUrlTree`, `router.events`) that a minimal stub doesn't satisfy — this is a reusable pattern for any future NX page spec that combines a mocked `Router` with real `routerLink` rendering.
- Gates all green (see above); no other agents'/TZs' files touched.

## Closeout

- [x] Archive + remove active marker
- [x] Status = DONE
- closed_at: 2026-09-05T22:32:12+03:00
- commit SHA: `9680c441`
