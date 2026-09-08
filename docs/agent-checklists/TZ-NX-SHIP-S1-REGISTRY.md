# TZ-NX-SHIP-S1-REGISTRY checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-SHIP-S1-REGISTRY.md` (removed at closeout)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-08T03:23:04Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (S0 DONE)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SHIP-S1-REGISTRY.md` на месте

### Preflight Check Output
- **Context read:** legacy `shipping.page.ts` (full, 920 LOC); `docs/pages/shipping.page.md`; NX `supply-requests.page.ts`/`supply-request-form-dialog.component.ts`/`stock-movement-form-dialog.component.ts` (dialog + page conventions); `docs/DIALOG-COOKBOOK.md`; NX `app.routes.ts` (warehouse/supply routes), `nav-categories.ts`; `backend/src/common/seed/permissions.constants.ts` (`shipping` pageKey already seeded, no dedicated capability key — reused `warehouse:read` matching sibling warehouse pages)
- **Key Constraints:** port essentials not pixel-clone; NX dialog density (kind C) instead of legacy inline row-expando editors; warehouse from `PiWarehousesService` registry only (TZ-SHIP-440); `/desk` route doesn't exist on NX yet — dropped legacy `fromDesk`/«← На стол» chip (dead target, audit-flagged pattern to avoid)
- **Planned Deliverable:** `pages/shipping/{shipping.page,shipment-create-dialog,shipment-edit-dialog,shipment-doc-dialog}.component.ts` (+specs) + route + nav item + docs
- **Validation Path:** focused Jest (page + 3 dialogs); `nx build kppdf-web`

## Acceptance

- [x] `/shipping` loads list from API; create+dispatch+cancel work via HTTP
- [x] Warehouse = registry select only (TZ-SHIP-440) — both create and edit dialogs validate against `PiWarehousesService.list()`, no manual ObjectId entry
- [x] Nav opens page; no 404 from `/shipping` (route registered under Склад group)
- [x] Focused page specs + `nx build kppdf-web` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **page** (new NX route) + **module** (nav)
- [x] FIC §A (new page): route + nav + page.md updated in this TZ
- [x] page.md / PAGE-TZ-INDEX обновлены: `docs/pages/shipping.page.md` (§NX live note), `docs/pages/PAGE-TZ-INDEX.md`
- [x] DOMAIN-MAP: §1.2 Sales row + §1.4 NX surface row added for `/shipping`
- [x] SECTION-READINESS: N/A — shipping already covered under Sales/Logistics section, no new user contour
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only this TZ's files)
- [x] Coupling map: N/A — no new shared status/FK field, reuses existing `Shipment`/`Order` status semantics from `COUPLING-MAP.md`
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (cached)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict)
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `cd frontend-nx && pnpm exec nx test kppdf-web` → 101 suites / 658 passed, 7 pre-existing skipped, 0 failed (incl. new `shipping.page.spec.ts` 9 tests + 3 dialog specs)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → **known limitation**: 30 pre-existing errors, all in unrelated `pages/studio/**` (a11y click-handler rules, non-null assertions) — zero lint issues in any file this TZ touched (`grep -i shipping` on lint output = empty). Not caused by this TZ; not part of its AC (S1 AC lists specs + `nx build`, not lint); out of scope to fix here (would be unrelated studio-module scope creep).
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS, exit 0 (same 2 pre-existing baseline warnings as S0: NG8102 in `studio-table-properties.component.ts`, CSS budget on `gantt-bars.component.ts`); new `shipping-page` lazy chunk confirmed in build output

## Executor report

- New `frontend-nx/apps/kppdf-web/src/app/pages/shipping/`:
  - `shipping.page.ts` (+spec) — registry list, status/order filters, `?orderId=` deep-link chip+clear, row actions (dispatch/cancel-shipment/deliver/edit/add-doc).
  - `shipment-create-dialog.component.ts` (+spec) — order → warehouse → whole/partial qty → `PiOrdersService.ship()`.
  - `shipment-edit-dialog.component.ts` (+spec) — recipient/address/driver/warehouse/notes → `PiShipmentsService.update()`.
  - `shipment-doc-dialog.component.ts` (+spec) — type/number/amount/notes → `PiShipmentsService.addDoc()`.
- `app.routes.ts`: `/shipping` route, `pageKey: 'shipping'` (already seeded), `capabilities: ['warehouse:read']` (no dedicated shipment capability key exists in `permissions.constants.ts`; matched sibling warehouse pages).
- `nav-categories.ts`: added «Отгрузка» to the «Склад» group, after «Движения».
- Fixed pre-existing `warehouse-nav.spec.ts` to expect the new 4th nav item (direct, expected consequence of this TZ, not a regression).
- Docs: `shipping.page.md` (NX live note), `DOMAIN-MAP.md` (§1.2 + §1.4), `PAGE-TZ-INDEX.md`.
- Design choice flagged for PO/Cursor awareness: legacy's inline row-expando editors (edit/doc forms directly under the table row) were ported as NX dialogs (kind C, per `DIALOG-COOKBOOK.md`) instead — matches current NX convention (`supply-requests.page.ts`, `stock-movements.page.ts`) rather than a pixel-clone, which TZ explicitly allowed ("port essential, NOT pixel-clone").
- Known limits: no live-browser/Playwright pass this step (continuous 4-TZ queue; DOM-level Jest via TestBed/fixture + a full AOT production build are the verification evidence — see Gates). `/desk` return-chip from legacy dropped (no NX `/desk` route yet, out of this wave per PO lock).

## Review handoff

- [x] READY FOR REVIEW — N/A, wave не требует Cursor review gate (executor continuous per PROMPT-CLAUDE-NX-SHIPPING)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-08T03:40:00Z
