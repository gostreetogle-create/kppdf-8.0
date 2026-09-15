# TZ-NX-DOCSTUDIO-LEFTOVER-UI-TO-FEATURES checklist

> Status: **DONE** (investigated, partial hard blocker — 2 of 4 files moved, 2 documented and left in app)
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-LEFTOVER-UI-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T09:30:27Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (B5 fully archived `448048c0`)
- [x] TZ / канон / deps прочитаны (`TZ-NX-DOCSTUDIO-LEFTOVER-UI-TO-FEATURES.md`, `WAVE-MAP.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-LEFTOVER-UI-TO-FEATURES.md` на месте

## Investigation — 2 files clean, 2 files independently hard-blocked

Checked every relative import of all 4 files before moving anything, per
established discipline this program.

**`studio-data-vitrina.component.ts`** (465 LOC) and its sibling
**`studio-data-panel.component.ts`** (477 LOC, imports vitrina) call
`createCatalogRegistryDialogHost`/`createMaterialRegistryDialogHost` —
real factory functions from `registries/data/catalog-registry-dialog-host.ts`/
`material-registry-dialog-host.ts`. Those two files are the actual
registries row-action infrastructure, consumed by ~15 other app files and
specs across the whole `/registries` domain (`modules.registry.ts`,
`products.registry.ts`, `materials.registry.ts`,
`material-registry-actions.ts`, `module-registry-actions.ts`,
`product-registry-actions.ts`, `registries.catalog.ts`,
`registry-detail-panel.component.ts`, …) — a genuine hard blocker, same
class as `CategoryFormDialogComponent`/`CompositionPanelComponent` before
they got their own dedicated moves. Moving them into `@kppdf/features`
would mean relocating a large slice of the registries data layer, well
outside this TZ's "as-is" scope. **Left in app, documented here** — the
WAVE-MAP itself named "registries coupling" as an anticipated blocker
class for this wave.

**`studio-text-properties.component.ts`** (549 LOC) and its dependent
**`studio-properties-panel.component.ts`** (359 LOC, imports it) looked
clean at first pass — their only relative imports were the established
`on-dialog-close-once.ts` duplicate pattern and a self-referential
`@kppdf/features/doc-studio` barrel import (already fixable to a relative
sibling path, same fix applied to `supply-requests.facade.ts` in C2).
**Moved both, all gates green** (`tsc -p libs/features/tsconfig.lib.json`
clean, `jest` green: 5/5) — until the **real** gate,
`nx build kppdf-web`, failed with a genuine `TS2307` in a third file this
move transitively pulls in for the first time:
`libs/ui/paper-and-ink/src/lib/rich-text/pi-rich-text-editor.component.ts`
(imported by `studio-text-properties.component.ts` via
`@kppdf/ui/rich-text`) does `import { Placeholder } from
'@tiptap/extensions/placeholder'` — a modern package-`exports`-field
subpath that only resolves under `moduleResolution: "bundler"` (or
`node16`/`nodenext`). `apps/kppdf-web/tsconfig.json` already overrides to
`"bundler"`; `libs/features/tsconfig.json` never has (it never had a file
depending on modern package exports before). Since Nx maps
`@kppdf/ui/rich-text` to a **source `.ts` file**, not a compiled
`.d.ts`/`.js` pair, whichever program's tsconfig governs when TypeScript
walks into it — and `libs/features`'s own settings choked.

Investigated the direct fix: `moduleResolution: "bundler"` requires
`module` to be `"preserve"` or ES2015+, but `libs/features/tsconfig.json`
sets `"module": "commonjs"` — changing that is a real module-system shift
for the **whole lib** (build output format for every consumer, plus
whatever `ts-jest`'s CommonJS-based transpilation assumes for every spec
in the lib), not a narrow one-line fix. Confirmed jest tolerates the move
fine (`ts-jest` with `isolatedModules` doesn't do the same
package-exports resolution as the Angular/esbuild AOT compiler), but the
**authoritative** `nx build kppdf-web` gate does not — verified directly,
not assumed (ran the real build with the move in place, got the exact
`TS2307`, tried the narrow `moduleResolution` fix, got a second error
requiring the broader `module` change, reverted). This is a genuine
infrastructure gap the program hasn't hit before (this session's first
`@kppdf/features/*` file to transitively depend on a shared UI lib that
itself uses a modern-package-exports dependency) — fixing it properly
belongs to its own TZ, not a silent side-effect of an "as-is, no
behavior change" move. **Reverted both files back to the app**,
documented here.

## What changed

**Nothing in product code.** Both attempted moves were fully reverted
after the second one hit the confirmed build blocker above — verified
clean via `git status` (no diff in `studio/` or `doc-studio/` beyond
pre-existing unrelated WIP) and a fresh `nx build kppdf-web` (exit 0,
bundle unchanged).

## Acceptance

- [x] `nx test kppdf-web --testPathPattern=studio` → PASS (25/25 suites, 157/157 tests — unchanged, no-op)
- [x] nx build last 0 (bundle unchanged, 503.38 kB)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (investigation, no net code change)
- [x] FIC §A–E — N/A (no code change survived)
- [x] page.md / PAGE-TZ-INDEX — N/A
- [x] DOMAIN-MAP — N/A (no module boundary moved — investigated and reverted)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (no product files touched net of the revert; only this checklist/tracker/task marker)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (confirmed before claim)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB) — re-verified after full revert

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors, clean after revert)
- `cd frontend-nx && npx jest --config apps/kppdf-web/jest.config.ts --testPathPattern=studio` → PASS (25/25 suites, 157/157 tests)
- `pnpm architecture:check` → PASS (1545 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged) — the same command **failed** with the text-properties move in place (real `TS2307`, not a false alarm), which is exactly what drove the revert decision

## Executor report

Что сделано: расследование всех 4 "потерянных" studio UI компонентов.
`studio-data-panel`/`studio-data-vitrina` — реальный блокер: вызывают
`createCatalogRegistryDialogHost`/`createMaterialRegistryDialogHost`,
общую инфраструктуру registries row-actions с ~15 потребителями —
перенос означал бы вынести солидный кусок registries data layer,
далеко за рамки "as-is" этого TZ. `studio-text-properties`/
`studio-properties-panel` — перенёс, все локальные gates позеленели
(tsc lib, jest), но **реальный** `nx build kppdf-web` упал: третий файл
(`pi-rich-text-editor.component.ts` в `@kppdf/ui/rich-text`, куда
text-properties тянется через TipTap RTE) не резолвится под
`moduleResolution` текущего `libs/features/tsconfig.json` — и правильный
фикс требует смены `module` для всей lib (не точечная правка). Откатил
оба файла обратно в app — задокументировано здесь, ничего не осталось
несмётённым.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio-list.page.ts/.spec.ts — Cursor's WIP; множество ранее "потерянных"
`tasks/_ready/**` файлов, которые сами восстановились на диске между
турнами — не мои) не трогал.

Known limits: если кто-то захочет закрыть text-properties/properties-panel
позже, нужна отдельная TZ на смену `module`/`moduleResolution` в
`libs/features/tsconfig.json` (проверить и AOT build, и весь `nx test
features`, не только затронутый файл) — не делал этого здесь намеренно,
т.к. это меняет компиляцию всей библиотеки, а не одного файла.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
