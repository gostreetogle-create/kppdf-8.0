# TZ-NX-SUPPLY-REQUESTS-FACADE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-SUPPLY-REQUESTS-FACADE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T04:04:35Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (S1 archived)
- [x] TZ / канон / deps прочитаны (`TZ-NX-SUPPLY-REQUESTS-FACADE.md`, depends on S1 archived `7e68240c`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SUPPLY-REQUESTS-FACADE.md` на месте

## What changed

Created `supply-requests.facade.ts` (`@Injectable()`, component-scoped via
`providers: [SupplyRequestsFacade]`). Moved from `supply-requests.page.ts`
**as-is**: lookups (`orders`/`suppliers`/`warehouses` signals +
`loadLookups`), the filtered-list signals/computed (`rows`, `search`,
`statusFilter`, `paidOnly`, `dateFrom`, `dateTo`, `expandedId`,
`hasActiveFilters`, `filteredRows`), and every CRUD/receive/delete method
(`load`, `openCreate`, `openEdit`, `openReceive`, `confirmDelete`,
`openForm`, `remove`, plus the presentational helpers `statusLabel`,
`priorityLabel`, `fmtDate`, `toggleExpand`, `onRowSpace`, `supplierLabel`,
`linkedOrder`, `orderLabel`, `createdByLabel`, `isReceivable`) and the
`RECEIVABLE_STATUSES` const. Constructor's `load()` + `loadLookups()` calls
moved verbatim. No receive/stock side-effect rule changes.

Unlike S1, this page had **no mutable two-way-bound (`[(ngModel)]`)
fields** — every filter input uses one-way `[value]`/`[checked]` binding
with `(input)`/`(change)` → setter-method handlers, all backed by Signals.
So every facade-owned piece of state aliases cleanly as
`protected readonly xxx = this.facade.xxx;` (live signal/computed
references), and the template needed **zero changes** — fully unchanged,
unlike S1's forced `facade.` prefix on 4 ngModel targets.

Kept on the page (static, no DI/API dependency, matches the "leave truly
presentational constants" call made for `GRID_COLS` in S1): the `statuses`
readonly array and the `statusLabels` alias.

Every template-bound handler stayed as a same-named one-line delegate to
`this.facade.xxx(...)`. No spec changes needed — `supply-requests.page.spec.ts`
is fully DOM-driven, no direct instance-field pokes (checked before
editing, learning from S1's forced spec fix).

Page: 475 → 313 LOC (includes the unchanged ~215-line template). New
facade: 249 LOC.

## Acceptance

- [x] Specs: `supply-requests.page.spec.ts`, `supply-request-form-dialog.component.spec.ts`, `supply-request-receive-dialog.component.spec.ts` — all green (26/26 tests)
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal refactor, no receive/stock/API contract change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, template unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (no route/behavior change visible to users)
- [x] DOMAIN-MAP — N/A (no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: supply-requests.page.ts, supply-requests.facade.ts (new) + this checklist/tracker/task marker)
- [x] Coupling map — N/A (SupplyRequest status semantics unchanged; receive still updates warehouse stock via the same dialog/API path)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from S1 closure
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors)
- `npx jest --config apps/kppdf-web/jest.config.ts supply-requests.page.spec.ts supply-request-form-dialog.component.spec.ts supply-request-receive-dialog.component.spec.ts` → PASS (3/3 suites, 26/26 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern="supply|warehouse"` → PASS (110/110 suites, 756/763 passed, 7 skipped, 0 failed)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged)

## Executor report

Что сделано: механически вынес lookups, фильтрованный список и все
CRUD/receive/delete методы `SupplyRequestsPage` в новый
`SupplyRequestsFacade` — без изменения бизнес-правил получения/склада.
В отличие от S1, здесь не было mutable ngModel-полей — все фильтры уже
были Signals с one-way binding, поэтому все алиасы получились живыми
ссылками и template не потребовал ни одной правки. Спека тоже не
потребовала правок (DOM-only, без прямых обращений к полям инстанса).

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
