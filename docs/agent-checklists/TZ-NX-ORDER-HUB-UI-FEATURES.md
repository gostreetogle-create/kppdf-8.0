# TZ-NX-ORDER-HUB-UI-FEATURES checklist

> Status: **DONE (scoped)**
> Marker: `tasks/_active/TZ-NX-ORDER-HUB-UI-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T03:29:54Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (B1 order-hub-facade archived)
- [x] TZ / канон / deps прочитаны (`TZ-NX-ORDER-HUB-UI-FEATURES.md`, depends on B1 archived `8261af25`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-ORDER-HUB-UI-FEATURES.md` на месте

## Scope deviation — disclosed, with rationale

The TZ says: "move facade + tray UI + tray-local dialogs + specs." Investigated
before moving anything and found the move is **not fully clean**:

- `order-hub.facade.ts` and `order-hub-tray.component.ts` both need
  `CompositionTreeComponent` (`../composition/composition-tree.component`,
  172 LOC) — the tray renders it in its template
  (`<pi-composition-tree [root]="root" ... />`), the facade needs its
  `CompositionTreeSelectEvent` type. That component is **not order-hub-local**
  — `composition-panel.component.ts` (a different domain) also consumes it.
  Moving the tray+facade to `libs/features/src/lib/order-hub/` would force
  the lib to import a real, actively-shared 172-line component from the app
  — exactly the "no app imports inside features lib" rule this and every
  prior TZ in the pack enforces. Duplicating a real, actively-maintained
  172-line component (not a 15-line pure helper) creates a genuine drift
  risk, unlike A4's `ProductionCockpitContext` or B1's tiny label/dialog-close
  utils.
- `order-hub-tray.component.ts` / `order-hub.facade.ts` also use two small,
  genuinely app-wide (not order-hub-specific) utilities —
  `orderStatusLabel`/`ORDER_STATUS_LABELS` (`./order-status`, used by ~15
  unrelated pages: composition, counterparties, forms, proposals, shipping,
  studio, supply, warehouse) and `onDialogCloseOnce`
  (`../on-dialog-close-once`, used by ~20 unrelated pages/dialogs). Moving
  their canonical source is far outside this TZ's conflict keys and "S"
  size, and risks colliding with other agents' concurrent work in those
  unrelated files.

**Precedent**: DocStudio Editor Decomp Phase 3 hit the identical situation
and made the identical call — its checklist explicitly kept
`studio-data-panel`/`studio-data-vitrina`/`studio-properties-panel`/
`studio-text-properties` in the app because they "compose real
registries-feature ... dependencies this lib's `@nx/js:tsc` build cannot
cross-compile from raw source." Followed the same reasoning here.

**Decision**: moved only the two fully self-contained, genuinely
order-hub-local pieces — `kit-reserve-confirm-dialog.component.ts` and
`ship-confirm-dialog.component.ts` (+ specs) — into
`libs/features/src/lib/order-hub/ui/`. `order-hub-tray.component.ts` and
`order-hub.facade.ts` **stay in the app**, now importing the two dialogs
from `@kppdf/features/order-hub` instead of a relative path.
`orders-list.page.ts` (the tray's actual consumer — see note below) needed
no change since the tray's own path didn't move.

`order-status.ts` and `on-dialog-close-once.ts` (the two small app-wide
utilities) were **not** duplicated into the lib either, since nothing that
moved into `libs/features/src/lib/order-hub/` needs them (only the
non-moved tray/facade do, and they keep importing the app originals as
before — no change needed there).

## Note — conflict keys named the wrong consumer file

This TZ's (and B1's) CONFLICT KEYS list `order-detail.page.ts` as the
tray's consumer. Checked: `order-detail.page.ts` does not import
`OrderHubTrayComponent` at all. The actual consumer, rendering it as an
expandable row (`data-test="orders-row-expand"`), is `orders-list.page.ts`.
Treated the conflict-key list as carrying a stale assumption (same category
of TZ/reality mismatch found earlier this wave in A1's handoff and A4's
unlisted-but-necessary `ProductionCockpitContext` move) and worked from the
actual import graph. No changes were needed in either file either way,
since the tray's own path was not relocated.

## What changed

- `kit-reserve-confirm-dialog.component.ts` (+ spec) → `libs/features/src/lib/order-hub/ui/`
- `ship-confirm-dialog.component.ts` (+ spec) → `libs/features/src/lib/order-hub/ui/`
- New barrels: `order-hub/ui/index.ts`, `order-hub/index.ts`
- New tsconfig path `@kppdf/features/order-hub`
- `order-hub.facade.ts` — dialog imports switched to `@kppdf/features/order-hub`
- `order-hub-tray.component.spec.ts` — dialog imports switched to `@kppdf/features/order-hub`
- `order-hub-tray.component.ts` — unchanged content (never imported the dialogs directly; opens them via the facade)

## Acceptance

- [x] Order hub specs + order-detail green (kppdf-web orders-pattern run 110/110 suites; `order-hub-tray.component.spec.ts` + `order-detail.page.spec.ts` re-verified in isolation 38/38 tests; features lib 21/21 suites incl. the 2 moved dialog specs)
- [x] nx build last 0 (bundle unchanged, 503.37 kB — dialogs are lazy via `PiDialogService.open()`, no eager-barrel risk)
- [x] B1 WAVE Status all DONE — tracker updated below, all 6 TZ rows DONE

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal relocation, scoped down from the TZ's literal text per the disclosed rationale above)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface; `/orders` route/behavior unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (no UI/route change)
- [x] DOMAIN-MAP — N/A (module boundary moved for 2 dialogs only; tray/facade module location unchanged)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: libs/features/src/lib/order-hub/**, frontend-nx/tsconfig.base.json, order-hub.facade.ts, order-hub-tray.component.spec.ts + this checklist/tracker/task marker)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from B1 closure
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.37 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors)
- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors)
- `pnpm architecture:check` → PASS (1502 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx test features` → PASS (21/21 suites, 236/236 tests — incl. both moved dialog specs)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern="orders"` → PASS (110/110 suites, 756/763 passed, 7 skipped, 0 failed)
- `npx jest --config apps/kppdf-web/jest.config.ts order-hub-tray.component.spec.ts order-detail.page.spec.ts` → PASS (isolated re-run: 38/38 tests, confirms both AC-named specs explicitly)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle unchanged at 503.37 kB)

## Executor report

Что сделано: перенёс оба самодостаточных, реально order-hub-local диалога
(kit-reserve-confirm, ship-confirm) в `libs/features/src/lib/order-hub/ui/`
с barrel `index.ts`. Tray-компонент и facade оставлены в app — их
зависимость от `CompositionTreeComponent` (реальный, 172-строчный, шаренный
с другим доменом компонент) делает полный перенос архитектурно нечистым;
решение и обоснование задокументированы выше, с прямой ссылкой на
идентичный прецедент DocStudio Editor Decomp Phase 3.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: `order-hub-tray.component.ts` / `order-hub.facade.ts` остаются
в `apps/kppdf-web` — полный перенос требует либо переноса
`CompositionTreeComponent` в общий features lib (отдельная задача,
затрагивает `composition-panel.component.ts`), либо согласия дублировать
170+ LOC компонент (не рекомендую).

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE (scoped, see deviation note above)
- closed_at: 2026-09-15
