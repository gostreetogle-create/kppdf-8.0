# TZ-NX-DOCSTUDIO-C2-THREE-SECTIONS — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-06T17:29:03+03:00
closed_by: freebuff
agent_id: freebuff
workspace: `D:\kppdf-8.0`
implementation_sha: pending focused commit

## Outcome

- Three live sections: `/studio` = Документы list, `/studio/templates` = Шаблоны journal, `/studio/:id` = Студия editor (unchanged until C3).
- `templates` route registered BEFORE `:id`; route-order regression spec added.
- New `StudioTemplatesListPage`: chrome crumbs `Документы / Шаблоны`, templates journal with orientation/pageSize/inactive columns, «Создать документ» per row (→ editor via `rememberStudioDocument`), destructive-confirm delete (same pattern as template-picker), loading/empty/error+retry states, `data-test="studio-templates-list"`.
- `/studio` list: old eyebrow/H1 replaced by `app-pi-page-chrome` crumbs `Документы`; creation CTAs row now includes ghost link «Шаблоны» → `/studio/templates`.
- Nav docs category: only `/studio` (Документы, `doc-studio`) + `/studio/templates` (Шаблоны, `doc-templates`); dead `/doc-constructor/*` and `/import-todos` removed. Both pageKeys already exist in backend RBAC seed (`permissions.constants.ts`, `admin.seed.ts`) — no new permission keys.
- `pi-page-chrome.component.ts` consumed only (public `@kppdf/ui/page` entry); API untouched.

## Changed files

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio.routes.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.spec.ts` (no test-body change needed — chrome kept data-tests)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-templates-list.page.ts` (new)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-templates-list.page.spec.ts` (new)
- `frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/route-paths.spec.ts`

## Verification

- Baseline `nx build kppdf-web` (pre-claim): PASS, exit 0.
- App typecheck `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`: PASS, exit 0.
- Focused tests: 39 passed / 0 failed (studio-templates-list 8, studio-list 5, nav-categories, route-paths incl. new route-order test, app-shell-constructor-nav 2, warehouse/registries-nav 3, app-shell 21).
- Changed-file ESLint: 0 errors (16 pre-existing non-null warnings in specs).
- Full `pnpm lint`: FAIL on pre-existing unrelated production/older Studio files — disclosed baseline limitation, unchanged by C2.
- Final `nx build kppdf-web` (LAST gate): PASS, exit 0.
- `git diff --check`: PASS.

## Scope integrity

No backend schema/permission changes, no desktop, no legacy `frontend/**`, no Data IA витрина, no warehouse/supply, no S45/S46, no editor ribbon/rails changes (C3), no A4 geometry change, no foreign WIP staged. `document-studio.page.md` final copy belongs to C4.

## Executor report (auto)

C2 delivered the three-section IA. Next slice: C3 ribbon→rails (crumbs-only editor header, actions to right chrome-rail, dirty guard on crumb).
