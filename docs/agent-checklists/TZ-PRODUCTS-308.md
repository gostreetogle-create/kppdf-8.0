# TZ-PRODUCTS-308 checklist

> Status: **DONE** · Wave: PRODUCT-EDITOR #1
> Source: `tasks/_backlog/product-editor/TZ-PRODUCTS-308-izdelie-dense-fulleditor.md`
> Archive: `tasks/_archive/2026-08/TZ-PRODUCTS-308.done.md`
> Lock: `.mimocode/locks/TZ-PRODUCTS-308-izdelie-dense-fulleditor.lock`

## Claim slot
- agent_id: `agent-3e757640b7`
- claimed_at: `2026-08-08T19:41:45Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable` — Team Room registry does not contain TZ-PRODUCTS-308

## Preflight
- [x] Canonical workspace `D:\kppdf-8.0`, branch `main` verified; base `eb5ce391`, clean before claim.
- [x] `_active-map.md` and `tasks/_active/` checked; no conflicting active claim.
- [x] Wave, TZ, universal stop rules, template, AI Agent Guide, and PO diary §§1–4 read.
- [x] Claim slot filled before product-code changes.
- [x] `tasks/_active/TZ-PRODUCTS-308.md` created before implementation.

## Acceptance
- [x] Edit/create title uses «изделие», not «продукт».
- [x] `good` kind label is «Изделие»; success toasts use «Изделие».
- [x] Desktop layout presents the main blocks in three columns; mobile stacks them.
- [x] Dimension/weight/unit/color fields use narrow capacity wrappers.
- [x] Composition/profile-L hint is absent until TZ-PRODUCTS-309.
- [x] Create/update payload contract and null-clearing behavior remain intact.
- [x] Product page documentation uses the «Изделие» UI name and records the new layout.

## Gates
- [x] `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `pnpm --dir frontend exec jest src/app/pages/products/product-form-dialog.component.spec.ts --runInBand` — PASS, 24/24
- [x] `pnpm --dir frontend exec ng build --configuration=development` — PASS
- [x] `pnpm --dir frontend exec eslint src/app/pages/products/product-form-dialog.component.ts src/app/pages/products/product-form-dialog.component.spec.ts` — PASS
- [x] `pnpm --dir frontend exec prettier --check ...` — PASS
- [x] `git diff --check` — PASS
- [ ] `bash OrchestratorKit/verify-status.sh` — FAIL on pre-existing 72 legacy kit-era entries outside this TZ; disclosed, not altered.

## Executor report
- FullEditor user-facing terminology is «Изделие»; code/API identifiers remain `Product`.
- Passport fields are grouped into dense responsive sections; composition is intentionally not duplicated and remains the next TZ's `ProductBomPanel` work.
- No backend, schema, route, QuickCreate, ModuleMaterials, or deploy changes.
- No architecture change: this is an existing dialog layout/terminology refinement.

## Closeout
- [x] Progress and root STATUS updated.
- [x] Archive marker and lock created.
- [x] `_active` marker removed after archive.
- [x] Checkpoint updated after commit/push.
- closed_at: `2026-08-08T19:46:00Z`
