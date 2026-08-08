# TZ-UX-FORM-304 — QuickCreate L composition

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-UX-FORM-304.done.md`
> Commit/push: required by frozen session wave

## Claim slot

- agent_id: `agent-acfffc1331` (Buffy)
- claimed_at: `2026-08-08T09:11:45Z`
- workspace: `D:\kppdf-8.0\.freebuff\worktrees\27b6af5d-6e1c-4846-ad15-e1bb83be400c`
- team_room_claim: unavailable — registry does not contain FORM-304; durable claim message sent

## Preflight

- [x] FORM-303 committed/pushed as `ca77188`; working tree clean before claim.
- [x] `_active/` contains only `TZ-UX-FORM-304.md`; no same-key competitor.
- [x] TZ, ProductBomPanel, Product detail integration, dialog shell, and composition service patterns read.
- [x] Scope is reuse-only; no new tree, backend rule, DTO, FormProfile key, or deploy.

## Conflict keys

- `frontend/src/app/shared/ui/quick-create/**`
- `frontend/src/app/pages/products/product-bom-panel.component.ts`
- `frontend/src/app/shared/ui/dialog/pi-dialog.component.ts`
- this checklist, passport/canon docs, `_active-map.md`, closeout metadata

## Acceptance

- [x] Product QuickCreate L create succeeds without immediate close.
- [x] The same dialog exposes reused ProductBomPanel on the live created product ID.
- [x] Footer offers «Готово» and empty BOM is allowed.
- [x] Product BOM dialog is wider but remains below kind-D scale.
- [x] Targeted Jest, tsc, Angular build and lint pass.

## Gates (fact)

- [x] `pnpm exec tsc -p tsconfig.app.json --noEmit`
- [x] `pnpm exec ng build --configuration development`
- [x] targeted Jest: QuickCreate + ProductBomPanel, 18/18
- [x] scoped ESLint
- [x] scoped Prettier
- [x] `git diff --check`

## Executor report

- Module L BOM support is left unchanged; Product L is the required composition flow.
- No composition tree duplication, backend changes, or FormProfile keys were introduced.


- Product L is the implemented composition flow; Module L remains unchanged and is recorded as a known limitation.
- The actual page-level ProductBomPanel is imported and rendered in the smoke test with its service dependencies mocked; no second tree or picker was created.

## Closeout

- [x] Archive: `tasks/_archive/2026-08/TZ-UX-FORM-304.done.md`
- [x] Lock: `.mimocode/locks/TZ-UX-FORM-304-quickcreate-L-composition.lock`
- [x] `progress.md` updated
- [x] `_active-map.md` updated
- [x] `tasks/_active/TZ-UX-FORM-304.md` removed
