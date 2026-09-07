# TZ-NX-SUPPLY-S3-REQUEST-JOURNAL checklist

> Status: **DONE**
> Marker: removed (`tasks/_active/TZ-NX-SUPPLY-S3-REQUEST-JOURNAL.md` deleted at closeout)
> Wave: `WAVE-NX-SUPPLY-OPS` (3/7)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-07T21:15:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this executor)

## Preflight

- [x] `tasks/_active/` checked — no competing claim
- [x] Audit §1–6 (`docs/audits/2026-09-06-supply-google-sheets-to-nx-audit.md`), `supply.page.ts` (SupplyTask), truncated registries `supply-requests` dialog, `SupplyRequest` BE/DTO from TZ1 read
- [x] Checked for existing typeahead/combobox component in NX — none exists; used a lightweight in-form debounced search for material (catalog can be large), plain `<select>` for supplier/order (bounded lists, matches `stock-movement-form-dialog.component.ts` precedent)

## Acceptance

- [x] Журнал показывает заявки; create/edit сохраняет новые BE-поля
- [x] orderId XOR orderLabel в UI
- [x] nx build green; archive

## Integrity slot (before READY / archive)

- [x] Type: page (new route `/supply-requests`, new nav item, existing capability `procurement:read` reused — no new permission)
- [x] FIC §A–E: route added under existing capability; no new permission/module/MCP
- [x] page.md: `docs/pages/supply.page.md` — new §NX TZ-NX-SUPPLY-S3-REQUEST-JOURNAL section (PAGE_DOCS target per TZ)
- [x] DOMAIN-MAP: N/A — no new module/entity, existing `SupplyRequest`
- [x] No P0–P2/unrelated dirty WIP staged

## Build integrity

- [x] `cd frontend-nx && pnpm exec nx build kppdf-web` — green (last gate); confirmed `supply-requests-page` lazy chunk emitted

## Gates (fact)

- PASS: `nx test kppdf-web` (full project) — 96 suites / 626 passed / 7 skipped / 0 failed
- PASS: `nx test data-access` — 24 suites / 120 passed
- PASS: `nx lint kppdf-web` changed files — 0 new errors/warnings (net -1 warning vs baseline; pre-existing debt on untouched lines only)
- PASS: `pnpm architecture:check` — 1464 files, baseline 17, 2 resolved
- PASS: `cd frontend-nx && pnpm exec nx build kppdf-web` (last)

## Executor report

- Built `/supply-requests` as the single SoT for `SupplyRequest` CRUD: `supply-requests.page.ts` (journal list + filters: search/status/paid) + `supply-request-form-dialog.component.ts` (material typeahead with clear-to-manual fallback, supplier/order selects, order XOR orderLabel, invoice/delivery/paid, status, notes).
- Removed the competing truncated UI: `supply-requests.registry.ts`, `supply-requests-http-data-source.ts` (+ spec) deleted; `registries.catalog.ts`'s `supplyRequestsService` param and registry entry removed; `registry-simple-crud.ts`/`simple-registry-form-dialog.component.ts` lost the `'supply-request'` kind (organization/passport kinds untouched).
- Fixed 4 registries spec files whose `buildRegistriesCatalogDefault(...)` calls were positional and would have silently shifted arguments after removing a middle parameter (`mockSupplyRequestsService()` calls removed from `registries.catalog.spec.ts`, `registry-filters-pagination.spec.ts`, `registry-action-matrix.spec.ts`, `registry-detail-panel.component.spec.ts`; `mockSupplyRequestsService` deleted from the shared `registries-catalog-test-mocks.ts`) — caught by a full-suite test run, not by typecheck (the mocks use `as unknown as` casts).
- Nav: `nav-categories.ts` «Снабжение» now has two items — «Заявки» (`/supply-requests`) and «По заказам» (`/supply`, renamed from «Закупки» per audit §3 canon).
- Extended `SupplyRequest`/`CreateSupplyRequestPayload`/`UpdateSupplyRequestPayload` FE types (data-access) to mirror the TZ1 backend fields.
- conflict disclosure: unrelated dirty WIP in the tree (docker-compose.yml, start.mjs, build-info.ts, data/, reports/, other nx-supply TZ files for later waves) — none staged.
- known limitation: `createdBy` shows a short id, not a display name (no Users-lookup service on NX yet) — documented in `docs/pages/supply.page.md`.

## Closeout

- [x] archive + DONE lock + remove `_active` marker
- closed_at: 2026-09-07T22:00:00+03:00
