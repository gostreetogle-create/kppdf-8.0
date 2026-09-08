# TZ-NX-SHIP-S1-REGISTRY: NX `/shipping` реестр

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-08
closed_by: claude
implementation_sha: d027275c

## Verification

- acceptance criteria: PASS — `/shipping` live registry, warehouse-registry-only select
  (TZ-SHIP-440), nav wired, `?orderId=` deep-link.
- typecheck: PASS — `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` exit 0.
- tests: PASS — `nx test kppdf-web` 101 suites / 658 passed, 7 pre-existing skipped, 0 failed
  (9 new page specs + dialog specs across 3 new dialog components; fixed 1 pre-existing
  `warehouse-nav.spec.ts` assertion to match the new 4th nav item — expected consequence,
  not a regression).
- lint: **known limitation** — `nx lint kppdf-web` has 30 pre-existing errors, all in
  unrelated `pages/studio/**` (a11y click-handler rules predating this TZ); zero issues in
  any file this TZ touched. Not part of S1's AC (specs + `nx build` only); left untouched to
  avoid unrelated scope creep.
- nx build: PASS — `nx build kppdf-web` exit 0, same 2 pre-existing baseline warnings as S0;
  new `shipping-page` lazy chunk present in output.
- checklist: `docs/agent-checklists/TZ-NX-SHIP-S1-REGISTRY.md` — filled.
- status synchronization: `docs/agent-checklists/WAVE-NX-SHIPPING.md` S1 → DONE.

## Delivered

- `frontend-nx/apps/kppdf-web/src/app/pages/shipping/shipping.page.ts` (+spec) — live registry:
  list + status/order filters, `?orderId=` deep-link chip+clear, row actions
  (dispatch/cancel-shipment confirm/deliver/edit/add-doc).
- `shipment-create-dialog.component.ts` (+spec) — order → warehouse → whole/partial qty →
  `PiOrdersService.ship()`.
- `shipment-edit-dialog.component.ts` (+spec) — recipient/address/driver/warehouse/notes →
  `PiShipmentsService.update()`.
- `shipment-doc-dialog.component.ts` (+spec) — type/number/amount/notes →
  `PiShipmentsService.addDoc()`.
- `app.routes.ts`: `/shipping` route (`pageKey: 'shipping'`, `capabilities: ['warehouse:read']`).
- `nav-categories.ts`: «Отгрузка» added to «Склад» group.
- Docs: `shipping.page.md`, `DOMAIN-MAP.md` (§1.2 + §1.4), `PAGE-TZ-INDEX.md`.

## Design note

Legacy's inline row-expando editors (edit/doc forms directly under the table row) were ported
as NX dialogs (kind C, `DIALOG-COOKBOOK.md`) instead of pixel-cloned — matches current NX
convention (`supply-requests.page.ts`, `stock-movements.page.ts`); TZ explicitly allowed
"port essential, not pixel-clone".

## Known limits / next

- No live-browser/Playwright pass this step (continuous 4-TZ queue) — DOM-level Jest
  (TestBed + fixture) and a full AOT production build are the verification evidence.
- Legacy `fromDesk`/«← На стол» chip dropped — no NX `/desk` route yet (out of this wave).
- S2 (hub tray READ) and S3 (hub ship-without-doc) next in the same WAVE.
