# TZ-NX-ROLE-FORM-TO-FEATURES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-ROLE-FORM-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T05:45:51Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (R1 archived)
- [x] TZ / канон / deps прочитаны (`TZ-NX-ROLE-FORM-TO-FEATURES.md`, depends on R1 archived `a2859085`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-ROLE-FORM-TO-FEATURES.md` на месте

## Investigation — dialog moved in full (TZ's preference honored)

Checked every relative import in `role-form.facade.ts` and
`role-form-dialog.component.ts` before moving anything. Both depend on
`./permission-labels.ru` (240 LOC, pure RU label maps + a few lookup
functions, **zero Angular/DI imports**) — also used by `admin-roles.page.ts`
(stays in the app) for two unrelated exports (`permissionsSummary`,
`roleLabelRu`). Unlike the `MaterialFormDialogComponent`-class blockers
from B2/B3 (real, actively-interactive Angular components), this is pure
static data — same low-drift-risk category as `on-dialog-close-once.ts`
and production's `ORDER_STATUS_LABELS`, just larger. Duplicated it rather
than treating it as a hard blocker, which let **both** the facade and the
dialog UI move in full — satisfying the TZ's stated preference ("move
facade (+ dialog UI if no illegal app deps)") rather than needing a scoped-
down deviation.

## What changed

- `role-form.facade.ts` → `libs/features/src/lib/admin-roles/role-form.facade.ts` (lib root)
- `role-form-dialog.component.ts` → `libs/features/src/lib/admin-roles/ui/role-form-dialog.component.ts`
- New: `libs/features/src/lib/admin-roles/ui/permission-labels.ru.ts` (duplicate; `apps/.../pages/permission-labels.ru.ts` stays as the app's canonical copy for `admin-roles.page.ts`)
- New barrels: `admin-roles/index.ts`, `admin-roles/ui/index.ts`
- New tsconfig path `@kppdf/features/admin-roles`
- `admin-roles.page.ts` (+ spec) — `RoleFormDialogComponent`/`RoleFormData`/`RoleFormResult` imports switched to `@kppdf/features/admin-roles`

## Acceptance

- [x] Specs green — features lib 25/25 suites (251/251 tests, unchanged count — no dedicated dialog spec existed to move); kppdf-web role|admin pattern 106/106 suites (741/748 passed, 7 skipped, 0 failed)
- [x] nx build last 0 (bundle unchanged, 503.38 kB — confirmed the page (and transitively the dialog) is lazy-loaded only, no eager route provider)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal relocation, no ACL rule change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface; `/admin/roles` route/behavior unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (no UI/route change)
- [x] DOMAIN-MAP — N/A (module boundary moved only)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: libs/features/src/lib/admin-roles/**, frontend-nx/tsconfig.base.json, admin-roles.page.ts/.spec.ts + this checklist/tracker/task marker)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from R1 closure
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean on first run)
- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors)
- `pnpm architecture:check` → PASS (1521 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx test features` → PASS (25/25 suites, 251/251 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern="role|admin"` → PASS (106/106 suites, 741/748 passed, 7 skipped, 0 failed)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged; confirmed lazy-only route)

## Executor report

Что сделано: перенёс `RoleFormFacade` (lib root) и
`RoleFormDialogComponent` (`ui/`) полностью в
`libs/features/src/lib/admin-roles/`, с дублированием
`permission-labels.ru.ts` (240 строк чистых RU-лейблов, без Angular/DI —
тот же паттерн, что уже применён для `on-dialog-close-once.ts` и
`ORDER_STATUS_LABELS`). В отличие от B2/B3, здесь общая зависимость была
данными, а не реальным интерактивным компонентом — поэтому диалог удалось
перенести целиком, как и предпочитал TZ, без сокращения scope.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
