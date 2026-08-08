# TZ-UX-FORM-302 — Form sections canon → QuickCreate

> Status: **DONE**
> Marker: `tasks/_active/TZ-UX-FORM-302.md`
> Commit/push: required by frozen session wave

## Claim slot

- agent_id: `agent-acfffc1331` (Buffy)
- claimed_at: `2026-08-08T08:59:48Z`
- workspace: `D:\kppdf-8.0\.freebuff\worktrees\27b6af5d-6e1c-4846-ad15-e1bb83be400c`
- team_room_claim: unavailable — CLI registry does not contain `TZ-UX-FORM-302`; durable claim message sent

## Preflight

- [x] Repository clean at session start; branch recorded; fast-forward pull from `origin main` completed.
- [x] `_active/` was absent and has been created; no competing active TZ file exists.
- [x] Wave/map, TZ, section canon, dialog cookbook, field-capacity canon, and QuickCreate/Material sources read.
- [x] Conflict keys checked against empty `_active/`; no overlap.
- [x] Claim slot filled before product edits.

## Conflict keys

- `frontend/src/app/shared/ui/form-section/**`
- `frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts`
- `frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts`
- `frontend/src/app/pages/materials/material-form-dialog.component.ts`
- `docs/pages/ui-form-sections-canon.md`
- `docs/DIALOG-COOKBOOK.md`
- this checklist, `_active-map.md`, closeout metadata

## Acceptance

- [x] Shared section primitive; Material uses it.
- [x] QuickCreate M/L uses Material-style sections for basics, dimensions, and extras; empty groups are not rendered.
- [x] FORM-301 field-capacity packing remains intact inside section groups.
- [x] Targeted Jest + frontend TypeScript pass.

## Gates (fact)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- `cd frontend && pnpm exec jest --config jest.config.js src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts src/app/pages/materials/material-form-dialog.component.spec.ts --runInBand` — PASS, 49 tests
- `cd frontend && pnpm exec ng build --configuration development` — PASS
- `cd frontend && pnpm exec eslint <five scoped FORM-302 files>` — PASS
- `git diff --check` — PASS

## Executor report

- Scope is limited to FORM-302 conflict keys plus required checklist/map/progress/archive/lock closeout.
- No photo, BOM, backend profile, nav, desktop, or broad form sweep changes.

## Review handoff

- [x] Focused review after implementation; reviewer findings fixed (exhaustive fallback renderers and deterministic section classes)

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] map checkpoint updated
- closed_at: `2026-08-08T09:05:00Z`
