# TZ-NX-ORDER-WS-COMPOSITION checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-ORDER-WS-COMPOSITION.md` (removed on closeout)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-15T16:08:48Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in this environment)

## Preflight

- [x] `_active/` пуст перед claim
- [x] TZ / `Order.items` type / `order.service.ts` `mapItems`/`assertOrderStatusTransition`/`assertTrailingLinesDeletable` / `order-hub.facade.ts` composition-tree pattern / `order-create.page.ts` product-picker pattern read
- [x] Claim slot заполнен

## Design notes (backend truth verified before coding)

- Items are editable via `PATCH /orders/:id { items: [...] }` **only** when `status` is `draft` or `confirmed` — `PLAN_EDITABLE_FROZEN = {in_production, ready}` and `HARD_FROZEN = {shipped, delivered, cancelled}` both block items PATCH. `canEditComposition()` = `status === 'draft' || status === 'confirmed'`.
- `mapItems` (backend) maps items **by array index** and has **no** `prev` fallback for `productName`/`productSku`/`unit`/`ownerUserId`/`plannedShipDate` (only `lineId`/`boardLane`/`status`/`readyForWork` do). Facade's `toItemPayload()` resends the full existing item for every untouched line on every write, to avoid silently wiping those fields.
- Line delete is trailing-only server-side (`assertTrailingLinesDeletable` — "drop trailing lines only while they remain in prep"). Not replicated client-side; the backend's honest RU error message surfaces via toast if a non-trailing delete is rejected.
- Dedicated `PATCH /orders/:id/items/:lineIndex/ready` exists — added `PiOrdersService.setLineReady()` for it, kept separate from the general items PATCH (two write-paths total, per TZ's "PATCH/ready").
- No id-specific product/catalog route exists — "Открыть в каталоге" links to `/registries/products` (live category list), matching TZ2's counterparty-link precedent.
- "+ Добавить позицию" reuses `order-create.page.ts`'s exact pattern: a plain `<select>` product picker (not a new dialog) — literally what "reuse existing... picker pattern... не изобретать" pointed at.
- Composition tree reuses the same `pi-composition-tree` component `order-hub-tray.component.ts` already uses, but loads/caches **per line** on first expand (not all lines at once like the hub's single disclosure) — a closer read of "Expand line → tree (lazy load tree like hub)".

## Acceptance (из TZ)

- [x] `OrderWsCompositionComponent`: line list (name/sku/qty/unit/ready/delete), «+ Добавить позицию» (select picker), expand line → lazy composition tree (cached), dual CTA (focus inline controls / «Открыть в каталоге»), freeze banner honest
- [x] Facade: `addLine`, `updateQty`, `removeLine`, `toggleReady`, `toggleLineTree` — two write-paths only (items PATCH, dedicated ready PATCH)
- [x] Empty state + add CTA (unchanged text, already covered by TZ1's untouched assertion)
- [x] No unitPrice/total columns
- [x] Specs: add/qty/ready/freeze-disabled/tree-expand + remove (7 new tests total)
- [x] `nx build kppdf-web` LAST PASS

## Gates (факт)

- `nx test kppdf-web` (full 563-test suite, same pattern-flag caveat as every TZ this session — was 557, +6 new tests this TZ) — **PASS** for `order-detail.page.spec.ts`, all 16 tests (8 original + 2 TZ2 + 6 new: qty-change with field-preservation check, ready-toggle-uses-dedicated-endpoint, remove-with-confirm, freeze-disabled+banner, tree-expand-lazy-cached, add-line). All passed on the **first** implementation attempt — the upfront backend-behavior read (mapItems index-fallback gaps, freeze graph, trailing-delete rule) paid off. Same 2 unrelated pre-existing `app-shell.component.spec.ts` failures as every TZ this session.
- `nx test data-access` — **PASS**, 134/134.
- `nx test features` — **PASS**, 455/455.
- `nx build kppdf-web` — **PASS**, exit 0 (first attempt). Same pre-existing Angular/budget warnings as baseline.
- `nx lint kppdf-web` + `nx lint features` — baseline FAIL (pre-existing); **hit and fixed 2 real new issues before closing:** (1) `order-ws-composition.component.ts` imported `CompositionTreeComponent` via the public `@kppdf/features/composition` path from another lib *within the same Nx project* — `@nx/enforce-module-boundaries` flags intra-project public-path imports, fixed with a relative import (`../../composition/ui/composition-tree.component`); (2) 3 new `no-non-null-assertion` warnings in the spec (`quotationOrder.items![0]`) — fixed by destructuring `const [line0, line1] = quotationOrder.items ?? [];` instead. Re-verified zero new issues after both fixes.

## Executor report

- **Backend verification first (again):** read `mapItems`, `assertOrderStatusTransition`, `assertTrailingLinesDeletable`, and the `SetOrderLineReadyDto`/`.../ready` controller route before writing any facade code. This surfaced the critical "no fallback for productName/etc. on unrelated lines" landmine — without catching it, every composition PATCH from this UI would have silently blanked out other lines' display names/units/owners.
- **`PiOrdersService.setLineReady()`**: additive-only, mirrors `cancel()`/`ship()`.
- **`OrderWorkspaceFacade`** extended: `products`/`addingLine`/`savingLineIndex`/`removingLineIndex`/`expandedLineIndex`/`lineTrees`/`lineTreeLoading` signals, `newLineProductId`/`newLineQty` plain fields (same pattern as `SupplyFacade`'s inline-create fields), `canEditComposition()`, `toItemPayload()` (private, the field-preservation fix), `toggleLineTree()` (lazy + cached, including caching a `null` result on tree-load failure so a bad line doesn't refetch every click), `updateQty()`, `toggleReady()`, `removeLine()` (destructive confirm dialog), `addLine()`.
- **New `OrderWsCompositionComponent`**: zero facade injection, pure `input()`/`output()`. The dual-CTA "Править строки заказа" button does a real DOM `focus()` + `scrollIntoView()` on that line's qty input (via `viewChildren` template refs) rather than being a no-op label — genuine, working "фокус на list controls" per the TZ wording.
- **Spec**: added mocks for the two new injected services (`PiProductsService`, `PiCompositionService`) across all 4 `TestBed` blocks (same pattern as TZ2's `PiOrganizationsService`/`PiDialogService` additions). Updated one existing assertion (`order-item`/`×2` text check → `composition-line`/qty-input-value check) since the flat read-only item row became an editable row; the empty-state assertion needed no change (same RU text, no selector dependency). Added 6 new tests exercising every write-path end-to-end through real DOM interaction (not calling facade methods directly), including a field-preservation check on the qty-change test's PATCH payload assertion.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T16:17:03Z

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (via nx build)
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing, zero new issues after 2 fixes)
  - checklist: ADDED
  - progress.md: N/A (feature build, reuses existing backend endpoints)
  - status synchronization: PASS
