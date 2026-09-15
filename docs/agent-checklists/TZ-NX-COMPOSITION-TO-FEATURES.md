# TZ-NX-COMPOSITION-TO-FEATURES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-COMPOSITION-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T06:17:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (B4 fully archived)
- [x] TZ / канон / deps прочитаны (`TZ-NX-COMPOSITION-TO-FEATURES.md`, `WAVE-MAP.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-COMPOSITION-TO-FEATURES.md` на месте

## Investigation — clean move, no blockers this time

Checked every relative import of all 8 files in
`apps/kppdf-web/src/app/pages/composition/` before moving anything.
Unlike B4 F2 (where `CompositionPanelComponent` itself was the blocker for
registry-form dialogs), the composition folder's **own** internal imports
turned out fully self-contained: `composition-picker-dialog.component.ts`
and `composition-tree.contract.ts` have zero relative imports;
`composition-tree.component.ts` only imports its own sibling
`composition-tree.contract.ts`; `composition-panel.component.ts` imports
three siblings (`composition-line-resolve`, `composition-tree.contract`,
`composition-picker-dialog.component`) plus one app-level utility
(`../on-dialog-close-once`); `dirty-dialog.guard.ts` imports the same
app-level utility. `composition-registries.spec.ts` (also in this folder)
tests `registries/data/*-registry-actions.ts` — no dependency on any
composition-*.ts file — correctly identified as **not** part of this move
and left in place.

`on-dialog-close-once.ts` (19 LOC, pure — `effect`/`Injector` only, zero
app-specific deps) is the same file already duplicated into
doc-studio/production/order-hub/supply/warehouse/proposals/admin-roles —
duplicated into `composition/ui/` too, same low-drift-risk pattern.

**Result: the entire composition/ folder (8 source + spec files) moved in
full**, no scope reduction needed — the opposite of every prior
features-move TZ this program, which all hit a real-component blocker.

## What changed

- `libs/features/src/lib/composition/` (new): `index.ts` (barrel) +
  `ui/` holding `composition-panel.component.ts`,
  `composition-tree.component.ts`, `composition-tree.contract.ts`,
  `composition-picker-dialog.component.ts`, `composition-line-resolve.ts`,
  `composition-focus-scroll.ts`, `dirty-dialog.guard.ts` (+ their specs)
  and the duplicated `on-dialog-close-once.ts`.
- New tsconfig paths: `@kppdf/features/composition` (barrel) and
  `@kppdf/features/composition/composition-focus-scroll` (narrow, see
  below).
- 8 consumer files updated to import from `@kppdf/features/composition`
  instead of relative paths: `orders/order-hub-tray.component.ts`,
  `orders/order-hub.facade.ts`, all 3 registry dialogs
  (`material/module/product-form-dialog.component.ts`), 2 of the 3
  registry facades (`module/product-form.facade.ts` — `confirmDirtyClose`),
  and `module-form-dialog.component.spec.ts`'s dynamic import.

**One test-only wrinkle:** `module-form-dialog.component.spec.ts` had
`jest.spyOn(await import('../../composition/composition-focus-scroll'),
'scrollCompositionBlockIntoView')`. Once the component's import moved to
the `@kppdf/features/composition` barrel, spying on that same barrel
specifier threw `TypeError: Cannot redefine property:
scrollCompositionBlockIntoView` — TS's `export *` re-export chain
(`composition-focus-scroll.ts` → `ui/index.ts` → `index.ts`) forwards the
property via a non-configurable getter, which `jest.spyOn` cannot
replace. Fixed by adding a narrow tsconfig path
(`@kppdf/features/composition/composition-focus-scroll`, pointing
directly at the leaf file) and pointing only the spec's dynamic import at
it — the barrel's forwarding getter reads the leaf module's own
(configurable) property live, so the spy still intercepts the component's
call through the barrel. Same precedent/technique as the narrow
`@kppdf/features/production/production-read.facade` path added in A4
(there for a bundle-size reason, here for a jest-spy reason) — did not
touch the component's own import, which stays on the barrel.

Verified no eager route provider drags composition into the initial
bundle: `grep providers: app.routes.ts` shows only the pre-existing
`ProductionReadFacade` narrow-path provider; all composition consumers
(order-hub, registries dialogs) are behind `loadComponent`.

## Acceptance

- [x] composition* specs green (moved into `features`: 7 spec files, part of 32/32 lib suites)
- [x] consumers green: order-hub (`order-hub-tray.component.spec.ts` in full suite), material/module/product form dialogs (3/3, part of full suite)
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal relocation, no behavior change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, no route change)
- [x] page.md / PAGE-TZ-INDEX — N/A
- [x] DOMAIN-MAP — N/A (module boundary moved only)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: composition move + 8 consumer import fixes + tsconfig.base.json + this checklist/tracker/task marker)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (confirmed before claim)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean on first run)
- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors, clean on first run)
- `cd frontend-nx && pnpm exec nx test features` → PASS (32/32 suites, 273/273 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → PASS (99/99 suites, 719/726 passed, 7 skipped, 0 failed; one initial failure — jest-spy-on-barrel issue, fixed, see above)
- `pnpm architecture:check` → PASS (1527 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged; confirmed no eager route provider)

## Executor report

Что сделано: перенёс весь `pages/composition/` (кроме
`composition-registries.spec.ts`, который тестирует не composition-файлы,
а registries actions) в `libs/features/src/lib/composition/` целиком — в
отличие от каждого предыдущего features-move TZ в этой программе, здесь
не оказалось ни одного реального блокера: все внутренние relative-импорты
были либо самодостаточны, либо указывали на уже установленный
дублируемый паттерн (`on-dialog-close-once.ts`). Обновил 8
файлов-потребителей (order-hub tray/facade, 3 registry-диалога, 2
registry-facade, 1 spec). Один тестовый нюанс: `jest.spyOn` на
барабанном (`export *`) реэкспорте кидал `Cannot redefine property` —
добавил узкий tsconfig-путь на leaf-модуль (тот же приём, что и
`production-read.facade` в A4, только по другой причине) и указал туда
только spy в спеке, не трогая импорт компонента.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: нет. Этот TZ прямо разблокирует B4 F2
(`TZ-NX-REGISTRY-FORMS-TO-FEATURES`) и order-hub tray/facade full move —
оба явно поручены следующему TZ (`TZ-NX-DECOMP-DEBT-CLOSEOUT`).

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
