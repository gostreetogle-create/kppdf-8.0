# TZ-BACKEND-CONTRACT-C3-ATTACH-FILE checklist

> Status: **DONE**
> Marker: archived; active marker removed after archive
> Commit/push: required and completed for this TZ

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-03T10:20:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (continuous executor; no Team Room CLI)

## Preflight

- [x] `git status` / branch / worktree checked; continuous `main`
- [x] `_NOW.md` + `tasks/_active/` checked; no competing Contract conflict key
- [x] Master START block, C3 TZ, backend contract module and upload conventions read
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] Marker existed before product edits

## Acceptance

- [x] `PUT /contracts/:id/attachment` accepts multipart field `file`, persists a Photo reference, and sets `contractStatus=file_attached`
- [x] Empty file returns 400; missing/soft-deleted contract returns 404
- [x] `DELETE /contracts/:id/attachment` clears attachment fields and sets `contractStatus=none`
- [x] Lifecycle `Contract.status` remains untouched
- [x] Both endpoints are admin/manager-only and audited
- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: module
- [x] FIC §A–E: N/A except backend module/API; no UI route in this TZ
- [x] page.md / PAGE-TZ-INDEX: deferred to C5 docs; no UI route changed
- [x] SECTION-READINESS: N/A; no user-contour change
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: deferred to C5 because C3 only implements API field write-path
- [x] Канон: `docs/DOCS-INTEGRITY.md` read

## Gates (факт)

- `cd backend && pnpm exec jest --config jest.config.ts modules/contract/contract.controller.spec.ts modules/contract/contract.service.spec.ts --runInBand` → PASS (2 suites, 8 tests)
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS (exit 0)
- `cd backend && pnpm exec eslint src/modules/contract/contract.controller.ts src/modules/contract/contract.service.ts src/modules/contract/contract.module.ts src/modules/contract/contract.controller.spec.ts src/modules/contract/contract.service.spec.ts` → PASS (exit 0)

## Executor report

- Added memory-backed multipart `PUT /contracts/:id/attachment` and audited `DELETE /contracts/:id/attachment`.
- Stored contract files under the configured uploads root in `contracts/`, registered metadata via `PhotosService`, and persisted the Photo id and URL on Contract.
- Replacement and removal clean up the prior Photo best-effort; missing/soft-deleted contracts are rejected before file writes.
- `Contract.status` lifecycle FSM is unchanged.
- Parallel KP-family and unrelated dirty files remain unstaged.

## Closeout

- [x] archive + lock record created
- [x] active marker removed
- [x] wave advanced to C4
- [x] commit and push completed

closed_at: 2026-09-03T10:35:00+03:00
