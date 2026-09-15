# TZ-NX-SHIPPING-PAGE-FACADE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-SHIPPING-PAGE-FACADE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T07:55:10Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Source-of-truth disclosure

The original TZ spec file (`tasks/_ready/2026-09-15-decomp-b5-composition-shipping-studio/TZ-NX-SHIPPING-PAGE-FACADE.md`)
was lost from disk before I could read it — an environment issue during
the session resume after a usage-limit reset: the whole `_ready/` pack
directories for both B4 and B5 emptied out (never git-tracked, so not
recoverable from history; B4's loss is harmless since it's fully
archived, but B5's S1/S2/P5 spec text is genuinely gone). Also found
`docs/agent-checklists/_NOW.md` and `WAVE-DECOMP-B5.md` had reverted to
stale pre-B4 content on disk (those ARE git-tracked — restored from git
log, no commits lost; see the C2 checklist for that correction).

Proceeded using `WAVE-MAP.md`'s goal line, fully read and captured
earlier in-session before it vanished: "S1 | L | shipping.page →
ShippingFacade in-place" — plus this session's own Facade-in-place
pattern, applied identically ~7 times already (Production/Order-hub/
Supply/Warehouse/Proposals/Role-form/Registry-forms). Created a
reconstructed `tasks/_active/TZ-NX-SHIPPING-PAGE-FACADE.md` marker
documenting this before touching any code (Claim protocol still
honored — the marker's content is reconstructed, not the claim
mechanics).

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (C2 archived `6495bc54`)
- [x] TZ / канон / deps прочитаны (WAVE-MAP.md goal line — TZ file itself lost, see disclosure above)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SHIPPING-PAGE-FACADE.md` на месте (reconstructed)

## What changed

Created `shipping.facade.ts` (`@Injectable()`, component-scoped via
`providers: [ShippingFacade]`). `ShippingPage` has no `@ViewChild` and no
`@Input()`/`input()` — a plain route page (order-id comes from
`route.queryParamMap`) — so the facade's own constructor safely
subscribes to `route.queryParamMap` (`takeUntilDestroyed`) and calls
`loadLookups()` directly, same pattern as `WarehousesFacade`/
`StockMovementsFacade`/`ProductionReadFacade`, no `bind()`-host
workaround needed. Moved every signal (`shipments`, `orders`,
`warehouses`, `status`, `error`, `busy`, `statusFilter`, `orderFilter`,
`expandedId`), the `orderFilterLabel` computed, and every method
(`load`, `openCreate`, `openEdit`, `openDoc`, `dispatch`,
`cancelShipment`, `markDelivered`, `statusLabel`, `fmtDate`,
`orderLabel`, `docTypeLabel`, `toggleExpand`, `onRowSpace`, filter-change
handlers, `loadOrders`, `loadLookups`) as-is. No behavior change; ship/
cancel/dispatch business rules unchanged.

Checked `shipping.page.spec.ts` before touching anything: it's purely
DOM/mock-based (`fixture.nativeElement.querySelector`, service-mock call
assertions) — zero `fixture.componentInstance['xxx']` bracket access.
Still aliased/delegated every member with its original name on the thin
`ShippingPage` host (matching `WarehousesPage`'s established shape)
rather than rewriting the template to `facade.xxx`, since the template
itself needed zero changes this way and it's consistent with every prior
TZ in this program.

Dialog: 453 → 285 LOC. New facade: 245 LOC.

## Acceptance

- [x] shipping.page.spec.ts + the 3 shipment dialog specs green (4/4 suites, 19/19 tests)
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal refactor, no shipping/dispatch rule change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, template unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (no route/UI change)
- [x] DOMAIN-MAP — N/A (no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: shipping.page.ts, shipping.facade.ts (new) + this checklist/tracker/task marker)
- [x] Coupling map — N/A (dispatch/cancel/ship semantics unchanged)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (confirmed before claim)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean on first run)
- `npx jest --config apps/kppdf-web/jest.config.ts apps/kppdf-web/src/app/pages/shipping/` → PASS (4/4 suites, 19/19 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → PASS (92/92 suites, 623/630 passed, 7 skipped, 0 failed)
- `pnpm architecture:check` → PASS (1537 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged)

## Executor report

Что сделано: механически вынес весь domain-state (Signals) и все load/
create/dispatch/cancel/edit/doc методы `ShippingPage` в новый
`ShippingFacade` — без изменения бизнес-правил отгрузки. Страница без
`@ViewChild`/`@Input()`, поэтому facade сам подписывается на
`route.queryParamMap` в конструкторе — паттерн уже устоялся в этой
программе. Спека чисто DOM-based, поэтому решение алиасировать все члены
под оригинальными именами (а не переписывать template на `facade.xxx`)
было не строго обязательным, но выбрано для консистентности с
предыдущими TZ.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал. TZ spec-файл этой задачи был
физически утерян до прочтения (см. раздел «Source-of-truth disclosure»
выше) — работал по WAVE-MAP.md goal line + установленному паттерну.

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
