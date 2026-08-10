# TZ-DICT-319 — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-10T17:37:39.9429139Z
closed_by: Buffy / continuous executor
workspace: `D:\kppdf-8.0` (host-managed Freebuff worktree)

## Scope

Added the backend dictionary-label contract for product and material kinds. Global RU seeds are checked idempotently at application bootstrap; authenticated users can read all/active labels with organization plus global visibility; admin/manager can rename labels, reorder them, or deactivate them without changing stable keys. Organization/scope/key identity is protected by a compound unique index and duplicate writes return RU 409.

FE dropdown wiring is intentionally reserved for TZ-DICT-320.

## Acceptance evidence

- Eight global defaults are checked/seeded idempotently: three `productKind` labels and five `materialKind` labels.
- `GET /dictionary-labels` and `GET /dictionary-labels/active` accept `scope`; organization reads include global labels.
- `PATCH /dictionary-labels/:id` has an explicit `@Body()` DTO and is restricted to `admin`/`manager` roles.
- Stable `key` is not exposed as a mutable DTO field; duplicate identity errors map to `ConflictException`.

## Gates

- backend tsc: PASS
- focused Jest: PASS (2 suites, 9/9)
- changed-file ESLint: PASS with one non-blocking existing-style `no-explicit-any` warning in the mock helper
- `git diff --check`: PASS
- Prettier: not installed in backend package; no backend formatter dependency exists in `backend/package.json`
- live browser smoke: NOT RUN; this is an API-only task
- deploy: NO (`deploy.ps1` not run)

## Files

- `backend/src/app.module.ts`
- `backend/src/modules/dictionary-label/dictionary-label.schema.ts`
- `backend/src/modules/dictionary-label/dictionary-label.service.ts`
- `backend/src/modules/dictionary-label/dictionary-label.controller.ts`
- `backend/src/modules/dictionary-label/dictionary-label.module.ts`
- `backend/src/modules/dictionary-label/dto/update-dictionary-label.dto.ts`
- `backend/src/modules/dictionary-label/dictionary-label.service.spec.ts`
- `backend/src/modules/dictionary-label/dictionary-label.controller.spec.ts`
- `docs/agent-checklists/TZ-DICT-319.md`
- `docs/agent-checklists/_active-map.md`
- `.mimocode/locks/TZ-DICT-319-kind-labels-dictionary-be.lock`
