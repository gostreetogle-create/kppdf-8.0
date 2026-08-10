# TZ-SALES-342 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-SALES-342.md` (removed at closeout)
> Conflict keys: quotation schema/DTO/service, document-template build/DTO, proposal composition/page/docs

## Claim slot

- agent_id: `agent-d2515d7a53`
- claimed_at: `2026-08-11`
- workspace: `D:\\kppdf-8.0` canonical `main`
- team_room_claim: `unavailable (Unknown task; claim attempted)`

## Preflight

- [x] Strict order verified: SALES-340 → 341 → 345 → 343 → 344 were DONE and pushed.
- [x] Existing composition panel and quotation total path read.
- [x] Frozen 317 shell and catalog schema remain untouched in this scope.

## Acceptance

- [x] Custom line can be added as «Своя строка» without a catalog Product.
- [x] Catalog lines still require `productId`; old saved lines remain readable.
- [x] Description, unit, line discount %, and «Не входит в стоимость» persist and hydrate after F5.
- [x] Discounted line total is `quantity × unitPrice × (1 - discountPercent/100)`.
- [x] Optional lines are visible on the sheet but excluded from document total; the A4 footer shows a separate additional amount.
- [x] Backend quotation and document-output/build paths compile and tests pass.
- [x] Frontend proposal-create tests and tsc pass.
- [x] Prettier/ESLint/diff-check pass (backend ESLint retains only two pre-existing warnings in document-template service).
- [x] Browser-equivalent self-verify: Angular development build PASS; DOM/component tests confirm the composition overlay, «Своя строка», preview payload and persistence payload. Authenticated data browser smoke was unavailable without the backend data stack.

## Verification evidence

- Backend tsc PASS.
- Backend quotation/generated-document focused tests: 48/48 PASS.
- Frontend proposal-create/terms tests: 33/33 PASS.
- Frontend tsc PASS; Angular development build PASS.
- Frontend changed-file ESLint and Prettier PASS.
- `git diff --check` PASS.

## Closeout

- [x] Archive marker created: `tasks/_archive/2026-08/TZ-SALES-342.done.md`.
- [x] Lock created: `.mimocode/locks/TZ-SALES-342-kp-custom-lines.lock`.
- [x] Active marker removed.
- [x] Commit + push complete.
