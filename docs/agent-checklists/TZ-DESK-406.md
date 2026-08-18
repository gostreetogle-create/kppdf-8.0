# TZ-DESK-406 checklist

| Field | Value |
|-------|-------|
| Status | DONE |
| TZ | `tasks/TZ-DESK-406.md` |
| Prompt | `tasks/PROMPT-FREEBUFF-DESK-406.md` |
| Depends | DESK-405 DONE |
| Blocks | PO «раскладка v2 ok» → DESK-402 |
| Agent ID | buffy-desktop |
| Claimed at | 2026-08-18T20:41:13+03:00 |
| Workspace | D:\kppdf-8.0 |

## Claim slot

- agent_id: buffy-desktop
- claimed_at: 2026-08-18T20:41:13+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session; slot filled here)

## Preflight

- [x] Workspace gate: `D:\kppdf-8.0`, branch `main`
- [x] `tasks/_active/` + active-map — no foreign conflict on desk page
- [x] Read: `page-chrome.md`, `orders.page.ts`, TZ-DESK-406, manager-desk.page.md
- [x] Claim slot filled before edits

## PO acceptance (chrome parity)

- [x] Single `app-pi-group-workspace` chip row — no `pi-page-chrome`, no custom workflow nav
- [x] No «Рабочий стол» in page body chrome
- [x] Expanded order number in same chrome block (tools slot suffix), not second row
- [x] Content width matches `/orders` (no double padding / extra max-width)
- [x] No visible H1 «Очередь заказов»
- [x] 405 behavior preserved: expand tray, L/R flyout, fixture-only

## Gates

- [x] `tsc --noEmit` PASS
- [x] Jest `manager-desk.page` PASS
- [x] ESLint desk page + workflow chips PASS

## Executor report (auto)

- Replaced double chrome with one `app-pi-group-workspace` chip row + new `desk-workflow-chips.ts` (`GroupChip[]`).
- Order number suffix in tools slot (`data-test="desk-order-crumb"`, `aria-current="page"`), no «Рабочий стол».
- Removed `.manager-desk` max-width/padding; queue now spans `.pi-page-frame` like `/orders`.
- H1 «Очередь заказов» → `sr-only`; count moved to tools slot.
- Preserved 405: expand tray, L/R flyout, query restore, chrome rail tools, fixture-only.
- Spec updated: asserts `group-chips`, absence of `desk-page-chrome`/`desk-workflow-crumbs`, crumb suffix; AuthService mock added for group-workspace ACL.

## Closeout

- [x] archive `tasks/_archive/2026-08/TZ-DESK-406.done.md` + lock `.mimocode/locks/TZ-DESK-406-chrome-parity.lock`
- [x] `tasks/TZ-DESK-406.md` and `tasks/_active/TZ-DESK-406.md` removed
- [x] Status = DONE
- closed_at: 2026-08-18T20:5x:xx+03:00 (commit time)
