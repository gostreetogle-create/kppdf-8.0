# TZ-DESK-416 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-DESK-416.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: composer-executor-desk-416
- claimed_at: 2026-08-19T05:38:32+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: yes

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — 414 CLAIMED на `manager-desk.page.ts|.spec.ts` (не пересекается); 415 BE desk-note
- [x] TZ / канон / deps прочитаны (404 DONE; production `from=desk` → «На стол»)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-DESK-416.md` на месте (удалён при archive)

## Acceptance

- [x] desk tray → `/production?orderId=&from=desk`
- [x] hub tray без from
- [x] `data-test="order-production-link"` не переименован
- [x] Jest: desk-mode production link содержит `from=desk`
- [x] FE tsc + focused jest tray PASS
- [x] не трогать `manager-desk.page.ts`

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page
- [x] FIC §A: query `from=desk` на существующей ссылке tray (desk host); §B–E N/A
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS: N/A (не менялся статус раздела)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (не 414)
- [x] Coupling map: N/A (не трогал общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0)
- `cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern="order-hub-tray|orders.page.spec"` → PASS 19/19 (tray 2, orders.page 17)
- `cd frontend && pnpm exec eslint src/app/pages/orders/order-hub-tray.component.ts src/app/pages/orders/order-hub-tray.component.spec.ts` → PASS (0 errors)

## Executor report

- `productionQueryParams()`: desk `{ orderId, from: 'desk' }`, hub `{ orderId }`. Link `data-test="order-production-link"` unchanged.
- Spec: desk href contains `from=desk`; hub href has no `from`.
- Conflict disclosure: 414 owns `manager-desk.page.ts` — not touched. 415 owns desk-note BE — not touched.
- known_limitation: live DESK-SMOKE / VPN не запускались (TZ: no deploy).

## Review handoff

- [x] TZ не требует wave inbox / Cursor Verdict — P2 defect, archive after gates

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-19T05:45:00+03:00
