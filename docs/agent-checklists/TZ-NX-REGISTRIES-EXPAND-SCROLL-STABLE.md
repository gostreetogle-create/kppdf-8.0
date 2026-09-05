# TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE.md`
> Commit/push: per `docs/GIT-POLICY.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-05T11:20:15+03:00
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable (continuous executor tool has no team-room CLI)

## Preflight

- [x] Continuous root and branch verified: `D:\\kppdf-8.0`, `main`
- [x] `_NOW.md` and `tasks/_active/` checked; G14 backend-only keys do not overlap registry page keys
- [x] S2 TZ, registry page/panel/routes, shell scroll container, and current registry specs read
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] Active task marker present

## Acceptance

- [x] Preserve scrollTop across master row expand/collapse navigation via two-frame restore.
- [x] Avoid scrollIntoView for master expand/collapse.
- [x] Measured no page-owned vertical min-height/padding defect; retained normal category gap and panel inset without speculative layout changes.
- [x] Keep URL `/registries/:key` and one expanded row behavior.
- [x] Focused tests pass: direct Jest, 1 suite / 13 tests.
- [x] `nx build kppdf-web` passes (final gate; exit 0).

## Integrity slot

- [x] Type: page/UI polish
- [x] FIC §A–E or N/A reason recorded: existing `/registries` UI behavior; no route, permission, or capability change.
- [x] `docs/pages/registries.page.md` updated
- [x] SECTION-READINESS N/A (no access/section change).
- [x] Foreign WIP excluded from commit; conflict keys respected.
- [x] `docs/COUPLING-MAP.md` N/A (no shared field change).
- [x] `docs/DOCS-INTEGRITY.md` followed.

## Build integrity

- [x] Existing NX build passed immediately before this task during G15 closeout
- [x] No other active TZ claims the registry page conflict key
- [x] Closing `nx build kppdf-web` is the last gate command.

## Gates

- `pnpm exec jest --config apps/kppdf-web/jest.config.ts --runInBand apps/kppdf-web/src/app/pages/registries/registries-page.spec.ts` — PASS (1 suite, 13 tests; exit 0).
- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS (exit 0).
- `pnpm exec eslint apps/kppdf-web/src/app/pages/registries/registries-page.ts apps/kppdf-web/src/app/pages/registries/registries-page.spec.ts` — PASS, 0 errors (exit 0).
- `git diff --check` on S2 paths — PASS (exit 0).
- `pnpm exec nx build kppdf-web` — PASS (exit 0; known existing Angular/style-budget warnings only).

## Executor report

- Captured/restored the `.shell-main` scrollport around route navigation using a two-frame scheduler; URL and single-expand behavior remain unchanged.
- Measured the page wrapper and shared inset: no hidden vertical min-height/padding source was present, so no speculative layout mutation was introduced.
- Conflict disclosure: unrelated workspace changes and G14 backend work remain outside this task.

## Review handoff

- [x] READY FOR REVIEW recorded; this S-sized cleanup has no separate external verdict dependency.

## Closeout

- [x] archive + lock + progress + remove `_active`
- closed_at: 2026-09-05T11:31:00+03:00
