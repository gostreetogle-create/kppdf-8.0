# TZ-NX-ORDER-WS-PRODUCT-SELECT-ADD — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15

## Delivered

- `OrderWsCompositionComponent`: added a `pi-outline-btn`-style «+»
  (`app-pi-button variant="ghost"`, `data-test="composition-add-product-create"`)
  next to the «Изделие» `<select>`, emitting a new `createProduct = output<void>()`
  — stays fully dumb, no dialog access.
- `OrderWorkspaceFacade.openCreateProduct()`: opens the **existing**
  `ProductFormDialogComponent` (`registry-forms/ui/`) directly — unlike
  the Наша фирма/Заказчик/Объект dialogs from `TZ-NX-ORDER-WS-META-INLINE`,
  this dialog already lives in `libs/features`, so no NX
  boundary/page-level detour is needed. The dialog owns its own create
  POST internally and closes with the saved `ProductDetail`; on a truthy
  close the product is appended to `products()` and **selected**
  (`newLineProductId = product._id`) — deliberately **not** auto-added as
  a line, matching the create-flows from META-INLINE (create only fills
  the field it's for; the manager still presses the explicit add/confirm
  action).
- `order-detail.page.ts`: wired `(createProduct)="facade.openCreateProduct()"`.
- `docs/pages/orders.page.md`: added a note under the
  `TZ-NX-ORDER-WS-COMPOSITION` section.

## Gates

- `nx test features` (full suite): 52/52 suites, 457/457 PASS.
- `nx test kppdf-web` (full suite): `order-detail.page.spec.ts` PASS
  (+1 new test proving create→select-not-add). Same one pre-existing
  unrelated `app-shell.component.spec.ts` failure as every recent TZ this
  session.
- `nx build kppdf-web` (forced): PASS, ran last.
- Direct `eslint` on all touched files: same one pre-existing baseline
  `@nx/enforce-module-boundaries` hit on `order-detail.page.ts`
  (documented in `docs/audits/2026-09-15-order-workspace-verify.md`),
  zero new issues.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (build)
  - tests: PASS
  - lint: BASELINE (one pre-existing issue only, zero new)
  - checklist: N/A (S-size TZ)
  - progress.md: N/A
  - status synchronization: N/A (updated once at end of chain)
