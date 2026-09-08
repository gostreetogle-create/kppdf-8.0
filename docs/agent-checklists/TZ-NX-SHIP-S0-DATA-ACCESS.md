# TZ-NX-SHIP-S0-DATA-ACCESS checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-NX-SHIP-S0-DATA-ACCESS.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-08T03:16:59Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (`_active/` был пуст)
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SHIP-S0-DATA-ACCESS.md` на месте

### Preflight Check Output
- **Context read:** `frontend/src/app/shared/services/shipments.service.ts`; `frontend/src/app/shared/services/orders.service.ts` (`ship()` TZ-SWEEP-401); `frontend-nx/libs/data-access/src/lib/sales/pi-orders.service.ts` (+spec); `frontend-nx/libs/data-access/src/lib/warehouse/pi-warehouses.service.ts` (module-layout pattern); `frontend-nx/libs/util/http/src/lib/silent-http.ts`; `frontend-nx/libs/data-access/src/index.ts`
- **Key Constraints:** mirror legacy `ShipmentsService` 1:1 via `SilentResult`; no BE changes; new `logistics` lib folder, exported from `libs/data-access/src/index.ts`
- **Planned Deliverable:** `frontend-nx/libs/data-access/src/lib/logistics/{shipment.types.ts,pi-shipments.service.ts,pi-shipments.service.spec.ts}` + `PiOrdersService.ship()` + spec
- **Validation Path:** focused Jest (data-access), `nx build kppdf-web` last

## Acceptance

- [x] `PiShipmentsService`: `list/findById/update/dispatch/cancelShipment/addDoc/remove` mirror legacy URLs/methods
- [x] Exported from `libs/data-access/src/index.ts`
- [x] `PiOrdersService.ship(id, body = {})` → `POST /orders/:id/ship`
- [x] Jest specs: list params, dispatch/cancel/addDoc URLs, ship empty body + optional body
- [x] `nx build kppdf-web` PASS

## Integrity slot (до READY / archive)

- [ ] Тип изменения определён: **module** (data-access lib, no UI page yet)
- [ ] FIC §A–E: N/A this TZ — no page/permission/module-registry/MCP surface, data-access only (S1 wires the page)
- [ ] page.md / PAGE-TZ-INDEX: N/A (no route yet, S1)
- [ ] DOMAIN-MAP: N/A this step (S1 adds the NX route line)
- [ ] SECTION-READINESS: N/A (no UI yet)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (stage только новые/точечные пути этой TZ)
- [x] Coupling map: N/A (no shared status/FK touched)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (cached)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — `_active/` was empty before this claim
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p libs/data-access/tsconfig.lib.json --noEmit` → exit 0
- `cd frontend-nx && pnpm exec nx test data-access` → 25 suites / 130 tests PASS (incl. new `pi-shipments.service.spec.ts` 8 tests, `pi-orders.service.spec.ts` +2 `ship()` tests)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS, exit 0 (pre-existing NG8102/budget warnings unrelated to this TZ)

## Executor report

- New `frontend-nx/libs/data-access/src/lib/logistics/`: `shipment.types.ts`, `pi-shipments.service.ts` (+spec) — 1:1 mirror of legacy `frontend/src/app/shared/services/shipments.service.ts` (`list/findById/update/dispatch/cancelShipment/addDoc/remove`), exported via new `logistics/index.ts` and `libs/data-access/src/index.ts`.
- `PiOrdersService.ship(id, body = {})` added, mirrors legacy `OrdersService.ship()` (TZ-SWEEP-401): `POST /orders/:id/ship`, not PATCH. 2 specs added to `pi-orders.service.spec.ts`.
- No BE changes; no UI yet (S1 wires the route/page). No conflict with other `_active` — dir was empty at claim time.
- Known limits: data-access only, per TZ scope — page/nav/hub wiring is S1–S3.

## Review handoff

- [x] READY FOR REVIEW — N/A, wave не требует Cursor review gate (executor continuous per PROMPT-CLAUDE-NX-SHIPPING)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-08T03:20:00Z
