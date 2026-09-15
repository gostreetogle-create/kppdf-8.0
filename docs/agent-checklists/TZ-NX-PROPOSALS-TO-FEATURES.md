# TZ-NX-PROPOSALS-TO-FEATURES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-PROPOSALS-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T05:28:38Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (P1 archived)
- [x] TZ / канон / deps прочитаны (`TZ-NX-PROPOSALS-TO-FEATURES.md`, depends on P1 archived `93eec886`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-PROPOSALS-TO-FEATURES.md` на месте

## Investigation — no cross-domain blocker this time

Checked every relative import in `proposals-list.facade.ts` and
`proposal-attach-orgs.dialog.ts` (+ its spec) before moving anything —
unlike every other features-move TZ in this program (A4, B1's
`TZ-NX-ORDER-HUB-UI-FEATURES`, B2's `TZ-NX-SUPPLY-TO-FEATURES` and
`TZ-NX-WAREHOUSE-TO-FEATURES`), **no `MaterialFormDialogComponent`-style
cross-domain component blocked this move**. `proposal-attach-orgs.dialog.ts`
has zero relative imports; the facade's only relative dependency is the
already-established `../on-dialog-close-once` (19 LOC, duplicated the same
way as doc-studio/production/order-hub/supply/warehouse). Both moved
cleanly, in full, matching the TZ's literal instruction with no scope
deviation needed.

## What changed

- `proposals-list.facade.ts` → `libs/features/src/lib/proposals/proposals-list.facade.ts` (lib root)
- `proposal-attach-orgs.dialog.ts` (+ spec) → `libs/features/src/lib/proposals/ui/`
- New: `libs/features/src/lib/proposals/ui/on-dialog-close-once.ts` (duplicate)
- New barrels: `proposals/index.ts`, `proposals/ui/index.ts`
- New tsconfig path `@kppdf/features/proposals`
- `proposals-list.page.ts` — `ProposalsListFacade` import switched to `@kppdf/features/proposals`
- `proposals-list.page.spec.ts` — `ProposalAttachOrgsDialogComponent` import switched to `@kppdf/features/proposals`

## Acceptance

- [x] Proposals specs green — features lib 25/25 suites (251/251 tests, incl. the moved dialog spec); kppdf-web proposals-pattern run 106/106 suites (741/748 passed, 7 skipped, 0 failed)
- [x] nx build last 0 (bundle unchanged, 503.38 kB — confirmed `ProposalsListFacade` is lazy-loaded only via `loadComponent`, no eager route provider)
- [x] B3 DONE = batch complete (B1 + B2 + B3 all closed)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal relocation, no scope deviation this time)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface; `/proposals` route/behavior unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (no UI/route change)
- [x] DOMAIN-MAP — N/A (module boundary moved only)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: libs/features/src/lib/proposals/**, frontend-nx/tsconfig.base.json, proposals-list.page.ts/.spec.ts + this checklist/tracker/task marker)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from P1 closure
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean on first run — no missed import fixes this time)
- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors)
- `pnpm architecture:check` → PASS (1517 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx test features` → PASS (25/25 suites, 251/251 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern="proposals"` → PASS (106/106 suites, 741/748 passed, 7 skipped, 0 failed)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged; confirmed lazy-only route)

## Executor report

Что сделано: перенёс `ProposalsListFacade` (lib root) и
`ProposalAttachOrgsDialogComponent` (`ui/`) в
`libs/features/src/lib/proposals/`, с дублированием крошечного
`on-dialog-close-once.ts`. В отличие от всех предыдущих features-move TZ
этой программы, здесь не нашлось блокирующей кросс-доменной зависимости —
перенос прошёл полностью, без сокращения по сравнению с текстом TZ.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
