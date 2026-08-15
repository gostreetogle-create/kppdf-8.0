# TZ-FRONTEND-304 checklist

> Status: **CLAIMED / IN PROGRESS**
> Goal: аккуратно разделить контейнер и UI блока «состав изделия» (BOM)
> Speed: не важна; важны characterization и отсутствие регрессий
> Deploy: НЕ

## Claim slot

- agent_id: Buffy-TZ-FRONTEND-304
- claimed_at: 2026-08-15T10:28:00+03:00
- workspace: D:\\kppdf-8.0\\.worktrees\\TZ-FRONTEND-304
- branch: feature/TZ-FRONTEND-304
- team_room_claim: unavailable (Team Room: Unknown task; sync tasks first)

## Preflight

- [x] Isolated worktree from origin/main (`0301056a`)
- [x] `_NOW` + `_active` checked; no conflict with active TZ-SALES-376 exact keys or other claims
- [x] Claim marker + this checklist filled before code
- [x] Прочитан `docs/ANGULAR-GUIDE.md` + integrity audit P1-COMPOSITION

## Caller map / current ownership

- `frontend/src/app/pages/products/product-detail.page.ts:40,76,353` imports and renders `ProductBomPanelComponent`; page owns product route/API/cost orchestration and listens to `(changed)`.
- `frontend/src/app/pages/modules/module-detail.page.ts:34,63,304,326` imports/renders the panel with `rootKind="module"`; page owns module route/API/cost orchestration and listens to `(changed)`.
- `frontend/src/app/pages/products/product-form-dialog.component.ts:43,110,518` imports/renders the panel only in edit mode; create mode remains a save-first hint.
- `frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts:54,106,155,167` renders the panel after product/module creation for L profiles.
- `frontend/src/app/pages/orders/order-detail.page.ts:15,59` uses `CompositionTreeComponent` directly; it is not a `ProductBomPanelComponent` caller.
- `ProductBomPanelComponent` owns the composition API calls (`ProductModulesService`, `MaterialsService`, `ProductsService`), Router, PiDialog and mutation orchestration.
- Dynamic page imports from shared panel: `product-bom-panel.component.ts:585` module form, `:613` product form, `:638` material form. Picker import at `:39` is shared-to-shared and is not a pages import.
- Current panel has no `readOnly`/permission input. Callers decide whether the panel is rendered; characterization confirms selecting/loading does not mutate, while explicit add/quantity/remove actions do. No separate UX/PO choice is required.

## Phase 0–1 evidence

Focused baseline command:
`pnpm exec jest --config jest.config.js --runInBand --no-coverage src/app/shared/ui/composition/product-bom-panel.component.spec.ts src/app/shared/ui/composition/product-composition-picker-dialog.component.spec.ts src/app/shared/ui/composition/composition-tree.component.spec.ts src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts`

Baseline: **4 suites / 44 tests PASS**.

Characterization added before extraction in `product-bom-panel.component.spec.ts`:

- empty root + no implicit mutation: PASS;
- tree error → alert and no mutation actions: PASS;
- quantity update + remove selected line: PASS;
- cost hint loading label → resolved cost: PASS.

Characterization focused result: **1 suite / 12 tests PASS**. Existing add-line, success load, module root, cost, picker, tree and QuickCreate contracts remain green. No extract started before this evidence.

## Phase 2 — chosen split

**Chosen: B (safe staged boundary).** `ProductBomPanelComponent` remains the composition container for tree loading, cost preview, add/quantity/remove writes and picker dialog. `CompositionTreeComponent` remains presentational UI. The panel will emit a typed edit intent; each page/dialog caller will own entity lookup and page-form opening. This removes `shared/ui/composition → pages/**` imports without changing add/quantity/remove/cost/read-only behavior. A temporary parent-owned edit flag is used only while callers migrate one-by-one, then removed with the legacy fallback.

Planned child order (each ≤8 files and independently gated):

1. Shared edit-intent contract + panel characterization.
2. `product-detail.page` caller integration.
3. `module-detail.page` caller integration.
4. `product-form-dialog` caller integration.
5. `quick-create-dialog` caller integration.
6. Shared cleanup: remove migration flag and all legacy page imports; re-run shared contract.

- [x] Chosen split B + rationale
- [ ] No pages/** dynamic imports from shared composition (final cleanup pending)
- [x] Child batches planned ≤8 files; page callers one-by-one
- [ ] Gates per child PASS

## Closeout

- [ ] Canonical finding updated
- [ ] Full frontend Jest без новых fail
- [ ] Archive/lock/progress/push
- [ ] Deploy НЕ
