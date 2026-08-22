# TZ-TEST-420 checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-TEST-420-fix-preexisting-fe-jest.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff-2
- claimed_at: 2026-08-22T22:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: no (unavailable)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (DESK-418 conflict keys: desk/manager-desk.page.ts; TEST-420 conflict keys: login.page.ts, production-read.facade.ts — no overlap)
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-TEST-420-fix-preexisting-fe-jest.md` на месте

## Acceptance

- [ ] ШАГ 1: Run focused Jest → catalog failures
- [ ] ШАГ 2: Fix spec or product code (if genuine bug)
- [ ] ШАГ 3: login.page.spec 0 fail
- [ ] ШАГ 4: production-read.facade.spec 0 fail
- [ ] No xit/skip without reason
- [ ] No changes to desk, admin dialogs, products/modules/materials

## Integrity slot (до READY / archive)

- [ ] Тип изменения определён: other (test fix)
- [ ] FIC §A–E: N/A — test-only, no UI route / permission / module change
- [ ] page.md / PAGE-TZ-INDEX: N/A — no UI route change
- [ ] SECTION-READINESS: N/A
- [ ] Чужой WIP не в коммите; conflict keys соблюдены
- [ ] Coupling map: N/A — не трогал общее поле/статус
- [ ] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- pending

## Executor report

- pending

## Review handoff

- N/A — TZ не требует Cursor/PO review

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
