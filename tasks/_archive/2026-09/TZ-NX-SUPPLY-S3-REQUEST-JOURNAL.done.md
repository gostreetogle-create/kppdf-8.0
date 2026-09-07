# TZ-NX-SUPPLY-S3-REQUEST-JOURNAL — DONE

- **agent_id:** claude
- **implementation_sha:** a11234ee
- **TZ:** tasks/_ready/nx-supply/TZ-NX-SUPPLY-S3-REQUEST-JOURNAL.md
- **WAVE:** WAVE-NX-SUPPLY-OPS (3/7)
- **Deps:** TZ-SUPPLY-BE-INVOICE-DELIVERY (1/7, `1c4c381a`)

## Что сделано

- **SoT UI decision:** `/supply-requests` — new dedicated page, single write path for `SupplyRequest`. `/supply` stays `SupplyTask`-only (unchanged). Nav «Снабжение» → «Заявки» (`/supply-requests`) + «По заказам» (`/supply`, renamed from «Закупки»).
- **Journal (`supply-requests.page.ts`):** columns per TZ step 2 (title/material, qty+unit, supplier, status, paid, invoiceNo, order#, createdBy, dates); filters status/paid/search (client-side — BE list has no server `paid` filter and is already capped at 500 rows).
- **Form (`supply-request-form-dialog.component.ts`):** material — live debounced typeahead (300ms, min 2 chars, `PiMaterialsService.list`) with manual title/article fallback and a clear-to-manual toggle; supplier/order — preloaded `<select>` (suppliers type=supplier ≤100, all orders); order `orderId` XOR `orderLabel` via a sentinel "not in list" option; invoiceNo/deliveryNote/paid/status/notes. Dialog performs create/update itself (mirrors `StockMovementFormDialogComponent`), closes with the saved entity.
- **Removed the competing truncated UI:** deleted `supply-requests.registry.ts` + `supply-requests-http-data-source.ts` (+spec); `registries.catalog.ts` no longer takes/wires a `supplyRequestsService`; `registry-simple-crud.ts` / `simple-registry-form-dialog.component.ts` dropped the `'supply-request'` kind (2-field title+qty stub).
- **Data-access:** `SupplyRequest`/`CreateSupplyRequestPayload`/`UpdateSupplyRequestPayload` extended to mirror the TZ1 backend fields (`orderLabel`, `invoiceNo`, `deliveryNote`, `paid`, `paidAt`, `createdBy`).
- **Test fallout fixed:** 4 registries spec files had positional `buildRegistriesCatalogDefault(...)` calls that silently misaligned after the signature shrank (caught by full-suite run, not typecheck, since the mocks use `as unknown as` casts) — `registries.catalog.spec.ts`, `registry-filters-pagination.spec.ts` (also dropped its now-nonexistent `supply-requests` assertions), `registry-action-matrix.spec.ts`, `registry-detail-panel.component.spec.ts`; `mockSupplyRequestsService` removed from the shared `registries-catalog-test-mocks.ts`.
- **Docs:** `docs/pages/supply.page.md` — new §NX TZ-NX-SUPPLY-S3-REQUEST-JOURNAL section; fixed the now-stale "SupplyRequest not shown as a list" gap note.

## Gates (все зелёные)

```
frontend-nx nx test kppdf-web (full) → 96 suites / 626 passed / 7 skipped / 0 FAIL
frontend-nx nx test data-access → 24 suites / 120 passed
frontend-nx nx lint kppdf-web (changed files) → 0 new issues (net -1 warning vs baseline)
pnpm architecture:check → 1464 files, baseline 17, 2 resolved
frontend-nx nx build kppdf-web → SUCCESS (last gate; supply-requests-page lazy chunk confirmed)
```

## AC чек

1. Журнал показывает заявки; create/edit сохраняет новые BE-поля ✔ (spec + manual review)
2. orderId XOR orderLabel в UI ✔ (spec: choosing an order clears orderLabel from payload and vice versa)
3. nx build green; archive ✔

## known_limitation

`createdBy` column shows a short id, not a display name — no Users-lookup service exists on NX yet (only Person/Worker for production, not login accounts). Follow-up TZ if PO wants name resolution.

## НЕ тронуто

StockMovement; Material create (S5); Desktop Excel; Chrome C*; `/supply` (SupplyTask) itself; dropDatabase.
