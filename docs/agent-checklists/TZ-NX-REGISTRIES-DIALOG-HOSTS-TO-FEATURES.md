# TZ-NX-REGISTRIES-DIALOG-HOSTS-TO-FEATURES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-REGISTRIES-DIALOG-HOSTS-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T10:03:01Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (TZ 2 archived `21ee1faa`/`f01052f`)
- [x] TZ / канон / deps прочитаны (`TZ-NX-REGISTRIES-DIALOG-HOSTS-TO-FEATURES.md`, `WAVE-MAP.md`, depends on TZ 2 archived)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-REGISTRIES-DIALOG-HOSTS-TO-FEATURES.md` на месте

## Investigation — smaller blocker than B6 assumed

B6's checklist described `catalog-registry-dialog-host.ts`/
`material-registry-dialog-host.ts` as "the real registries row-action
infrastructure" — true of their ~15 *consumers*, but the two files
**themselves** turned out nearly self-contained once read in full:

- Both already imported `Material/Module/ProductFormDialogComponent`
  from `@kppdf/features/registry-forms` (moved there in C2) — a lib
  import already, not an app coupling.
- Both had exactly one small pure type dependency each:
  `RegistryActionContext` (`registries/model/registry.types.ts`, a
  2-field framework-agnostic interface) and, for the material host only,
  `MaterialRegistryDialogConfig` (`material-registry-actions.ts`, a
  4-field interface) — both erased at compile time, zero runtime code.
  Same low-drift-risk duplication class as `on-dialog-close-once.ts`.
  `registry.types.ts`/`material-registry-actions.ts` stay in the app —
  only these two tiny interfaces got a lib-local copy.
- `onDialogCloseOnce` — the standard duplicate, already present in this
  lib's `ui/` from C2.

The ~15 consumers this TZ's AC worried about are **all `import type`**
except 3: their own dedicated spec (`catalog-registry-dialog-host.spec.ts`,
moved with the file), `registries.catalog.ts` (the actual page-level
wiring that instantiates both hosts — stays in the app, import path
updated), and `studio-data-vitrina.component.ts` (TZ 4's file — still in
the app for now, but its import needed updating too since this TZ's own
AC requires its spec to stay green; the file itself doesn't move until
TZ 4).

## What changed

- `catalog-registry-dialog-host.ts` + its spec, `material-registry-dialog-host.ts`
  → `libs/features/src/lib/registry-forms/` (lib root, alongside the 3
  form facades)
- New: `registry-action-context.ts` (duplicated `RegistryActionContext`);
  `MaterialRegistryDialogConfig` inlined directly into
  `material-registry-dialog-host.ts` (single consumer, not worth a
  separate file)
- `registry-forms/index.ts` barrel (+3 exports)
- `registries.catalog.ts` — 2 value imports switched to the lib
- `studio-data-vitrina.component.ts` — 2 value imports switched to the
  lib (file itself stays in app; see TZ 4)
- 14 other app files (`material-registry-actions.ts`,
  `module/product-registry-actions.ts`, `modules/materials/products.registry.ts`,
  `registry-detail-panel.component.spec.ts`, `registries.routes.spec.ts`,
  + 8 more spec files) — `import type` path switched to the lib, no
  logic touched

## Acceptance

- [x] registries specs green — `--testPathPattern="registries"` 31/31 suites (185/192 passed, 7 skipped)
- [x] studio data-panel/vitrina specs green — `--testPathPattern=studio` 24/24 suites (152/152 tests), includes `studio-data-vitrina.component.spec.ts`
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal relocation, no behavior change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, no route change)
- [x] page.md / PAGE-TZ-INDEX — N/A
- [x] DOMAIN-MAP — N/A (module boundary moved only)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: the 2 moved files + new type files + barrel + ~17 consumer import fixes + this checklist/tracker/task marker)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from TZ 2 closure (`21ee1faa`)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB); confirmed no eager route provider

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors, clean on first run)
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean on first run)
- `cd frontend-nx && pnpm exec nx test features` → PASS (44/44 suites, 384/384 tests)
- `npx jest --config apps/kppdf-web/jest.config.ts --testPathPattern="registries"` → PASS (31/31 suites, 185/192 passed, 7 skipped)
- `npx jest --config apps/kppdf-web/jest.config.ts --testPathPattern=studio` → PASS (24/24 suites, 152/152 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → PASS (87/87 suites, 608/615 passed, 7 skipped, 0 failed)
- `pnpm architecture:check` → PASS (1546 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged)

## Executor report

Что сделано: перенёс `createCatalogRegistryDialogHost`/
`createMaterialRegistryDialogHost` в `@kppdf/features/registry-forms` —
оказались куда более самодостаточными, чем описано в B6 (обе фабрики уже
импортировали диалоги из lib после C2; блокером были только два
крошечных чистых типа, продублированных так же, как
`on-dialog-close-once.ts`). Обновил ~17 потребителей: 3 с реальными
значениями (собственная спека — переехала вместе с файлом,
`registries.catalog.ts` — реальная point-of-use инстанциация, и
`studio-data-vitrina.component.ts` — файл TZ4, но импорт обязан был
обновиться уже сейчас, т.к. AC этого TZ требует зелёные data-panel/vitrina
спеки) и 14 файлов с `import type` (только смена пути, ноль логики).

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio-list.page.ts/.spec.ts — Cursor's WIP) не трогал.

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
