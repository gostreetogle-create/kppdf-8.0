# TZ-UX-FORM-303 — QuickCreate L photo

> Status: **DONE**
> Marker: `tasks/_active/TZ-UX-FORM-303.md`
> Commit/push: required by frozen session wave

## Claim slot

- agent_id: `agent-acfffc1331` (Buffy)
- claimed_at: `2026-08-08T09:06:28Z`
- workspace: `D:\kppdf-8.0\.freebuff\worktrees\27b6af5d-6e1c-4846-ad15-e1bb83be400c`
- team_room_claim: unavailable — registry does not contain FORM-303; durable claim message sent

## Preflight

- [x] FORM-302 committed/pushed as `7bc88e1`; working tree clean before claim.
- [x] `_active/` contains only `TZ-UX-FORM-303.md`; no same-key competitor.
- [x] TZ, PhotosService, Product FullEditor upload pattern, QuickCreate, and wave scope read.
- [x] FullEditor migration is not required for AC and is excluded to avoid widening Layer-3 scope.

## Conflict keys

- `frontend/src/app/shared/ui/quick-create/**`
- `frontend/src/app/shared/ui/photo/**`
- `frontend/src/app/pages/products/product-form-dialog.component.ts`
- this checklist, passport audit, `_active-map.md`, closeout metadata

## Acceptance

- [x] Product QuickCreate L supports file pick and drag/drop.
- [x] L shows photo previews and remove action.
- [x] Uploaded photo IDs are included in product create payload.
- [x] Shared photo component exists; FullEditor migration explicitly deferred as known limitation.
- [x] Targeted Jest, tsc, Angular build and lint pass.

## Gates (fact)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- `cd frontend && pnpm exec ng build --configuration development` — PASS
- `cd frontend && pnpm exec jest --config jest.config.js src/app/shared/ui/photo/photo-dropzone.component.spec.ts src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts --runInBand` — PASS, 2 suites / 14 tests
- `cd frontend && pnpm exec eslint <four scoped FORM-303 files>` — PASS
- `git diff --check` — PASS

## Executor report

- No composition/BOM, backend schema, FormProfile FieldKey, deploy, or module-photo changes.

## Review

- [x] Focused review completed; fixed orphan cleanup, photo section gating, submit disabled state, and dropzone input-sync feedback risk.

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] map checkpoint updated
- closed_at: `2026-08-08T09:11:00Z`
