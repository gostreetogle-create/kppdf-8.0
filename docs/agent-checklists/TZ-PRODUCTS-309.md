# TZ-PRODUCTS-309 checklist

> Status: **DONE** · Wave: PRODUCT-EDITOR #2
> Source: `tasks/_backlog/product-editor/TZ-PRODUCTS-309-composition-in-fulleditor.md`
> Archive: `tasks/_archive/2026-08/TZ-PRODUCTS-309.done.md`
> Lock: `.mimocode/locks/TZ-PRODUCTS-309-composition-in-fulleditor.lock`

## Claim slot
- agent_id: `agent-3e757640b7`
- claimed_at: `2026-08-08T19:47:13Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable` — Team Room registry does not contain TZ-PRODUCTS-309

## Preflight
- [x] Canonical workspace and `main` verified; clean at `b94b2db8`, 308 is archived and pushed.
- [x] `_active-map.md` and `tasks/_active/` checked; no conflicting active claim.
- [x] TZ and existing `ProductBomPanel` source read; dependency TZ-PRODUCTS-308 is DONE.
- [x] Claim slot filled before product-code changes.
- [x] `tasks/_active/TZ-PRODUCTS-309.md` created before implementation.

## Acceptance
- [x] Edit FullEditor renders the same `ProductBomPanel` with `data-test="product-bom-panel"`.
- [x] Create FullEditor has no panel and shows the specified Russian save-then-edit hint.
- [x] Panel uses existing composition endpoints/write-path; no ModuleMaterials or duplicate UI.
- [x] Panel is inside a bounded scrollable editor region; the dialog's sticky passport footer remains unchanged.
- [x] Panel `changed` events only mark the passport form dirty; passport submit remains independent.
- [x] Product page documentation says edit FullEditor includes passport + composition.

## Gates
- [x] `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `pnpm --dir frontend exec jest src/app/pages/products/product-form-dialog.component.spec.ts src/app/pages/products/product-bom-panel.component.spec.ts --runInBand` — PASS, 32/32
- [x] `pnpm --dir frontend exec ng build --configuration=development` — PASS
- [x] `pnpm --dir frontend exec eslint src/app/pages/products/product-form-dialog.component.ts src/app/pages/products/product-form-dialog.component.spec.ts` — PASS
- [x] `pnpm --dir frontend exec prettier --check` for changed form files — PASS
- [x] `git diff --check` — PASS
- [ ] `bash OrchestratorKit/verify-status.sh` — FAIL on pre-existing 72 legacy kit-era entries outside this TZ; disclosed, not altered.

## Executor report
- FullEditor edit mode reuses `ProductBomPanel`; create mode cannot have a product id and therefore shows a clear next-step hint.
- No composition API, backend, Product schema, QuickCreate, ModuleMaterials, or deploy changes.
- No architecture change: this is composition of existing standalone UI in the existing dialog.

## Closeout
- [x] Progress, root STATUS, queue and wave updated.
- [x] Archive marker and lock created.
- [x] `_active` marker removed after archive.
- [x] Checkpoint updated after commit/push.
- closed_at: `2026-08-08T19:49:36Z`
