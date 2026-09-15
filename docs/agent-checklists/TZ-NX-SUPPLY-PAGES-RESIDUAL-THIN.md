# TZ-NX-SUPPLY-PAGES-RESIDUAL-THIN checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-SUPPLY-PAGES-RESIDUAL-THIN.md` (removed on closeout)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-15T15:18:46Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in this environment)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — `_active` пуст, no conflicting claim (Freebuff's `TZ-NX-HOME-BREADCRUMB-EDIT-CTA` doesn't overlap)
- [x] TZ / `supply.page.ts` / `supply-requests.page.ts` / `supply.facade.ts` / `supply/ui/index.ts` read
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SUPPLY-PAGES-RESIDUAL-THIN.md` на месте

## Acceptance

- [x] `supply.page.ts` create-form extracted to dumb UI (was still fat: 82-line inline form)
- [x] `supply-requests.page.ts` reviewed — no extraction: create/edit/receive already delegate to existing feature-lib dialog components (`SupplyRequestFormDialogComponent`/`SupplyRequestReceiveDialogComponent`); remaining ~322 lines is table markup + facade delegates, same shape as already-thinned list pages elsewhere (registries, counterparties)
- [x] No status/transition rule changes
- [x] supply* specs green
- [x] `nx build kppdf-web` — last gate, exit 0

## Integrity slot

- [x] Тип изменения: page (internal refactor, no route/behavior change)
- [x] FIC §A–E: N/A — pure internal decomposition
- [x] page.md / PAGE-TZ-INDEX: N/A
- [x] DOMAIN-MAP / SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity

- [x] Baseline `nx build kppdf-web` green (verified earlier this session)
- [x] `_active/` был пуст перед claim
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

- `nx test kppdf-web` (full 555-test suite — pattern-flag filtering doesn't work with this project's `@nx/jest:jest` executor, same as prior TZ this session) — **PASS** for `supply.page.spec.ts` + `supply-requests.page.spec.ts`. Same 2 unrelated pre-existing `app-shell.component.spec.ts` failures (nav quicknav chip count drift) as the prior TZ this session — untouched by this change.
- `nx build kppdf-web` — **PASS**, exit 0. Hit and fixed one real compile error during implementation (see Executor report). Same pre-existing Angular/budget warnings as baseline.
- `nx lint kppdf-web` + `nx lint features` — baseline FAIL (pre-existing lazy-boundary violations, same lines/count pattern as before this TZ). Zero new issues: `supply-create-form.component.ts` doesn't appear in either lint output.

## Executor report

- **`supply.page.ts`** (434 → 367 LOC): extracted the inline create-form (explode-from-order + manual create, ~82 lines) into new `SupplyCreateFormComponent` (`libs/features/src/lib/supply/ui/supply-create-form.component.ts`, exported via `ui/index.ts`). `SupplyFacade`'s `explodeOrderId`/`createOrderId`/`createTitle`/`createQty` are plain mutable fields (not signals) — the original template used `[(ngModel)]` directly on them. The child component uses `input()`/`output()` (not `FormsModule`/`ngModel`) with explicit change events; the page still owns the actual field reads/writes (`(explodeOrderIdChange)="facade.explodeOrderId = $event"` etc.), so the value-flow is unchanged from the original inline binding — verified against `supply.page.spec.ts`'s two create/explode tests, which set `component.facade.xxx` directly and call `onExplode()`/click the submit button, never depending on the intermediate DOM round-trip. Dropped the now-unused `FormsModule` import from the page.
- **`supply-requests.page.ts`**: investigated, no change. Its create/edit/receive actions already open existing feature-lib dialog components (no inline form to extract); the remaining markup is the requests table + expand-in-row detail panel, which is genuine per-page UI composition, not misplaced logic — same shape as other already-thinned B1–B9 list pages.
- **Hit and fixed a real bug:** Angular template expressions don't have access to global functions (`Number(...)` isn't available in a template binding) — `(input)="createQtyChange.emit(Number(inputValue($event)))"` failed `nx build` with `TS2339: Property 'Number' does not exist on type 'SupplyCreateFormComponent'`. Moved the `Number()` conversion into a `protected onQtyInput(event: Event): void` method instead.

## Closeout

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T15:23:12Z

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (via nx build)
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing, zero new issues)
  - checklist: ADDED
  - progress.md: N/A (refactor-only)
  - status synchronization: PASS
