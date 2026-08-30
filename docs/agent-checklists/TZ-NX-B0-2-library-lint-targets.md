# TZ-NX-B0-2-library-lint-targets checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-B0-2-library-lint-targets.done.md`

## Claim slot
- agent_id: freebuff-b0-2
- claimed_at: 2026-08-29T13:35:14+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: N/A

## Acceptance
- [x] `lint` target added to data-access, features, http project.json.
- [x] `nx run data-access:lint` PASS (0 errors).
- [x] `nx run features:lint` PASS (0 errors).
- [x] `nx run http:lint` PASS (0 errors).
- [x] `nx run-many -t lint --all` runs 5 projects.
- [x] `nx build kppdf-web` PASS.
- [x] `architecture:check:nx` PASS.

## Integrity slot
- [x] Тип изменения: frontend-nx Nx config only.
- [x] FIC: N/A — no runtime behavior change.
- [x] page.md / PAGE-TZ-INDEX: N/A.
- [x] SECTION-READINESS: N/A.
- [x] Чужой WIP не в коммите; conflict keys: data-access, features, http project.json.
- [x] Coupling map: N/A.
- [x] Канон: docs/DOCS-INTEGRITY.md.

## Gates
- `nx run data-access:lint`: PASS (0 errors, 1 warning).
- `nx run features:lint`: PASS.
- `nx run http:lint`: PASS.
- `nx run-many -t lint --all`: PASS — 5 projects, 0 errors.
- `nx build kppdf-web`: PASS.
- `pnpm run architecture:check:nx`: PASS (0 violations).

## Executor report
- Added `lint` target to three lib project.json files mirroring paper-and-ink.
- Removed `@nx/dependency-checks` json block from eslint.config.mjs (hoisted-deps false positive; config-only fix).
- **Outcome: PASS.**

## Closeout
- [x] Archive created.
- [x] Active marker removed.
- closed_at: 2026-08-29T13:36:13+03:00
