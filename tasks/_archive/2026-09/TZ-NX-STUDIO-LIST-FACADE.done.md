# TZ-NX-STUDIO-LIST-FACADE

**Agent:** freebuff
**PAGES:** `/studio`
**Conflict keys:** `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts`, `studio-list.facade.ts`

## Outcome

- Extracted `StudioListFacade` with Signals and page-scoped provider.
- Moved list loading/filtering/selection/bulk-delete/template picker/create/duplicate/delete orchestration out of `StudioListPage`.
- Kept the page OnPush and behavior/template contracts unchanged.
- Did not touch `registries/**` or `registry-forms/**`.

## Gates

- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS (exit 0)
- `pnpm exec nx test kppdf-web apps/kppdf-web/src/app/pages/studio/studio-list.page.spec.ts` — PASS (12/12)
- `pnpm exec nx test kppdf-web apps/kppdf-web/src/app/pages/studio/studio-templates-list.page.spec.ts` — PASS (8/8)
- `pnpm exec nx lint kppdf-web` — baseline FAIL: existing repository-wide lazy-boundary/accessibility errors
- `pnpm exec nx build kppdf-web` — PASS (exit 0, last gate; existing warnings only)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing)
  - build: PASS
  - checklist: ADDED
  - progress.md: N/A (refactor-only)
  - status synchronization: PASS
