# TZ-NX-DECOMP-DEBT-CLOSEOUT

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (specs green across all 3 parts)
  - typecheck: PASS (kppdf-web app + features lib, clean after each part)
  - architecture check: PASS (1536 files; baseline 17; 2 resolved since baseline)
  - tests: PASS (features 39/39 suites 369/369; kppdf-web full suite 92/92 suites, 623/630 passed, 7 skipped, 0 failed; backend SUPPLY-GATE 6/6 suites 80/80)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB)
  - checklist: docs/agent-checklists/TZ-NX-DECOMP-DEBT-CLOSEOUT.md
  - commit: 6495bc54
  - status synchronization: PASS (tracker updated)

## Root cause

Three prior TZs (B4 F2, B1's order-hub-tray, B2's storage-items/supply-requests)
had all stopped at the same blocker class: `MaterialFormDialogComponent`
and `CompositionPanelComponent`/`CompositionTreeComponent` being app-only
real components. C1 (`TZ-NX-COMPOSITION-TO-FEATURES`) resolved the
composition side; this TZ finished the rest.

## Fix

1. **registry-forms**: moved material/module/product form facades+dialogs
   + `CategoryFormDialogComponent` into `@kppdf/features/registry-forms`.
   Corrected a false-positive from the archived F2 investigation —
   `CategoryFormDialogComponent` was never actually shared with doc-studio
   (a grep substring collision with the unrelated
   `text-block-category-form-dialog.component.ts`).
2. **order-hub**: moved `order-hub.facade.ts` + `order-hub-tray.component.ts`
   into the existing `@kppdf/features/order-hub` lib (alongside its
   already-moved kit-reserve/ship-confirm dialogs).
3. **supply/warehouse leftovers**: moved `storage-items.facade.ts` +
   its two dialogs into `@kppdf/features/warehouse`, and
   `supply-requests.facade.ts` + its dialog into `@kppdf/features/supply`.

Duplicated small pure support files (`order-status.ts`,
`material-formatters.ts`, `supply-request-formatters.ts`,
`on-dialog-close-once.ts` where not already present) into each lib's
`ui/`, per established convention. One new judgment call: duplicated the
tiny (45 LOC), zero-service, zero-business-logic
`RegistryCreateButtonComponent` twice (registry-forms + warehouse) —
technically a real `@Component`, but with the same low drift risk as pure
data, unlike every genuine blocker component this program has hit.

Route-host pages (`storage-items.page.ts`, `supply-requests.page.ts`)
stay in the app, matching the already-established convention from
`stock-movements.page.ts`/`warehouses.page.ts`.

## Files changed

~49 files: 3 new libs content trees (registry-forms full; order-hub +
warehouse + supply extended), ~14 app-level consumer import fixes,
`tsconfig.base.json` (+1 path), `docs/agent-checklists/TZ-NX-DECOMP-DEBT-CLOSEOUT.md` (new).

## Successor

`TZ-NX-SHIPPING-PAGE-FACADE` (S1) — shipping.page → ShippingFacade in-place.
