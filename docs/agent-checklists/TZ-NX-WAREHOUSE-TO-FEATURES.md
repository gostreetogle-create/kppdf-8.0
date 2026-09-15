# TZ-NX-WAREHOUSE-TO-FEATURES checklist

> Status: **DONE (scoped)**
> Marker: `tasks/_active/TZ-NX-WAREHOUSE-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T04:19:27Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (W1 archived)
- [x] TZ / канон / deps прочитаны (`TZ-NX-WAREHOUSE-TO-FEATURES.md`, depends on W1 archived `ea3c4405`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-WAREHOUSE-TO-FEATURES.md` на месте

## Scope deviation — disclosed, same class as TZ-NX-ORDER-HUB-UI-FEATURES / TZ-NX-SUPPLY-TO-FEATURES

Investigated every relative import in all 3 facades + 4 dialogs before moving anything:

- `warehouses.facade.ts` — only relative dep: `../on-dialog-close-once`
  (duplicable). Its dialog, `warehouse-form-dialog.component.ts`, has zero
  relative imports. **Both clean to move.**
- `stock-movements.facade.ts` — same: only `on-dialog-close-once`. Its
  dialog, `stock-movement-form-dialog.component.ts`, has zero relative
  imports. **Both clean to move.**
- `storage-items.facade.ts` — opens `StoragePutOnStockDialogComponent`,
  which transitively needs `MaterialFormDialogComponent`
  (`../registries/dialogs/material-form-dialog.component`, **734 LOC**,
  also consumed by `material-registry-dialog-host.ts` and
  `supply-request-form-dialog.component.ts` — the exact same file that
  blocked `TZ-NX-SUPPLY-TO-FEATURES`). **Stayed in the app**, same
  reasoning as every prior features-move TZ in this program.
  `storage-adjust-dialog.component.ts` (itself clean — zero relative
  imports, sole consumer is `storage-items.facade.ts`) was kept alongside
  it rather than split out alone, so the single combined
  `storage-dialogs.spec.ts` covering both dialogs didn't need to fragment
  across two locations.

## What changed

- `warehouses.facade.ts` → `libs/features/src/lib/warehouse/warehouses.facade.ts` (lib root)
- `stock-movements.facade.ts` → `libs/features/src/lib/warehouse/stock-movements.facade.ts` (lib root)
- `warehouse-form-dialog.component.ts` (+ spec) → `libs/features/src/lib/warehouse/ui/`
- `stock-movement-form-dialog.component.ts` (+ spec) → `libs/features/src/lib/warehouse/ui/`
- New: `libs/features/src/lib/warehouse/ui/on-dialog-close-once.ts` (duplicate, same pattern as doc-studio/supply)
- New barrels: `warehouse/index.ts`, `warehouse/ui/index.ts`
- New tsconfig path `@kppdf/features/warehouse`
- `warehouses.page.ts`, `stock-movements.page.ts` — `xxxFacade` import switched to `@kppdf/features/warehouse`
- `warehouses.page.spec.ts`, `stock-movements.page.spec.ts` — dialog import switched to `@kppdf/features/warehouse`
- `storage-items.facade.ts`, `storage-items.page.ts` (+ spec),
  `storage-put-on-stock-dialog.component.ts`, `storage-adjust-dialog.component.ts`,
  `storage-dialogs.spec.ts` — **unchanged content**, stay in app

## Acceptance

- [x] Warehouse specs green — features lib 24/24 suites (247/247 tests, incl. the 2 moved dialog specs); kppdf-web supply|warehouse pattern 107/107 suites (745/752 passed, 7 skipped, 0 failed)
- [x] nx build last 0 (bundle unchanged, 503.38 kB — confirmed both facades are consumed only via lazy `loadComponent`, no eager route-level provider, unlike A4's `ProductionReadFacade`)
- [x] B2 DONE — all 5 TZs (S1–S3, W1–W2) closed; tracker below

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal relocation, scoped down from the TZ's literal text per the disclosed rationale above)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface; `/warehouses`, `/storage-items`, `/stock-movements` route/behavior unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (no UI/route change)
- [x] DOMAIN-MAP — N/A (module boundary moved for 2 of 3 facades + their dialogs only)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: libs/features/src/lib/warehouse/**, frontend-nx/tsconfig.base.json, warehouses.page.ts/.spec.ts, stock-movements.page.ts/.spec.ts + this checklist/tracker/task marker)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from W1 closure
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors; first run caught 2 missed dialog-import path fixes in the facades themselves, fixed, reran clean)
- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors)
- `pnpm architecture:check` → PASS (1513 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx test features` → PASS (24/24 suites, 247/247 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern="supply|warehouse"` → PASS (107/107 suites, 745/752 passed, 7 skipped, 0 failed)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged; confirmed both moved facades are lazy-only, no eager route provider)

## Executor report

Что сделано: перенёс `WarehousesFacade` + `WarehouseFormDialogComponent` и
`StockMovementsFacade` + `StockMovementFormDialogComponent` (оба —
lib root + `ui/`) в `libs/features/src/lib/warehouse/`, с дублированием
крошечного `on-dialog-close-once.ts`. `storage-items.facade.ts` и оба
storage-диалога остались в app — транзитивная зависимость от того же
734-строчного `MaterialFormDialogComponent`, что уже блокировал перенос в
`TZ-NX-SUPPLY-TO-FEATURES`; решение и обоснование задокументированы выше.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: `storage-items.facade.ts` / оба storage-диалога остаются в
`apps/kppdf-web` — полный перенос требует переноса
`MaterialFormDialogComponent` в общий features lib (отдельная задача,
затрагивает как минимум 3 домена) или дублирования 734+ LOC компонента (не
рекомендую).

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE (scoped, see deviation note above)
- closed_at: 2026-09-15
