# TZ-NX-DOCSTUDIO-C1-LANDING-LIST checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-C1-LANDING-LIST.md` (removed after archive)
> Wave: `docs/agent-checklists/WAVE-DOCSTUDIO-CHROME-IA.md`
> Commit/push: implementation SHA and metadata SHA recorded in archive

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-06T13:03:56+03:00
- closed_at: 2026-09-06T13:20:30+03:00
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI exposed in this executor)

## Preflight

- [x] Continuous workspace is `D:\\kppdf-8.0`, branch `main`; no isolated Freebuff worktree
- [x] `_NOW.md` and `tasks/_active/` checked; no other active task claims C1 conflict keys
- [x] C1 TZ, WAVE checklist, Chrome IA audit, continuous prompt, GEMINI, executor loop, and project context read
- [x] C1 conflict keys were free in the current main worktree; foreign Claude worktrees were not touched
- [x] User constraints recorded: NX only; no backend, desktop, legacy `frontend/**`, Data IA, warehouse/supply, S45/S46, or foreign WIP
- [x] Claim slot filled before product-code edits

### Preflight Check Output

- **Context:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/agent-checklists/_NOW.md`, `docs/agent-checklists/WAVE-DOCSTUDIO-CHROME-IA.md`, `docs/audits/2026-09-06-docstudio-chrome-ia-audit.md`, `tasks/PROMPT-FREEBUFF-DOCSTUDIO-CHROME-IA.md`, C1 TZ
- **Acceptance:** `/studio` always remains the documents list; docs category entry is explicitly `/studio`; create/open/duplicate editor flows remain intact
- **Geometry risk:** C1 did not touch editor, rails, or A4 layout; no geometry delta expected

## Acceptance

- [x] Landing list never auto-resumes to `/studio/:id`; the load path now sets success directly after list data arrives.
- [x] Docs nav `entryPath` is explicitly `/studio`.
- [x] Create, open-row, and duplicate flows remain on the explicit editor paths and continue to call `rememberStudioDocument`; no code in those flows was removed.
- [x] `data-test="studio-list"` remains visible after list load; a regression test covers a loaded draft row.

## Changed scope

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-session.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/app-shell-constructor-nav.spec.ts`

## Integrity slot

- [x] Type: page/nav behavior
- [x] FIC §A: existing `/studio` nav entry verified; no new route added
- [x] page.md / PAGE-TZ-INDEX: no new route or final IA docs added in C1; final copy/index closeout belongs to C4
- [x] DOMAIN-MAP: N/A — existing `/studio` contour only; no new module/route
- [x] SECTION-READINESS: N/A — no section readiness change
- [x] Coupling map: N/A — no shared field/status/FK change
- [x] Foreign WIP excluded; only C1 conflict keys plus C1 checklist/archive/lock/_NOW intended
- [x] Canon: `docs/DOCS-INTEGRITY.md`

## Build integrity / gates

- [x] Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS, exit 0; existing NG8102/style-budget warnings only
- [x] App typecheck: `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS, exit 0
- [x] Focused tests: C1 list/session/nav/app-shell specs — **29 passed**, 4 suites, exit 0
- [x] Changed-file lint: `pnpm exec eslint` on the six changed files — PASS, 0 errors; 15 existing non-null warnings in `nav-categories.spec.ts`
- [x] Final build (last C1 gate): `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS, exit 0; existing NG8102/style-budget warnings only
- [x] `git diff --check` on C1 files — PASS
- [x] Full `cd frontend-nx && pnpm lint` attempted — FAIL on unrelated pre-existing errors in production/older Studio files; no errors in changed C1 files. This baseline limitation is disclosed, not fixed outside conflict keys.

## Executor report

- **Outcome:** C1 DONE — `/studio` is a stable documents landing and the docs chip explicitly enters `/studio`.
- **No backend/desktop/legacy frontend/Data IA/warehouse/S45/S46 changes.**
- **Known limitation:** C2 still owns `/studio/templates` and removal of dead docs nav items; C3 owns editor crumbs/right-rail actions; C4 owns final page/index/integrity docs.
- **Archive:** `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-C1-LANDING-LIST.done.md`
- **Lock:** `.mimocode/locks/TZ-NX-DOCSTUDIO-C1-LANDING-LIST.done.lock`
- **Implementation commit:** `42b4df0f9dd463b1dc687845b0cc5e0b59e20863` (pushed to origin/main; pre-push typecheck OK)
