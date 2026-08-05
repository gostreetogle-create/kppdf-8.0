# TZ-UI-TABLE-302 checklist

> Status: **DONE**  
> Marker: archived — `tasks/_archive/2026-08/TZ-UI-TABLE-302.done.md`  
> Commit/push: **NO** unless PO says so

## Claim slot

- agent_id: openai/gpt-5.6-luna (Buffy)
- claimed_at: 2026-08-05T15:35:05Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room in this session)

## Preflight

- [x] Workspace D:\kppdf-8.0
- [x] Read Tree SoT and TZ-UI-TABLE-302
- [x] DICT-312 is READY FOR REVIEW; no overlapping active claim on Tree keys
- [x] Claim + `_active`

## Acceptance

- [x] Tree in kit + categories migrated: new `PiTableTreeComponent` owns shared Tree header/rows, nested rendering, indent and expansion; CategoriesPage supplies data/columns/templates only.
- [x] drag capability preserved: `dragReorder` is an explicit capability flag; root and child drops emit parent-aware events and persist through the existing reorder endpoints with optimistic updates.
- [x] fe tsc + jest PASS
- [x] READY FOR REVIEW (no archive until Cursor PASS)

## Gates (fact)

- `cd D:\kppdf-8.0\frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — **PASS** (exit 0; no output)
- `cd D:\kppdf-8.0\frontend && pnpm exec jest --testPathPattern "pi-table|categories.page" --no-coverage` — **PASS** (6 suites, 59/59 tests)
- `git -C D:\kppdf-8.0 diff --check` — **PASS** (warnings only about LF→CRLF normalization)

## Executor report

- Что сделано: добавлен shared `app-pi-table-tree` primitive на базе существующих `ColumnDef`/cell templates; migrated CategoriesPage body; сохранены search/type filter, auto-expand, dialogs, optimistic root/child reorder и API endpoints; добавлены Tree kit + categories specs.
- Conflict disclosure: `frontend/src/app/shared/ui/pi-table-tree.component.ts`, `frontend/src/app/shared/ui/pi-table-tree.component.spec.ts`, `frontend/src/app/pages/dictionaries/categories.page.ts`, `docs/pages/categories.page.md`, checklist, active marker/map. DICT-312 chrome/layout files не изменялись в этом TZ.
- Known limits: MVP поддерживает два уровня; filtered drag reorder сохраняет прежнее ограничение индексов отфильтрованного дерева; browser screenshot smoke не запускался.

## Review handoff

- [x] READY FOR REVIEW в checklist
- [x] Active marker переведён в READY FOR REVIEW
- [x] Active map переведён в READY FOR REVIEW
- [x] Archive — Cursor Verdict PASS 2026-08-05
- closed_at: 2026-08-05T16:45:00Z
