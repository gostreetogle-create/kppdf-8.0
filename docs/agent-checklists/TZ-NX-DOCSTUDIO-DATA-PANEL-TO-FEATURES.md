# TZ-NX-DOCSTUDIO-DATA-PANEL-TO-FEATURES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-DATA-PANEL-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T10:08:52Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (TZ 3 archived `5bbd000c`/`37a86587`)
- [x] TZ / канон / deps прочитаны (`TZ-NX-DOCSTUDIO-DATA-PANEL-TO-FEATURES.md`, `WAVE-MAP.md`, depends on TZ 3 archived)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-DATA-PANEL-TO-FEATURES.md` на месте

## What changed

With TZ 3 having moved `createCatalogRegistryDialogHost`/
`createMaterialRegistryDialogHost` (+ `RegistryActionContext`/
`MaterialRegistryDialogConfig`) into `@kppdf/features/registry-forms`,
`studio-data-vitrina.component.ts`'s only remaining relative imports were
the same two types — already available from that same lib barrel (TZ 3
duplicated them there), so no *new* duplication was needed here at all.
`studio-data-panel.component.ts` only imported its sibling — clean.

Moved both components + all 3 specs (`studio-data-panel.component.spec.ts`,
`studio-data-vitrina.component.spec.ts`, `studio-data-vitrina-edit.spec.ts`)
into `libs/features/src/lib/doc-studio/ui/`. Two more self-referential
`@kppdf/features/doc-studio` barrel imports surfaced (same pattern hit in
TZ 2 and C2) and were switched to relative sibling paths:
`StudioShowcaseKind`/`StudioCatalogSelections` and
`StudioDataCategory`/`StudioDataPanelCategoryJump` are both defined in
`studio-editor.facade.ts` (lib root) — now imported as `../studio-editor.facade`
instead of through the barrel.

Updated the `ui/index.ts` barrel (+2 exports) and the one external
consumer, `studio-editor.page.ts` (`StudioDataPanelComponent` +
`type StudioShowcaseKind` folded into its existing
`@kppdf/features/doc-studio` import block).

**This closes the entire B6→B7 chain** — all 4 originally-parked Studio
Phase 3 leftovers (`studio-text-properties`, `studio-properties-panel`,
`studio-data-panel`, `studio-data-vitrina`) now live in
`@kppdf/features/doc-studio`; only `studio-editor.page.ts`/`studio.routes.ts`/
`studio-dirty.guard.ts` and the `studio-editor-*.spec.ts` files remain in
the app, per the original Phase 1-4 target layout.

## Acceptance

- [x] data-panel/vitrina specs green — features lib 47/47 suites (419/419 tests, +3 suites for the moved specs)
- [x] studio-editor specs green — `kppdf-web --testPathPattern=studio` 21/21 suites (117/117 tests, -3 suites matching the moved specs)
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal relocation, no behavior change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, no route change)
- [x] page.md / PAGE-TZ-INDEX — N/A
- [x] DOMAIN-MAP — N/A (module boundary moved only)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: the 2 moved components + 3 specs + barrel + studio-editor.page.ts import + this checklist/tracker/task marker)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from TZ 3 closure (`5bbd000c`)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB); confirmed no eager route provider

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors, clean on first run)
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean on first run)
- `cd frontend-nx && pnpm exec nx test features` → PASS (47/47 suites, 419/419 tests)
- `npx jest --config apps/kppdf-web/jest.config.ts --testPathPattern=studio` → PASS (21/21 suites, 117/117 tests)
- `npx jest --config apps/kppdf-web/jest.config.ts --testPathPattern="registries"` → PASS (31/31 suites, 185/192 passed, 7 skipped)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → PASS (84/84 suites, 573/580 passed, 7 skipped, 0 failed)
- `pnpm architecture:check` → PASS (1546 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged)

## Executor report

Что сделано: перенёс `studio-data-panel`/`studio-data-vitrina` (+3 спеки)
в `@kppdf/features/doc-studio` — последний из 4 "потерянных" Phase 3
компонентов. Блокер из B6 полностью снят цепочкой TZ1→TZ3 этой волны;
здесь оставалось только поправить 2 self-referential barrel-импорта
(`StudioShowcaseKind`/`StudioCatalogSelections`,
`StudioDataCategory`/`StudioDataPanelCategoryJump` — оба на самом деле
определены в `studio-editor.facade.ts`). Волна B7 закрыта полностью
(TZ1→TZ2→TZ3→TZ4), все 4 leftover-компонента Studio Phase 3 теперь в lib.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio-list.page.ts/.spec.ts — Cursor's WIP) не трогал.

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
