# TZ-NX-ORDER-WS-FACADE-SHELL checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-ORDER-WS-FACADE-SHELL.md` (removed on closeout)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-15T15:49:36Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in this environment)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — только Freebuff `TZ-NX-HOME-BREADCRUMB-EDIT-CTA`, disjoint conflict keys
- [x] TZ / audit / WAVE-MAP / tracker / `order-hub.facade.ts` pattern / current `order-detail.page.ts` + spec read
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-ORDER-WS-FACADE-SHELL.md` на месте

## Acceptance

- [x] Lib + secondary path `@kppdf/features/order-workspace` (tsconfig.base.json)
- [x] providers page-scoped (`providers: [OrderWorkspaceFacade]` on the page's own `@Component`, not `providedIn: 'root'`)
- [x] Existing paid toggle + load still work — verified: original `order-detail.page.spec.ts` (8 tests) passes **unmodified** against the refactored page
- [x] Visible section placeholders with short RU titles: Состав / Исполнение / Логистика / Документы (empty hosts for the latter three, no disabled-CTA banner)
- [x] `nx build kppdf-web` LAST PASS; focused specs PASS
- [x] Archive + commit своих файлов

## Integrity slot

- [x] Тип изменения: page + new feature-lib module (same route `/orders/:id`, same fields, additive empty sections — no capability change)
- [x] FIC §A–E: N/A — internal decomposition + additive empty placeholders, no new write-path
- [x] page.md: `docs/pages/orders.page.md` updated — short "TZ1 DONE" note (pre-existing wave-pointer section from the audit process left as-is)
- [x] DOMAIN-MAP / SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (zero overlap with Freebuff's home/order-hub-tray claim, verified before + after)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity

- [x] Baseline `nx build kppdf-web` green (verified earlier this session, B10 chain)
- [x] `_active/` had only Freebuff's disjoint claim before my claim
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

- `nx test kppdf-web` (full 555-test suite, same pattern-flag caveat as every TZ this session) — **PASS** for `order-detail.page.spec.ts` (all 8 original tests, spec file **not modified**). Same 2 unrelated pre-existing `app-shell.component.spec.ts` failures as every prior TZ this session.
- `nx build kppdf-web` — **PASS**, exit 0 on first attempt. Same pre-existing Angular/budget warnings as baseline.
- `nx lint kppdf-web` + `nx lint features` — baseline FAIL (pre-existing lazy-boundary violations, same pattern as every prior TZ this session — the page's static `@kppdf/features/order-workspace` import triggers the same rule every other feature-lib page import already does). Zero new issues: `order-workspace.facade.ts` doesn't appear in the `features` lint output at all.

## Executor report

- Created `libs/features/src/lib/order-workspace/` (`order-workspace.facade.ts` + `index.ts`) and registered the `@kppdf/features/order-workspace` secondary path in `tsconfig.base.json` (same pattern as `order-hub`/`doc-studio`/`supply`).
- `OrderWorkspaceFacade` owns: `order`/`paid`/`status`/`error` signals, `load()`, `setPaid()` (optimistic PATCH + revert-on-failure, unchanged), `bannerTone()`, `counterpartyName()`/`siteName()`/`quotationId()`/`quotationNumber()`, `openQuotationInStudio()` — moved as-is from the page, zero logic changes.
- **Deliberately kept off the facade:** `orderStatusLabel` (from `./order-status.ts`) — that file is also used by `orders-list.page.ts` and `home.page.ts`, both outside this TZ's conflict keys; moving it into the lib would've required touching those two unrelated pages to update their imports (libs can't import from apps, so the shared helper would've had to move one direction or the other). Left it as a plain page-local import — it's a pure `status → RU label` function with no state/DI, so there's no cost to leaving it on the page.
- Thinned `order-detail.page.ts` (222 → 154 LOC counting the original inline version, now 154 LOC total): template restructured into five labeled section hosts (`order-ws-header`/`-composition`/`-execution`/`-logistics`/`-documents`) — Шапка and Состав render today's exact content (renamed heading "Позиции"→"Состав" per the audit's canonical section names; no test depended on the old label), Исполнение/Логистика/Документы are genuinely empty hosts with just an `<h2>` RU title, per AC's "empty host, no disabled CTA" instruction.
- `providers: [OrderWorkspaceFacade]` is page-scoped (component-level `providers` array, not `providedIn: 'root'`).
- **No spec changes needed** — `order-detail.page.spec.ts` is fully black-box (DOM queries + service mocks only, no `componentInstance` field access), so it passed unmodified once the facade injected the same four services (`PiOrdersService`, `PiToastService`, `Router`, `ActivatedRoute`) the original page used, resolved from the same TestBed providers via Angular's DI hierarchy.
- Verified zero overlap with the concurrently-claimed `TZ-NX-HOME-BREADCRUMB-EDIT-CTA` (Freebuff) both before starting and again before archiving.

## Closeout

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T15:51:02Z

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
  - progress.md: N/A (refactor-only, additive empty sections)
  - status synchronization: PASS
