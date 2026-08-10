# TZ-DICT-319 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-DICT-319.md` (removed at closeout)
> Commit/push: **YES** per continuous wave prompt

## Claim slot

- agent_id: `Buffy/freebuff-259639d6-2fe2-49fd-bb50-6b4af549f3c3`
- claimed_at: `2026-08-10T17:34:30.8634091Z`
- workspace: `D:\kppdf-8.0` (host-managed isolated worktree)
- team_room_claim: best-effort attempted

## Acceptance

- [x] Idempotent global seeds provide active productKind/materialKind RU labels (8 defaults).
- [x] GET all and GET active endpoints support scope filtering and organization + global visibility.
- [x] Admin/manager PATCH can change label, sortOrder, and isActive; stable key is immutable.
- [x] Compound unique `(organizationId, scope, key)` contract is declared; duplicate errors map to RU 409.
- [x] Backend tsc and targeted Jest pass.

## Integrity slot

- [x] Type: backend module/API.
- [x] FIC §A–E: route wiring is API-only; page docs N/A; FE wire reserved for TZ-DICT-320.
- [x] Foreign WIP excluded; conflict keys respected.
- [x] Canon: `docs/DOCS-INTEGRITY.md`.

## Gates (fact)

- [x] `pnpm exec tsc -p tsconfig.build.json --noEmit`
- [x] Dictionary-label Jest: 2 suites / 9 tests PASS
- [x] Changed-file ESLint: PASS (one existing-style `no-explicit-any` warning in test helper)
- [x] `git diff --check`: PASS
- [x] Prettier: unavailable in backend package; documented as not installed (no formatter dependency in `backend/package.json`)

## Executor report (auto)

- status: DONE
- changed: dictionary-label schema/service/controller/module/DTO/tests, app module registration, checklist/archive/lock/progress metadata.
- conflict disclosure: no competing `_active` keys at claim time; FE dropdown wire remains explicitly reserved for TZ-DICT-320.
- known limits: organization overrides are read/patch scoped; seed keys remain immutable; deploy was not run.

## Closeout

- [x] Archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-10T17:37:39.9429139Z`
