# TZ-NX-SUPPLY-TO-FEATURES checklist

> Status: **DONE (scoped)**
> Marker: `tasks/_active/TZ-NX-SUPPLY-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T04:08:02Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (S2 archived)
- [x] TZ / канон / deps прочитаны (`TZ-NX-SUPPLY-TO-FEATURES.md`, depends on S2 archived `4533da8b`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SUPPLY-TO-FEATURES.md` на месте

## Scope deviation — disclosed, with rationale (same class as TZ-NX-ORDER-HUB-UI-FEATURES)

Investigated every relative import in both page folders before moving
anything:

- `supply.page.ts` / `supply.facade.ts` — only relative dependency is
  `../on-dialog-close-once` (19 LOC, pure Angular-DI helper, already
  duplicated once before into `libs/features/src/lib/doc-studio/ui/` for
  the identical reason). **Clean to move** — duplicated it into
  `libs/features/src/lib/supply/ui/` (mirroring the doc-studio precedent's
  placement) and moved `supply.facade.ts` to the lib root.
- `supply-requests.page.ts` / `supply-requests.facade.ts` /
  `supply-request-form-dialog.component.ts` — transitively need
  `MaterialFormDialogComponent`
  (`../registries/dialogs/material-form-dialog.component`, **734 LOC**),
  which is also consumed by `material-registry-dialog-host.ts` (registries
  domain) and `storage-put-on-stock-dialog.component.ts` (warehouse domain,
  upcoming in Stream W) — a real, substantial, actively cross-domain-shared
  component, not a small pure helper. Moving these three files would force
  the lib to import a 734-line component from the app, or duplicate it
  (real drift risk, unlike the 19-line `on-dialog-close-once.ts`). **Stayed
  in the app**, same call as `TZ-NX-ORDER-HUB-UI-FEATURES` made for
  `order-hub-tray.component.ts`/`CompositionTreeComponent`.
- `supply-request-receive-dialog.component.ts` (+ spec) — zero relative
  imports, fully self-contained. **Clean to move** — moved to
  `libs/features/src/lib/supply/ui/`.

`supply-request-formatters.ts` (29 LOC, used by `supply-requests.page.ts`
**and** `product-passports.registry.ts` — a third, unrelated domain) was
**not** duplicated, since nothing that actually moved into
`libs/features/src/lib/supply/` needs it (only the non-moved
supply-requests page/facade/form-dialog do, and they keep importing the app
original unchanged).

## What changed

- `supply.facade.ts` → `libs/features/src/lib/supply/supply.facade.ts` (lib root)
- `supply-request-receive-dialog.component.ts` (+ spec) → `libs/features/src/lib/supply/ui/`
- New: `libs/features/src/lib/supply/ui/on-dialog-close-once.ts` (duplicate, not a move — app original stays for its ~20 other unrelated consumers)
- New barrels: `supply/index.ts`, `supply/ui/index.ts`
- New tsconfig path `@kppdf/features/supply`
- `supply.page.ts` — `SupplyFacade` import switched to `@kppdf/features/supply`
- `supply-requests.facade.ts` — `SupplyRequestReceiveDialogComponent` import switched to `@kppdf/features/supply`
- `supply-requests.page.spec.ts` — same import switch
- `supply-requests.page.ts`, `supply-requests.facade.ts`,
  `supply-request-form-dialog.component.ts` (+ spec) — **unchanged content**, stay in app

## Acceptance

- [x] All supply* specs green — features lib 22/22 suites (241/241 tests, incl. the moved receive-dialog spec); kppdf-web supply|warehouse pattern 109/109 suites (751/758 passed, 7 skipped, 0 failed)
- [x] nx build last 0 (bundle unchanged, 503.38 kB — confirmed `SupplyFacade` is not provided eagerly at the route level, unlike A4's `ProductionReadFacade`, so no barrel/eager-import risk here)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal relocation, scoped down from the TZ's literal text per the disclosed rationale above)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface; `/supply` and `/supply-requests` route/behavior unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (no UI/route change)
- [x] DOMAIN-MAP — N/A (module boundary moved for facade + 1 dialog only)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: libs/features/src/lib/supply/**, frontend-nx/tsconfig.base.json, supply.page.ts, supply-requests.facade.ts, supply-requests.page.spec.ts + this checklist/tracker/task marker)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from S2 closure
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors)
- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors)
- `pnpm architecture:check` → PASS (1507 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx test features` → PASS (22/22 suites, 241/241 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern="supply|warehouse"` → PASS (109/109 suites, 751/758 passed, 7 skipped, 0 failed)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged; confirmed no eager route-level `SupplyFacade` provider)

## Executor report

Что сделано: перенёс `SupplyFacade` (лib root) и самодостаточный
`SupplyRequestReceiveDialogComponent` (`ui/`) в
`libs/features/src/lib/supply/`, с дублированием крошечного
`on-dialog-close-once.ts` (тот же паттерн, что уже применён в doc-studio).
`supply-requests.facade.ts` / `supply-request-form-dialog.component.ts`
остались в app — их транзитивная зависимость от 734-строчного
`MaterialFormDialogComponent`, шаренного ещё с двумя доменами, делает
полный перенос архитектурно нечистым; решение и обоснование
задокументированы выше со ссылкой на идентичный прецедент
`TZ-NX-ORDER-HUB-UI-FEATURES`.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: `supply-requests.facade.ts` / `supply-request-form-dialog.component.ts`
остаются в `apps/kppdf-web` — полный перенос требует либо переноса
`MaterialFormDialogComponent` в общий features lib (отдельная задача,
затрагивает `material-registry-dialog-host.ts` и `storage-put-on-stock-dialog.component.ts`),
либо согласия дублировать 734+ LOC компонент (не рекомендую).

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE (scoped, see deviation note above)
- closed_at: 2026-09-15
