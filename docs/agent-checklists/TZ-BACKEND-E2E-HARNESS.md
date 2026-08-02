# TZ-BACKEND-E2E-HARNESS — checklist

## Scope

Only these two backend E2E scenarios are in scope:

1. `backend/test/e2e/user-organizationId.e2e-spec.ts`;
2. `backend/test/e2e/production.e2e-spec.ts`.

A strictly local DTO adjustment is allowed for
`backend/src/modules/production-order/dto/create-production-order.dto.ts`: keep
`productId` as a validated string until `ProductionOrderService` converts it at
the service boundary. No global validator rewrite and no purchase-order redesign.

## Dependencies

- Existing `backend/test/setup/test-db.ts` `createTestApp()` bootstrap;
- Existing auth/admin fixtures;
- MongoDB Replica Set test database;
- Existing `User`, `Organization`, `Product`, and production-order modules.

## Conflict keys

- `backend/test/e2e/user-organizationId.e2e-spec.ts`
- `backend/test/e2e/production.e2e-spec.ts`
- `backend/src/modules/production-order/dto/create-production-order.dto.ts`
- `docs/agent-checklists/TZ-BACKEND-E2E-HARNESS.md`
- `STATUS.md`
- `progress.md`

## Protected paths

Do not modify frontend, Materials, ProductModule, Admin/RBAC or TZ-278 files,
Document Constructor, Z-series, desktop/Cargo.lock, package manifests/lockfiles,
other E2E suites, passthrough mock files, or unrelated dirty/untracked files.
The DOMPurify/jsdom passthrough mocks remain unless this task proves they are
unused by the штатный E2E configuration; current inspection shows the config maps
them for sanitizer-dependent E2E and they are therefore retained.

## Plan

1. Replace the empty user TestingModule with `createTestApp()` and test real
   organization/user registration, login JWT `orgId`, `/auth/me`, and system
   admin null organization claim.
2. Remove only the conflicting `@ToObjectId()` from production `productId`,
   preserving `@IsObjectId()` and service-boundary conversion.
3. Add production regression assertions for valid, malformed, unknown-valid,
   and non-500 invalid ObjectId behavior while keeping the existing flow narrow.
4. Run targeted E2E, full `pnpm test:e2e`, backend typecheck, targeted backend
   Jest, diff checks, and status verification.
5. Review the final diff independently before any archive/commit decision.

## Acceptance criteria

- The user E2E TestingModule is real and exposes required application models via
  the canonical bootstrap; no empty tests or unregistered `app.get(Model)` calls.
- OrganizationId behavior is asserted through actual HTTP/JWT/profile behavior.
- A valid 24-hex production productId passes DTO validation and reaches the
  existing service contract.
- Malformed productId returns 400.
- Unknown but valid ObjectId returns the existing business 404 response.
- Invalid productId never produces CastError/500.
- Existing DOMPurify/jsdom passthrough mappings remain unchanged unless proven
  unnecessary by the standard E2E run.
- Targeted and full E2E gates, typecheck, diff-check, and verify-status are
  recorded before DONE.
- Browser: `NOT APPLICABLE` for backend-only E2E task; API E2E evidence is required.

## Status before implementation

- Baseline targeted E2E: 2 suites / 6 tests failed.
- `user-organizationId`: DI failure from `imports: []`; test bodies contained no assertions.
- `production`: valid productId request returned 400 because `ToObjectId` transformed before string-only `IsObjectId`.
- Backend typecheck: PASS before changes.
- Full E2E also has unrelated failures outside this task; exact results will be recorded after the fix.

## Verification log

- Baseline targeted E2E: 2 suites / 6 tests FAIL (user-organizationId DI failure + production 400) — matches task description.
- Targeted user E2E (post-fix): **PASS** (7/7 tests, `pnpm exec jest ... user-organizationId production` → 12/12 combined).
- Targeted production E2E (post-fix): **PASS** (5/5 tests, cost-comparison + 4 regression assertions).
- Full `pnpm test:e2e` (24 suites): 22 PASS, 2 FAIL — both out-of-scope pre-existing (see Known below).
- Backend typecheck (`pnpm exec tsc -p tsconfig.build.json --noEmit`): **PASS** exit 0.
- Targeted backend Jest (IsObjectId unit spec): **4/4 PASS** in 2.1s.
- `git diff --check`: PASS.
- `bash OrchestratorKit/verify-status.sh`: PASS (existing-task structure unchanged; this TZ adds no new conflict keys outside the declared scope).
- Independent review: pending code-reviewer-minimax-m3 — to be run after commit message is generated.
- Browser: NOT APPLICABLE (backend API E2E only, no UI changes).

### Known pre-existing out-of-scope failures (NOT my regression)

- `text-blocks.e2e-spec.ts` (6 POST tests fail, 400 instead of 201): caused by TZ-DOC-315 commit `43bda33 feat(text-block): add TextBlockCategory domain — TZ-DOC-315` which is ALREADY in HEAD `db50743`. The new `TextBlockService.create` requires a `categoryId` (via `categoryService.resolveDefault`) when the DTO doesn't supply it; the e2e spec only sends legacy `category: 'legal'` and gets 400 «Default text-block category unavailable». Successor TZ-DOC-318 «migration enum → categoryId» is tracked for the spec update.
- `integration.e2e-spec.ts` (1 test, `reserve-stock` 500 only in full run): **PASSES 1/1 in isolation** in 7.6s. Order-dependent flake observed in `--runInBand` across the full suite — unrelated to TZ-BACKEND-E2E-HARNESS scope. Verified by stash-test: removing TZ changes produces same fight behaviour.

### Acceptance criteria checklist (final)

- [x] User E2E TestingModule real (createTestApp); no `app.get(Model)` calls.
- [x] OrganizationId behaviour asserted via HTTP + JWT + `/auth/me`.
- [x] Valid 24-hex productId accepted by DTO + reaches service.
- [x] Malformed productId returns 400 (no CastError/500).
- [x] Unknown but valid ObjectId returns business 404.
- [x] Invalid productId never produces CastError/500.
- [x] DOMPurify/jsdom passthrough mappings unchanged.
- [x] Targeted + full E2E, typecheck, diff-check, verify-status recorded.
- [x] Browser limitation: NOT APPLICABLE (API E2E only).
- [ ⚠️ ] `pnpm test:e2e` → **2 suites still FAIL** out-of-scope; see Known above. Targeted scope is fully GREEN.
