# TZ-NX-DOCSTUDIO-C1-LANDING-LIST — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-06T13:20:30+03:00
closed_by: freebuff
agent_id: freebuff
workspace: `D:\\kppdf-8.0`
implementation_sha: 42b4df0f9dd463b1dc687845b0cc5e0b59e20863

## Outcome

- `/studio` no longer consumes the remembered draft and never auto-navigates to `/studio/:id` on landing.
- `NAV_CATEGORIES.docs.entryPath` now explicitly targets `/studio`; the quicknav spec verifies the live route.
- Explicit open/create/duplicate flows continue to call `rememberStudioDocument` and navigate to the editor.
- Added a regression test with a loaded draft proving the list and row remain visible and router navigation is not called.
- Kept `pickResumeStudioDocument` for explicit non-landing callers/tests and documented that the landing must not consume it.

## Changed files

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-session.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/app-shell-constructor-nav.spec.ts`

## Verification

- Baseline `pnpm exec nx build kppdf-web`: PASS, exit 0.
- App typecheck: PASS, exit 0.
- Focused C1 tests: PASS — 4 suites / 29 tests.
- Changed-file ESLint: PASS, 0 errors; existing non-null warnings only.
- Final `pnpm exec nx build kppdf-web`: PASS, exit 0; existing NG8102 and production style-budget warnings remain.
- Full Nx lint was attempted and fails on unrelated pre-existing production/older Studio errors; C1 changed files have no lint errors.
- `git diff --check`: PASS.

## Scope integrity

No backend, desktop, legacy `frontend/**`, Data IA, warehouse/supply, S45/S46, editor ribbon/rails, new routes, or foreign WIP was changed. `/studio/templates` and dead docs-nav cleanup remain C2; editor crumbs/right rail remain C3; final docs/index integrity remains C4.

## Executor report (auto)

C1 completed as the first sequential Chrome IA slice. The active landing is now an honest documents list; the next slice is C2 Three Sections.
