# TZ-UX-342 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-UX-342.done.md`
> Commit/push: по `docs/GIT-POLICY.md`
> Spec: `tasks/_archive/2026-08/TZ-UX-342.done.md` (body from root TZ)
> READY FOR REVIEW: 2026-08-16T09:45:00Z
> closed_at: 2026-08-16T12:35:00+03:00

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-composer (TZ-UX-342 frontend executor)
- claimed_at: 2026-08-16T09:25:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root checklist Claim slot = SoT; kit claim not used for tasks/TZ-*)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (331=app-layout, 341=products/modules/materials)
- [x] TZ / канон / deps прочитаны (audit + TZ-UX-342; UX-340 landed a36120d4)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → READY FOR REVIEW
- [x] `tasks/_active/TZ-UX-342.md` на месте

## Acceptance

- [x] Нет видимого pager без рабочей смены страницы (dead `[total]` removed)
- [x] KP rail визуально = канон (`app-pi-pagination`, PAGE_SIZE 10, `showPageSize=false`)
- [x] Gates PASS (`tsc` + focused specs touched)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (KP rail + inventory/supply/dict/doc lists)
- [x] FIC §A–E: N/A — нет нового route/permission/module/MCP
- [x] page.md / PAGE-TZ-INDEX обновлены для touched routes
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (не трогали products/modules/materials/app-layout/desktop)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS (exit 0)

cd frontend && pnpm test -- --testPathPattern="proposal-product-rail|documents.page|templates.page|forms.page|stock-movements.page|warehouses.page|storage-items|inventory-dashboard|supply.page|text-block-categories|document-template-categories|texts.page|tables.page" --coverage=false
→ PASS — 14 suites, 109 tests
```

## Executor report

- KP rail: custom range label removed; uses canon `app-pi-pagination` with `showPageSize=false`; PAGE_SIZE 12→10 (`PI_DEFAULT_PAGE_SIZE`).
- Dead totals removed (no slice/pageChange): stock-movements, warehouses, storage-items, inventory-dashboard, supply, document-template-categories, text-block-categories, texts, tables.
- documents/templates: removed unused `rangeLabel` / prev/next / totalPages helpers.
- forms demo: pageSize 5→10.
- Conflict disclosure: не трогал products/modules/materials (341), app-layout (331), desktop.
- Known limits: lists without server pagination show all rows (typical workshop lists short); real paging remains on documents/templates/color-references/etc.
- Archive **не** делаю — TZ требует Cursor PASS.

## Review handoff

- [x] READY FOR REVIEW
- [x] **Не** archive до Cursor Verdict PASS

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T12:35:00+03:00
- Cursor Verdict: PASS
- Code SHA: `db689987256bbc8e054e1838aacc1417aa5ac14f`
- Archive: `tasks/_archive/2026-08/TZ-UX-342.done.md`
- Lock: `.mimocode/locks/TZ-UX-342-pager-dead-totals.lock`
- Deploy: NOT RUN
