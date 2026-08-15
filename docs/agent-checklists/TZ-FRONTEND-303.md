# TZ-FRONTEND-303 checklist

> Status: **DONE**
> Goal: починить старый Jest baseline debt (materials + form-profiles)
> Deploy: НЕ

## Claim slot

- agent_id: Buffy-TZ-FRONTEND-303
- claimed_at: 2026-08-15T00:00:00Z
- workspace: D:\\kppdf-8.0\\.worktrees\\TZ-FRONTEND-303
- branch: feature/TZ-FRONTEND-303
- team_room_claim: unavailable (Team Room: Unknown task; sync tasks first)

## Preflight

- [x] Isolated worktree from origin/main (`afd55cc3` at claim)
- [x] `_NOW` + `_active` checked; no overlap with SALES-375 / other claims
- [x] Claim marker + this checklist filled before code

## Baseline (2026-08-15)

Command:
`pnpm exec jest --config jest.config.js --runInBand --no-coverage src/app/pages/materials/materials.page.spec.ts src/app/pages/materials/materials.page-316.spec.ts src/app/pages/materials/material-detail.page.spec.ts src/app/shared/services/form-profiles.service.spec.ts`

Result: **4 suites failed; 13 failed / 4 passed tests**.

- `materials.page.spec.ts`: 5 tests fail in `afterEach` with `Expected no open requests, found 1: GET /api/dictionary-labels?scope=materialKind`; first and search/filter paths also report `NG0101: ApplicationRef.tick is called recursively` at `TestBed.flushEffects()`.
- `materials.page-316.spec.ts`: 1 test fails with the same open dictionary-label request and `NG0101` at `TestBed.flushEffects()`.
- `material-detail.page.spec.ts`: 6 tests fail at `httpMock.verify()` with the same open dictionary-label request.
- `form-profiles.service.spec.ts`: 1 test fails because it expects `product.name` locked and `product.sku` unlocked; current canonical `LockedRequired` is `product: kind/unit/sku`, `module: name/article`.

Classification: all 13 were stale/incomplete tests, not product-code failures; PO choice was not required.

## Repair

- Added the canonical fallback `PiDictionaryLabelsService` to all three materials TestBeds; no dictionary-label HTTP is sent in these tests.
- Updated the service spec to assert current `LockedRequired` (`product: kind/unit/sku`, `module: name/article`).
- Product and service implementation files unchanged; behavior/API/RBAC unchanged.

## Work

- [x] Baseline failing suites recorded (exact errors)
- [x] Each fail classified: test / code / needs PO
- [x] Materials specs green — focused: 4 suites / 17 tests PASS
- [x] form-profiles.spec green — included above
- [x] No new full-suite regressions — full Jest 154/154 suites, 1444/1444 tests PASS

## Gates

- [x] focused Jest PASS — 4 suites / 17 tests
- [x] frontend tsc PASS — `pnpm exec tsc -p tsconfig.app.json --noEmit`
- [x] eslint changed PASS — 4 changed spec files
- [x] architecture:check PASS — 937 files; baseline 6
- [x] git diff --check PASS
- [x] full frontend test PASS — 154 suites / 1444 tests; target debt gone, no new fails

## Closeout

- [x] Archive: `tasks/_archive/2026-08/TZ-FRONTEND-303.done.md`
- [x] Lock: `.mimocode/locks/TZ-FRONTEND-303-jest-baseline-debt.lock`
- [x] Progress and `_NOW` updated
- [x] Implementation commit/push: `8b60d1f0998b70caa28a1bbe9760c3eec8a8a878`
- [x] Deploy НЕ
