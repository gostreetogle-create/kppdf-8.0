# TZ-NX-REGISTRIES-CATALOG-MOCKS-BUILD-FIX checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-08/TZ-NX-REGISTRIES-CATALOG-MOCKS-BUILD-FIX.done.md`
> Mode: bug fix, PO-reported ("запусти проект, найди ошибки, исправь")

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-30T09:11:01Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] `tasks/_active/` checked — empty except `.gitkeep` at claim time (the live
      `TZ-NX-REGISTRY-CRUD-UNIFY` Freebuff claim appeared moments later; its scope
      (`registries.catalog.ts` CRUD unification, `/constructor` removal, studio/dialog files)
      does not include `tsconfig.app.json` or the mocks file itself — confirmed no overlap
- [x] Root cause traced: `registries-catalog-test-mocks.ts` (renamed off `.spec.ts` by the
      already-archived `TZ-NX-{SUPPLY-REQUEST,ORGANIZATION,PRODUCT-PASSPORT}-REGISTRY-READ` trio)
      still imports `{ jest } from '@jest/globals'`, which the Angular app tsconfig can't resolve
      → `nx build`/`nx serve` fail with `TS2307`, which is why `node start.mjs --nx` never opened
      `:4201` (no bundle to serve)
- [x] Confirmed the file is only ever imported by `.spec.ts` consumers (grep) — Jest transforms it
      per-file via `ts-jest`/`jest-preset-angular` regardless of `tsconfig.app.json`, so excluding
      it from the app tsconfig cannot affect the 268 passing kppdf-web tests

## Acceptance

- [x] `frontend-nx/apps/kppdf-web/tsconfig.app.json` — added
      `"src/app/pages/registries/data/registries-catalog-test-mocks.ts"` to `exclude`, alongside
      the existing named exclusion for `src/test-setup.ts` (same pattern, not a new convention)
- [x] No change to the mocks file itself, no change to any consuming spec

## Gates (факт)

- `nx build kppdf-web --skip-nx-cache`: the specific `TS2307: Cannot find module '@jest/globals'`
  error is **gone** after this fix (confirmed by direct re-run — error list dropped from that error
  to zero occurrences of it). Overall `kppdf-web:build:production` still fails, but only on two
  **unrelated** files (`table-template-form-dialog.component.ts`, `studio-shell.page.ts`) that are
  outside this fix's scope — see Known limitation.
- `architecture:check:nx`: PASS (292 files, 0 violations)
- `ui:tokens:nx`: PASS (53 baseline)
- `nx test kppdf-web`: not clean right now, but the failures present (8 tests, all asserting
  `/constructor` header-chip/navigation behavior in `route-paths.spec.ts`, `nav-categories.spec.ts`,
  `app-shell-constructor-nav.spec.ts`, `app-shell.component.spec.ts`) are unrelated to this fix —
  they match exactly the live `TZ-NX-REGISTRY-CRUD-UNIFY` Freebuff session's declared acceptance
  criterion *"Constructor routes/pages/navigation are removed from frontend-nx"*, mid-transaction.
  Not this task's regression, not fixed here.

## Known limitation

Two build-blocking errors remain, deliberately **not** touched by this task:

1. `apps/kppdf-web/src/app/pages/registries/dialogs/table-template-form-dialog.component.ts:15` —
   `TS2339: Property 'controls' does not exist on type 'FormGroup<...>'`.
2. `apps/kppdf-web/src/app/pages/studio/studio-shell.page.ts:19-20` — `NG5002` parser errors on
   `panelOpen.update((open) => !open)` plus a resulting `TS2339`.

Both sit inside the live `tasks/_active/TZ-NX-REGISTRY-CRUD-UNIFY.md` claim's declared territory
(`freebuff-registry-crud-unify`, claimed 2026-08-30T11:35:00+03:00, scope: unify CRUD across all
production registries, remove `/constructor`). `studio-shell.page.ts` was directly observed with a
file-modified timestamp of 12:09 local — during this very session — confirming it is being actively
edited by that live process, not abandoned/broken state. Fixing either file now would risk
colliding with in-progress work. Flagged to the PO in chat rather than fixed unilaterally.

## Integrity slot

- [x] Тип изменения: page (build-config fix, single file)
- [x] FIC §A–E: N/A — no route/permission/behavior change
- [x] page.md / PAGE-TZ-INDEX: N/A — internal build-tooling fix, not a page-facing change
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys: `frontend-nx/apps/kppdf-web/tsconfig.app.json` only —
      verified zero overlap with the live `TZ-NX-REGISTRY-CRUD-UNIFY` claim's territory before
      editing
- [x] Coupling map: N/A
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Executor report

- Root cause found and fixed: a regression from an already-archived task (mocks file rename left a
  Jest-only import reachable by the Angular app compiler) that fully blocked `nx build`/`nx serve`
  — explains why the PO's dev server never bound to `:4201`.
- Two further build-blocking errors exist but were left alone: both sit inside a live, actively
  mid-edit Freebuff session's declared scope. Reported to PO for a decision rather than overridden.
- outcome: **PARTIAL** (one confirmed regression fixed and verified; app still won't fully build
  until the live parallel session's in-progress edits settle)

## Closeout

- [x] Archive created.
- [x] Active marker removed.
- closed_at: 2026-08-30T09:11:01Z
