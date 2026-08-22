# TZ-DESK-420 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-DESK-420.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T11:28:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (team-room CLI unavailable in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/`; TZ-SUPPLY-314 не трогаю; TZ-DESK-421 audit archived
- [x] TZ / канон / deps прочитаны; shared tray code refreshed after 421 audit
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-DESK-420-tray-label-cleanup.md` на месте

## Acceptance

- [x] «Состав» и item counter не дублируются между heading/toggle; одна строка `Состав заказа` и один counter remain
- [x] Остальные sections reviewed; убран только дублирующий CTA в shipping stub; structure/IA untouched
- [x] `data-test` contract preserved; no rename required
- [x] Expand/collapse and `aria-expanded`/`aria-controls` behavior preserved
- [x] Focused order-hub-tray tests PASS (2/2)
- [x] Browser pass on `/desk` and `/orders`: PASS (1440x900; shared tray label/counter and disclosure verified)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page/shared UI markup cleanup
- [x] FIC §A–E: N/A — no route, permission, module, MCP or capability
- [x] page.md / PAGE-TZ-INDEX: N/A — existing shared UI wording only
- [x] SECTION-READINESS: N/A — readiness unchanged
- [x] Чужой WIP не в коммите; conflict keys соблюдены; TZ-SUPPLY-314 untouched
- [x] Coupling map: N/A — no field/status/filter semantics changed
- [x] Канон: `docs/DOCS-INTEGRITY.md` прочитан

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0)
- `cd frontend && pnpm test -- order-hub-tray --runInBand --silent` → PASS (2/2, exit 0)
- `cd frontend && pnpm exec eslint src/app/shared/orders/order-hub-tray.component.ts src/app/shared/orders/order-hub-tray.component.spec.ts` → PASS (exit 0)
- `git diff --check -- ...` → PASS (exit 0)
- Browser Puppeteer authenticated local FE/BE → PASS (`/desk` and `/orders`, 1440x900)

## Executor report

- Removed the duplicate `Состав` heading/counter; retained `Состав заказа` toggle and existing `data-test`/ARIA contract.
- Removed duplicate shipping CTA sentence, keeping the link and concise limitation copy.
- Conflict disclosure: TZ-SUPPLY-314 and TZ-DESK-421 audit files untouched; unrelated dirty WIP not staged.

## Review handoff

- [x] READY FOR REVIEW recorded
- [x] Review diff complete; acceptance and gates PASS

## Closeout (после PASS)

- [x] archive + lock + удалить `_active`; `progress.md` отсутствует, N/A
- [x] Status = DONE after archive
- closed_at: 2026-08-22T11:36:00+03:00
