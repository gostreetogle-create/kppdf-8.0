# TZ-NX-HOME-ROUTE-SHELL checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-HOME-ROUTE-SHELL.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-15T15:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI exposed)

## Preflight

- [x] `git status --short --branch` and `git worktree list` checked
- [x] `_NOW.md` and `tasks/_active/` checked; no conflicting active claim
- [x] TZ, wave, page doc, canon, and dependencies read
- [x] Claim slot filled before product code

### Preflight Check Output
- **Context read:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/pages/home.page.md`, `docs/agent-checklists/WAVE-NX-HOME.md`, `docs/audits/2026-09-15-ui-related-display-peer-verdict.md`, `tasks/_ready/2026-09-15-nx-home/TZ-NX-HOME-ROUTE-SHELL.md`, `docs/DOMAIN-MAP.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md`
- **Key Constraints:** Executor claim + route conflict keys; Angular standalone/OnPush; Paper & Ink; no React/Tailwind port; no `/desk`; no mock data.
- **Planned Deliverable:** add standalone `/home` shell page; register authenticated route and default redirect; add visible nav entry and route/nav specs; update page index/domain map.
- **Validation Path:** FIC §A, focused page/nav/route tests, frontend-nx typecheck/lint/build, Integrity slot.

## Acceptance

- [x] `/home` is the authenticated post-login landing route and title contains «Главная».
- [x] Nav has visible «Главная» linking to `/home`.
- [x] Home page uses existing NX Paper & Ink shell and honest empty state; no mock JSON.
- [x] Route and nav specs cover `/home` and visibility.

## Integrity slot

- [x] Тип изменения: page / NX route / nav
- [x] FIC §A passed (route/nav/page index/domain map updated)
- [x] `docs/pages/home.page.md` and `docs/pages/PAGE-TZ-INDEX.md` updated
- [x] `docs/DOMAIN-MAP.md` §1.2 / §1.4 updated
- [x] `docs/SECTION-READINESS.md`: N/A (no readiness status change)
- [x] No чужой WIP staged; conflict keys respected
- [x] `docs/COUPLING-MAP.md`: N/A (no shared status/filter)

## Build integrity

- [x] Baseline `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS (exit 0)
- [x] Closing `cd frontend-nx && pnpm exec nx build kppdf-web` is the last gate — PASS (exit 0)

## Gates

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS (exit 0)
- `pnpm exec nx test kppdf-web apps/kppdf-web/src/app/pages/home/home.page.spec.ts` — PASS (2/2)
- `pnpm exec nx test kppdf-web apps/kppdf-web/src/app/layout/nav-categories.spec.ts` — PASS (21/21)
- `pnpm exec nx lint kppdf-web` — FAIL baseline: pre-existing 52 errors / 103 warnings, including lazy `features` boundary error from `apps/kppdf-web/src/app/pages/registries/dialogs/module-form-dialog.component.spec.ts`; no new home-specific rule error beyond that baseline
- `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS (exit 0, last gate; existing budget warnings)

## Executor report

- Implemented authenticated `/home` route, default redirect, first-position Главная nav entry, Paper & Ink empty shell, and route/page docs.
- Conflict disclosure: unrelated dirty files were not staged; `nx lint` remains blocked by existing repository-wide boundary/accessibility baseline.
- Known limit: live order queue, reused hub tray, and workflow chips are reserved for the next queued TZs.

## Closeout

- [x] archive + remove `_active` (no lock convention present in repository)
- [x] Status = DONE
- closed_at: 2026-09-15T15:20:00+03:00
