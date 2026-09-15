# TZ-NX-ADMIN-ROLES-TO-FEATURES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-ADMIN-ROLES-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T11:37:12Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (TZ5 archived `c4e340e5`)
- [x] TZ / канон / deps прочитаны (`TZ-NX-ADMIN-ROLES-TO-FEATURES.md`, `WAVE-MAP.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-ADMIN-ROLES-TO-FEATURES.md` на месте

## What changed

Checked every import of `admin-roles.facade.ts` (TZ5 output) before moving
anything: `./on-dialog-close-once` (19 LOC pure, already duplicated into
~15 other domain libs this program), `./permission-labels.ru` (240 LOC pure
RU label data — **already** duplicated byte-for-byte into
`libs/features/src/lib/admin-roles/ui/permission-labels.ru.ts` back in
`TZ-NX-ROLE-FORM-TO-FEATURES`, B4), and `RoleFormDialogComponent`/
`RoleFormData`/`RoleFormResult` from `@kppdf/features/admin-roles` (the
dialog was already moved to this exact lib in B4). No new hard blocker —
genuinely clean move.

Moved via `git mv`: `admin-roles.facade.ts` →
`libs/features/src/lib/admin-roles/admin-roles-page.facade.ts` (renamed to
disambiguate from the existing `role-form.facade.ts`, matching its exported
`AdminRolesPageFacade` class). Duplicated `on-dialog-close-once.ts` into
`ui/` (same placement `shipping`/`registry-forms` use for their facade's
copy). Fixed 3 import paths inside the moved facade:
`./on-dialog-close-once` → `./ui/on-dialog-close-once`,
`./permission-labels.ru` → `./ui/permission-labels.ru` (reuse the existing
duplicate, not a second copy), and — the self-referential-barrel pattern
from B7 — `@kppdf/features/admin-roles` → `./ui/role-form-dialog.component`
(a facade now living *inside* `admin-roles` can't import its own public
barrel). `index.ts` gained `export * from './admin-roles-page.facade'`.

**`RolesAdminPage` (the page component) stays in the app** —
`app.routes.ts` lazy-loads it via `loadComponent: () => import('./pages/admin-roles.page')`,
the same "route host stays in apps/, only the facade+dialogs move" shape
`TZ-NX-SHIPPING-TO-FEATURES` established (`shipping.page.ts` stayed for the
identical reason). `admin-group-chips.ts` (shared with `admin-devices.page.ts`,
which is out of scope) never needed touching since the page didn't move.
`admin-roles.page.ts`'s only change: `import { AdminRolesPageFacade } from './admin-roles.facade'`
→ `from '@kppdf/features/admin-roles'` — app now imports from features, not
the reverse.

**B8 chain complete** — this was the last TZ (`Successor: —`, "STOP — B8
done" per the pack).

## Acceptance

- [x] specs green — kppdf-web full suite (83/83 suites, 559/566 passed, 7 skipped — `admin-roles.page.spec.ts` explicitly confirmed PASS); features full suite (48/48 suites, 433/433 passed)
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal relocation, no role/permission rule change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, route/UI unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (route page itself didn't move, import path only)
- [x] DOMAIN-MAP — N/A (import path changed, no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged: libs/features/src/lib/admin-roles/** changes, admin-roles.page.ts + this checklist/tracker/task marker)
- [x] Coupling map — N/A (roles CRUD semantics unchanged)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from TZ5 closure (`d6ba08ce`)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB; `admin-roles-page` lazy chunk 45.84 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors)
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → PASS (83/83 suites, 559/566 passed, 7 skipped, 0 failed) — `admin-roles.page.spec.ts` explicitly confirmed PASS
- `cd frontend-nx && pnpm exec nx test features` (full suite) → PASS (48/48 suites, 433/433 passed)
- `pnpm architecture:check` → PASS (1552 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged)

## Executor report

Что сделано: перенёс `AdminRolesPageFacade` (TZ5) в
`libs/features/src/lib/admin-roles/admin-roles-page.facade.ts` —
переиспользует уже существующий там `RoleFormDialogComponent` (B4) и
дубликат `permission-labels.ru.ts` (B4), плюс новый дубликат
`on-dialog-close-once.ts` в `ui/`. Сама страница `RolesAdminPage` осталась в
`apps/` как lazy route host — тот же паттерн, что `shipping.page.ts` в B5
(`admin-group-chips.ts` не тронут, он общий с `admin-devices.page.ts`, вне
scope). Это последняя TZ волны B8 — цепочка закрыта.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
