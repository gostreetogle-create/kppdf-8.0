# TZ-NX-SHIPPING-TO-FEATURES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-SHIPPING-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T07:58:22Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Source-of-truth disclosure

Same situation as S1 (see `docs/agent-checklists/TZ-NX-SHIPPING-PAGE-FACADE.md`):
the original TZ spec file was lost from disk before being read
(session-resume environment issue). Proceeded from `WAVE-MAP.md`'s goal
line, captured earlier in-session: "S2 | S | → `@kppdf/features/shipping`".

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (S1 archived `b0ea0aaa`)
- [x] TZ / канон / deps прочитаны (WAVE-MAP.md goal line — TZ file itself lost, see disclosure above)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SHIPPING-TO-FEATURES.md` на месте (reconstructed)

## Investigation — clean move, no blockers

Checked every relative import in `shipping.facade.ts` and all 3 shipment
dialogs before moving anything. All 3 dialogs
(`shipment-create/edit/doc-dialog.component.ts`) have **zero** relative
imports — fully self-contained on `@kppdf/*` libs only. The facade's only
relative dependency was `onDialogCloseOnce` (19 LOC pure), duplicated
into `ui/` per established pattern. No real-component blocker this time
— same clean-move shape as C1 (`TZ-NX-COMPOSITION-TO-FEATURES`).

Only one external consumer exists: `app.routes.ts`'s `/shipping` route,
already `loadComponent`-lazy with no eager `providers:` — confirmed no
bundle-size regression risk before moving.

## What changed

- `shipping.facade.ts` (lib root) + `shipment-create/edit/doc-dialog.component.ts`
  (+ specs, `ui/`) → `libs/features/src/lib/shipping/` (new lib)
- New: `ui/on-dialog-close-once.ts` (duplicate), `index.ts`, `ui/index.ts`
- New tsconfig path `@kppdf/features/shipping`
- `shipping.page.ts` — `ShippingFacade` import switched to `@kppdf/features/shipping`; stays in the app as the lazy route host

## Acceptance

- [x] Specs green — features lib 42/42 suites (377/377 tests); kppdf-web full suite 89/89 suites (615/622 passed, 7 skipped, 0 failed)
- [x] nx build last 0 (bundle unchanged, 503.38 kB — confirmed lazy-only route, no eager provider)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal relocation, no ACL/behavior change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface; `/shipping` route/behavior unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (no UI/route change)
- [x] DOMAIN-MAP — N/A (module boundary moved only)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: libs/features/src/lib/shipping/**, frontend-nx/tsconfig.base.json, shipping.page.ts + this checklist/tracker/task marker)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from S1 closure (`b0ea0aaa`)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean on first run)
- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors, clean on first run)
- `cd frontend-nx && pnpm exec nx test features` → PASS (42/42 suites, 377/377 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → PASS (89/89 suites, 615/622 passed, 7 skipped, 0 failed)
- `pnpm architecture:check` → PASS (1540 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged; confirmed lazy-only route)

## Executor report

Что сделано: перенёс `ShippingFacade` (lib root) и все 3 диалога
(`ShipmentCreateDialogComponent`/`ShipmentEditDialogComponent`/
`ShipmentDocDialogComponent`, `ui/`) полностью в
`libs/features/src/lib/shipping/` — блокеров не было, все три диалога
не имели ни одного relative-импорта. `shipping.page.ts` остаётся в app
как lazy route host (уже `loadComponent`, без eager provider).

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал. TZ spec-файл этой задачи был
физически утерян до прочтения (см. «Source-of-truth disclosure» выше).

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
