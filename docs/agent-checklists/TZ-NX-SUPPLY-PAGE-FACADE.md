# TZ-NX-SUPPLY-PAGE-FACADE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-SUPPLY-PAGE-FACADE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T03:57:52Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (B1 wave complete, verified by Cursor)
- [x] TZ / канон / deps прочитаны (`TZ-NX-SUPPLY-PAGE-FACADE.md`, `WAVE-MAP.md`, `PROMPT-CLAUDE-B2-CONTINUOUS.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SUPPLY-PAGE-FACADE.md` на месте

## What changed

Created `supply.facade.ts` (`@Injectable()`, component-scoped via
`providers: [SupplyFacade]`). Moved from `supply.page.ts` **as-is** every
domain signal (`statusFilter`, `orderFilterId`, `tasks`, `orders`, `status`,
`error`, `busyId`, `showCreate`, `creating`, `exploding`, `expandedId`),
the 4 mutable inline-create form fields (`createOrderId`, `explodeOrderId`,
`createTitle`, `createQty`), and every method (`load`, `onExplode`,
`onCreate`, `onConfirm`, `onUnconfirm`, `onOrdered`, `onReceived`,
`onStatusChange`, `clearOrderFilter`, `statusLabel`, `orderLabel`,
`orderFilterLabel`, `orderLineLabel`, `fmtDate`, `toggleExpand`,
`onRowSpace`, `loadOrders`) plus the `STATUS_LABELS` map and
`looksLikeObjectId` helper. Constructor's `queryParamMap` subscribe +
initial `loadOrders()` call moved verbatim. No status label or transition
rule changes.

**Signals** aliased on the page as `protected readonly xxx = this.facade.xxx;`
(live references, matches every prior TZ's convention). **The 4 mutable
plain fields cannot be aliased the same way** — a signal alias shares the
same function reference, but `protected readonly x = this.facade.x` for a
plain `string`/`number` field would just copy the value once at
construction, silently decoupling the page's copy from the facade's (a
real behavior bug, not just a lint nit). Fixed by changing the template's 4
`[(ngModel)]` targets from `explodeOrderId`/`createOrderId`/`createTitle`/
`createQty` to `facade.explodeOrderId`/etc. (and the one plain read,
`!explodeOrderId` in the explode button's `[disabled]`, to
`!facade.explodeOrderId`) — Angular template expressions support dotted
property paths in two-way bindings natively; this is the only template
change in this TZ, everything else stayed byte-for-byte identical.

Every template-bound handler stayed as a same-named one-line delegate to
`this.facade.xxx(...)` (matches A1/A3/B1 convention).

**Spec fix (required, not optional):** `supply.page.spec.ts` had two tests
that set `component.explodeOrderId`/`component.createOrderId`/`createTitle`/
`createQty` directly on the page instance via an `as unknown as {...}` cast,
then triggered the action. Since those fields no longer exist on the page
(moved to the facade), fixed both tests to reach through
`component.facade.xxx` instead — the only spec change in this TZ, and it
reflects the real (intentional) architecture change, not a workaround.

**Extraction of the inline create-form UI to a dumb component — PARKed**
(TZ text: "prefer... if it shrinks page cleanly", i.e. optional, not
required). The form's two-way-bound fields, disabled-state wiring, and the
title/qty reset-on-success timing (async, inside the create API's success
callback) would all need re-wiring through Input/Output/ViewChild if
extracted, and the ROI (page is already ~430 LOC after the facade move,
well within a reasonable size) didn't clearly outweigh the risk of a subtle
reset/disabled-state regression in this L-size TZ. Can be revisited in S3
(`TZ-NX-SUPPLY-TO-FEATURES`) if still wanted once the page moves to
`libs/features`.

Page: 627 → 434 LOC (includes the unchanged ~330-line template). New
facade: 281 LOC.

## Acceptance

- [x] Spec: `supply.page.spec.ts` green (21/21 tests, including the 2 fixed)
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal refactor, no status/transition/API contract change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, mechanical extract + 1 documented template edit)
- [x] page.md / PAGE-TZ-INDEX — N/A (no route/behavior change visible to users)
- [x] DOMAIN-MAP — N/A (no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: supply.page.ts, supply.page.spec.ts, supply.facade.ts (new) + this checklist/tracker/task marker)
- [x] Coupling map — N/A (SupplyTask status semantics unchanged)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (confirmed before claim, B1 wave state)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB, same pre-existing overage)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors)
- `npx jest --config apps/kppdf-web/jest.config.ts supply.page.spec.ts` → PASS (21/21 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern="supply|warehouse"` → PASS (110/110 suites, 756/763 passed, 7 skipped, 0 failed)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged)

## Executor report

Что сделано: механически вынес весь domain-state и API-методы `SupplyPage`
в новый `SupplyFacade` — без изменения статус-лейблов, переходов статусов
или API-контрактов. Единственная правка template — 4 `[(ngModel)]`
таргета переведены на `facade.xxx`, т.к. mutable-поля (не signals) нельзя
алиасить как живую ссылку. Обновил 2 теста в спеке, которые напрямую
писали в поля компонента (`component.explodeOrderId = ...`) — переключил
на `component.facade.explodeOrderId`, поведение (клики/API-вызовы) не
менялось.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: inline create-form UI extraction — PARK, см. обоснование
выше; можно вернуться в S3.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
