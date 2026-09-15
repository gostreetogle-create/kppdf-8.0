# TZ-NX-DESKTOP-PAIRING-TO-FEATURES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DESKTOP-PAIRING-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T11:31:23Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (TZ3 archived `4590ac10`)
- [x] TZ / канон / deps прочитаны (`TZ-NX-DESKTOP-PAIRING-TO-FEATURES.md`, `WAVE-MAP.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DESKTOP-PAIRING-TO-FEATURES.md` на месте

## What changed

Checked every import of `pairing-dialog.component.ts` + `pairing-dialog.facade.ts`
+ spec before moving anything (same discipline as every prior features-move
TZ this program): **zero app-local relative imports** anywhere in the trio —
only `@angular/*`, `@angular/forms`, `lucide-angular`, and public
`@kppdf/data-access`/`@kppdf/util-http`/`@kppdf/ui/*` libs. Genuinely
self-contained, unlike TZ2 (`registry-detail-panel`, blocked by
`registry.types.ts`).

Moved via `git mv` (preserves history):
- `pairing-dialog.facade.ts` → `libs/features/src/lib/desktop/pairing-dialog.facade.ts`
- `pairing-dialog.component.ts` + spec → `libs/features/src/lib/desktop/ui/`

Added `libs/features/src/lib/desktop/ui/index.ts` (barrel: exports the
component) and `libs/features/src/lib/desktop/index.ts` (public API: exports
`./ui` + `./pairing-dialog.facade`) — same `<domain>/<facade>.facade.ts` +
`<domain>/ui/` shape as `shipping`/`registry-forms`. Added
`@kppdf/features/desktop` → `libs/features/src/lib/desktop/index.ts` to
`tsconfig.base.json`.

Fixed the one relative import that changed depth
(`./pairing-dialog.facade` → `../pairing-dialog.facade` inside the
now-`ui/`-nested component). Dropped the `export type { PairingDialogData }`
re-export I'd added to the component in TZ3 (was only for pre-move
backward-compat) since `index.ts` already re-exports it from the facade
directly — keeping both would have created a duplicate `export *` symbol
collision.

`app-shell.component.ts` — the only external consumer — updated:
`import { PairingDialogComponent, type PairingDialogData } from '../pages/desktop/pairing-dialog.component'`
→ `import { PairingDialogComponent, type PairingDialogData } from '@kppdf/features/desktop'`.
App now imports from features (not the reverse); `apps/kppdf-web/src/app/pages/desktop/`
is now empty (removed by the `git mv`s — no route page ever lived there,
the dialog was always opened imperatively via `PiDialogService`).

## Acceptance

- [x] specs green — kppdf-web full suite (83/83 suites, 559/566 passed, 7 skipped — pairing-dialog spec no longer counted here); features full suite (48/48 suites, 433/433 passed) incl. `desktop/ui/pairing-dialog.component.spec.ts` explicitly confirmed PASS
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal relocation, no pairing/API rule change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, dialog UI unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (no route change — dialog was never route-hosted)
- [x] DOMAIN-MAP — N/A (import path changed, no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged: libs/features/src/lib/desktop/** (new), tsconfig.base.json, app-shell.component.ts + this checklist/tracker/task marker)
- [x] Coupling map — N/A (issue/revoke/compat semantics unchanged)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from TZ3 closure (`3ca5721b`)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors)
- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → PASS (83/83 suites, 559/566 passed, 7 skipped, 0 failed)
- `cd frontend-nx && pnpm exec nx test features` (full suite) → PASS (48/48 suites, 433/433 passed) — `desktop/ui/pairing-dialog.component.spec.ts` explicitly confirmed PASS
- `pnpm architecture:check` → PASS (1550 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged)

## Executor report

Что сделано: перенёс `PairingDialogFacade`+`PairingDialogComponent`(+spec) в
новый `libs/features/src/lib/desktop/` (`@kppdf/features/desktop`) — trio
оказался полностью самодостаточным (ноль app-local относительных импортов),
в отличие от TZ2. `app-shell.component.ts` теперь импортирует диалог из
features, а не из apps — правильное направление зависимости. Пустая папка
`apps/.../pages/desktop/` больше не существует.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
