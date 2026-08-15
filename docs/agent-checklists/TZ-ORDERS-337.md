# TZ-ORDERS-337 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-ORDERS-337.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-grok-4.6-executor
- claimed_at: 2026-08-15T20:51:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room: Unknown task TZ-ORDERS-337)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-ORDERS-337.md` на месте (удалён после archive)

Mode: **TZ-exec**
Primary signal: `/orders/:id` и list expand «Состав» — тот же `app-composition-tree`; карандаш открывает каталожный редактор; лист изделия без детей открывает изделие; «Паспорт заказа» → «Заказ» — **met**
Secondary: FE tsc + jest composition-tree / order-detail / orders.page — **PASS**

## Acceptance

- [x] `/orders/:id` leaf product (no modules): click or pencil opens product editor
- [x] Module/material rows have pencil → matching catalog editor
- [x] List expand shows tree UI (ИЗД/МОД/МАТ), not plain `<ul>` bullets
- [x] Expand chevron still only when children exist
- [x] FE tsc + jest composition-tree + order-detail + orders.page PASS
- [x] Archive + push (no deploy)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page
- [x] FIC §A: no new route; page.md + PAGE-TZ-INDEX updated. §B–E N/A (no permission/module/MCP)
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS N/A (сделки остаются SHELL/MVP; статус раздела не менялся)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (+ helpers + BOM pencil wire)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0)
- `pnpm exec jest --config jest.config.js` composition-tree + order-detail + orders.page + forest + bom-panel → PASS 48/48
- eslint owned files → PASS (0 errors; pre-existing OnInit warning on orders.page)

## Executor report

Pencil on composition-tree rows; order detail + list expand share live catalog forest; catalog dialogs reused (lazy, BOM path). Title «Заказ». No deploy.

Conflict disclosure: also touched `product-bom-panel.component.ts` (wire `editClick`) and new helpers `order-composition-forest.ts`, `open-catalog-composition-edit.ts`.

## Review handoff

- [x] TZ не требует Cursor Verdict inbox — PO: implement as executor + commit/push
- [x] Archive after gates

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T21:05:00Z
