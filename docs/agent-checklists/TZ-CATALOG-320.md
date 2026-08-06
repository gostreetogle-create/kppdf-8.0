# TZ-CATALOG-320 checklist

> Status: **READY FOR REVIEW / IN PROGRESS** (implementation uncommitted; closeout blocked by pre-existing frontend-wide errors)
> Marker: `tasks/_active/TZ-CATALOG-320.md`
> Commit/push: **allowed by the session PO instruction, scoped to TZ-320 conflict keys and closeout files only**

## Claim slot

- agent_id: `agent-796e2f8bba` / Buffy `openai/gpt-5.6-luna`
- claimed_at: `2026-08-06T16:10:00Z`
- workspace: `D:\kppdf-8.0` (Freebuff execution worktree mirrors canonical main)
- team_room_claim: `pending` (Team Room joined; claim command unavailable until task sync exposes TZ-320)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel checked; repository root is the Freebuff worktree mirror of `D:\kppdf-8.0`.
- [x] `git pull --ff-only origin main` — PASS / already up to date. Plain `git pull --ff-only` could not run because this isolated branch has no upstream.
- [x] Read `_active-map.md` + `tasks/_active/`; no active TZ marker or claimed conflict key was present.
- [x] Read TZ-320, session SoT, TZ-CATALOG-300 canon, GEMINI, AI Agent Guide, PO Diary §1–§4, OrchestratorKit instructions.
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS.
- [x] `tasks/_active/TZ-CATALOG-320.md` created.

## Conflict keys

- `frontend/src/app/shared/services/pi-product-modules.service.ts`
- `frontend/src/app/shared/services/pi-product-modules.service.spec.ts`
- `frontend/src/app/pages/products/product-form-dialog.component.ts`
- `frontend/src/app/pages/products/product-form-dialog.component.spec.ts`
- `frontend/src/app/pages/products/product-detail.page.ts`
- `frontend/src/app/pages/products/product-module-picker-dialog.component.ts`
- `frontend/src/app/pages/products/product-composition-picker-dialog.component.ts`
- `frontend/src/app/pages/products/product-composition-picker-dialog.component.spec.ts`
- `frontend/src/app/pages/modules/module-materials-form-dialog.component.ts`
- `frontend/src/app/pages/modules/module-materials-form-dialog.component.spec.ts`
- `frontend/src/app/pages/modules/module-form-dialog.component.ts`
- `docs/pages/products.page.md`
- `docs/pages/product-detail.page.md`
- `docs/pages/modules.page.md`
- `docs/pages/module-detail.page.md`
- closeout: `tasks/_active/TZ-CATALOG-320.md`, this checklist, `_active-map.md`, `progress.md`, archive, lock

## Acceptance

- [x] Composition types/DTOs support product lines and product-only non-negative price override.
- [x] Module composition supports child module + material, excludes self module, and shows material kind labels.
- [x] Product composition supports module + non-raw material + product, excludes self product, rejects raw clearly, and derives `Комплекс`.
- [x] Module dimensions use `formGroupName="dimensions"`.
- [x] Focused Jest coverage added/updated for service product DTO, product picker, product complex badge, module child/self-exclusion + kind labels.
- [x] Four page docs updated with successor limitation 311.

## Gates (fact)

- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — BLOCKED by pre-existing errors in `inventory/warehouse-group-chips.ts`, `materials.page.ts`, and `inventory-dashboard.page.ts`; no TZ-320 file appears in the error list.
- [x] `cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern="pi-product-modules|product-form|product-composition-picker|module-materials|module-form|product-detail"` — PASS (5 suites / 48 tests).
- [x] Scoped ESLint on all TZ-320 changed frontend TS/spec files — PASS.
- [x] Scoped Prettier check on all TZ-320 changed frontend TS/spec files — PASS.
- [ ] Browser/DOM smoke — not run; no frontend server was started (deploy/start prohibited by session).

## Executor report

- Implemented the requested FE type/picker/form/detail/docs changes in the scoped files; focused Jest is 53/53.
- Full app tsc remains blocked by unrelated frontend errors in inventory/materials files; no TZ-320 file appears in the error list. No archive/lock was created and the `_active` marker intentionally remains until the required gate is resolved.
- Team Room claim/heartbeat commands report `Unknown task` because the local Team Room task index does not include the backlog TZ; checklist claim slot is authoritative per project contract.

## Review handoff

- [x] READY FOR REVIEW after focused gates and scoped lint/format checks
- [ ] Cursor/PO PASS before archive if required by session contract
- [x] Current state is not eligible for DONE archive because required tsc gate is blocked by unrelated frontend errors.

## Closeout

- [ ] Archive + ARCHIVE_MARKER
- [ ] Lock
- [ ] Progress and active map
- [ ] Remove active marker
- [ ] Status = DONE
