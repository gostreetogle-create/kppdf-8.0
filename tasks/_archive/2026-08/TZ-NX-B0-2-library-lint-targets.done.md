# TZ-NX-B0-2: Nx lint targets for data-access / features / http — DONE

**ARCHIVE_MARKER:** DONE 2026-08-29  
**agent_id:** freebuff-b0-2  
**claimed_at:** 2026-08-29T13:35:14+03:00  
**closed_at:** 2026-08-29T13:36:13+03:00

## Summary

- Added `lint` target (`@nx/eslint:lint`) to `data-access`, `features`, `http` project.json — mirrors `paper-and-ink` convention.
- Simplified per-lib `eslint.config.mjs` to extend root only; removed `@nx/dependency-checks` on `package.json` (false positives vs hoisted workspace deps — config wiring fix, not source/package.json deps).

## Gates

| Gate | Result |
|------|--------|
| `nx run data-access:lint` | PASS (0 errors, 1 pre-existing warning) |
| `nx run features:lint` | PASS |
| `nx run http:lint` | PASS |
| `nx run-many -t lint --all` | PASS — **5 projects** (paper-and-ink, data-access, http, kppdf-web, features) |
| `nx build kppdf-web` | PASS |
| `architecture:check:nx` | PASS (192 files, 0 violations) |

## Files changed

- `frontend-nx/libs/data-access/project.json`
- `frontend-nx/libs/features/project.json`
- `frontend-nx/libs/util/http/project.json`
- `frontend-nx/libs/data-access/eslint.config.mjs`
- `frontend-nx/libs/features/eslint.config.mjs`
- `frontend-nx/libs/util/http/eslint.config.mjs`

Full spec: `tasks/TZ-NX-B0-2-library-lint-targets.md`
