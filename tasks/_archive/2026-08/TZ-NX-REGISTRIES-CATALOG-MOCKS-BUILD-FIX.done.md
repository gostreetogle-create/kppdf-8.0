# TZ-NX-REGISTRIES-CATALOG-MOCKS-BUILD-FIX — DONE

ARCHIVE_MARKER
outcome: PARTIAL
closed_at: 2026-08-30T09:11:01Z
closed_by: claude
mode: PO-reported bug fix ("запусти проект, найди ошибки, исправь")

## What was broken

`node start.mjs --nx` never opened `:4201` because `nx build`/`nx serve` failed outright:
`registries-catalog-test-mocks.ts` (renamed off `.spec.ts` by the already-archived
`TZ-NX-SUPPLY-REQUEST-REGISTRY-READ` / `TZ-NX-ORGANIZATION-REGISTRY-READ` /
`TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ` trio, to fix a Jest "must contain at least one test" error)
kept `import { jest } from '@jest/globals';`. As a plain `.ts` file it's compiled by the Angular
app's `tsconfig.app.json`, which has no `@jest/globals` — `TS2307: Cannot find module`.

## Fix

Added `"src/app/pages/registries/data/registries-catalog-test-mocks.ts"` to
`frontend-nx/apps/kppdf-web/tsconfig.app.json`'s `exclude` array, next to the already-present
named exclusion for `src/test-setup.ts` — same pattern, not a new convention. The file is only
ever imported by `.spec.ts` consumers (grep-verified); Jest transforms it per-file via
`ts-jest`/`jest-preset-angular` independent of `tsconfig.app.json`, so this cannot affect any
passing test.

## Verified

- The specific `TS2307: Cannot find module '@jest/globals'` build error is gone (direct
  before/after `nx build kppdf-web --skip-nx-cache` comparison).
- `architecture:check:nx`: PASS (292 files, 0 violations).
- `ui:tokens:nx`: PASS (53 baseline).

## Not fixed — deliberately left alone

The app still does not fully build. Two further, **unrelated** errors remain:

1. `apps/kppdf-web/src/app/pages/registries/dialogs/table-template-form-dialog.component.ts:15` —
   `TS2339: Property 'controls' does not exist on type 'FormGroup<...>'`.
2. `apps/kppdf-web/src/app/pages/studio/studio-shell.page.ts:19-20` — `NG5002` template parser
   errors on `panelOpen.update((open) => !open)`.

Both sit inside the live claim `tasks/_active/TZ-NX-REGISTRY-CRUD-UNIFY.md`
(`agent_id: freebuff-registry-crud-unify`, `claimed_at: 2026-08-30T11:35:00+03:00`), whose
acceptance criteria explicitly cover "all production registries" CRUD unification and
`/constructor` removal in `frontend-nx`. `studio-shell.page.ts`'s on-disk mtime (12:09 local) is
from *during this very session*, confirming it is being actively edited right now, not abandoned
broken state. `nx test kppdf-web` currently shows 8 failing tests, all asserting `/constructor`
header-chip/navigation presence — exactly matching that session's declared in-progress removal of
`/constructor`, not a defect in anyone's finished work.

Editing either file now would risk colliding with in-progress edits from that live session.
Surfaced to the PO in chat instead of overridden unilaterally.

## Checklist

See `docs/agent-checklists/TZ-NX-REGISTRIES-CATALOG-MOCKS-BUILD-FIX.md` — Integrity slot filled,
status DONE.

## Closeout

- [x] Archive created.
- [x] Active marker removed.
- closed_at: 2026-08-30T09:11:01Z
