# TZ-DESK-401 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-DESK-401.md` (removed at closeout)
> Conflict keys: routes + manager desk page/spec + app layout/spec only

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy/openai-gpt-5.6-luna
- claimed_at: 2026-08-18T19:23:08+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (claim CLI unavailable)

## Preflight

- [x] Get-Location / repo root → D:\kppdf-8.0
- [x] branch → main
- [x] Spec + TZ-DESK-401 + prompt read completely
- [x] `_NOW.md` + `tasks/_active/` read; no conflicting active claim
- [x] Active marker created before code
- [x] Foreign WIP identified and excluded from commit

## Acceptance

- [x] `/` redirects to `/desk`; `/desk` is lazy `ManagerDeskPage` with `pageKey: orders` and title `KPPDF — Стол`
- [x] `/dashboard` remains `DashboardStatsPage`; `/design/combine` remains untouched
- [x] Brand router link stays `/` and aria/title is `Рабочий стол — главная`
- [x] `/desk` is included in dense main handling
- [x] Exactly three local fixture rows: `З-1001` draft, `З-1002` in production, `З-1003` ready; every client is an RU string
- [x] Row selection renders center innards, two text composition placeholders, and the disabled status CTA
- [x] Right chrome tools are absent without selection; client/BOM/docs appear after selection; supply is only for production/ready
- [x] «На Ганте» and «В комбайне» are disabled and titled for DESK-404
- [x] Create/filter/summary and right actions use one right-side overlay with backdrop, Esc, RU H1/copy, and close
- [x] Empty state has RU copy and «Создать заказ» using the same create handler as the left chrome tool
- [x] Query `orderId` + `panel` restore selection/flyout on F5; no order API or `/api/orders` request
- [x] Focused tsc and specs PASS

## Integrity slot

- [x] Type: frontend page / manager desk fixture
- [x] Existing `docs/pages/manager-desk.page.md` used; existing `/desk` row in `PAGE-TZ-INDEX` verified, not duplicated
- [x] Coupling map: N/A — fixture, no persisted order/status write
- [x] No `order-form-dialog`, `orders.page`, production cockpit, dashboard KPI, desktop, `_park`, deploy, or wipe changes
- [x] Only owned paths staged; foreign WIP in docs/data/tasks remains untouched

## Gates

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS (exit 0)
- `cd frontend && pnpm exec jest --config jest.config.js --runInBand src/app/pages/desk/manager-desk.page.spec.ts src/app/layout/app-layout.component.spec.ts src/app/app.routes.spec.ts` — PASS (3 suites, 20 tests)
- `cd frontend && pnpm exec eslint src/app/pages/desk/manager-desk.page.ts src/app/pages/desk/manager-desk.page.spec.ts src/app/app.routes.ts src/app/layout/app-layout.component.ts src/app/layout/app-layout.component.spec.ts` — PASS (exit 0)
- `git diff --check` on owned tracked code — PASS

## Executor report

- `ManagerDeskPage` is fixture-only and owns no HTTP/read/write path.
- App shell now projects the desk's left/right tools; disabled tools render disabled in the rails.
- The next wave is intentionally not started; DESK-402 remains PO-gated by «раскладка ок».
