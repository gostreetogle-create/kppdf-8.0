# TZ-UX-340 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-UX-340.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)
> Spec: `tasks/TZ-UX-340-pi-pagination-canon.md`
> READY FOR REVIEW: 2026-08-16T12:25:00Z

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-composer (TZ-UX-340 frontend executor)
- claimed_at: 2026-08-16T12:20:30Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root checklist Claim slot = SoT; kit claim not used for tasks/TZ-*)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (326=products, 374=modules)
- [x] TZ / канон / deps прочитаны (audit + TZ-UX-340)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → READY FOR REVIEW
- [x] `tasks/_active/TZ-UX-340.md` на месте

## Acceptance

- [x] Один визуальный pager: range `N–M из T` + ‹› + numbers + size select 10/25/50
- [x] `pi-table` footer использует `<app-pi-pagination>`; default size 10
- [x] `PI_DEFAULT_PAGE_SIZE = 10` shared constant
- [x] data-test совместимость: `pager-info`, `pager-prev`, `pager-next`, `pager-page`, `pager-page-size`
- [x] Gates PASS (`tsc` + `pi-pagination|pi-table` tests)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: other (shared UI primitive)
- [x] FIC §A–E: N/A — нет нового route/permission/module/MCP; shared pager UX
- [x] page.md / PAGE-TZ-INDEX: shell note в `page-chrome.md` + PAGE-TZ-INDEX UX-340 IN WORK→READY
- [x] SECTION-READINESS: N/A (не менялся статус секции продукта)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (не трогали products/modules/desktop)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS (exit 0)

cd frontend && pnpm test -- --testPathPattern="pi-pagination|pi-table" --coverage=false
→ PASS — 4 suites, 42 tests (pi-pagination + pi-table + tree + templates service)
```

## Executor report

- Расширен `app-pi-pagination`: range, ‹›, numbers/gaps, select 10/25/50, `pageSizeChange`, hide when ≤1 page, default 10.
- `pi-table` footer заменён на embedded `<app-pi-pagination>`; output `pageSizeChange` проброшен.
- Константа `PI_DEFAULT_PAGE_SIZE = 10`.
- Specs: новый `pi-pagination.component.spec.ts`; обновлён pager block в `pi-table.component.spec.ts`.
- Conflict disclosure: не трогал products.page / modules.page / desktop.
- Known limits: pages/grid/KP rail migration = TZ-UX-341/342 (не стартованы). Consumers ещё могут передавать свой pageSize (часто 10 уже).
- Archive **не** делаю — TZ требует Cursor PASS.

## Review handoff

- [x] READY FOR REVIEW
- [x] **Не** archive до Cursor Verdict PASS

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_
