# TZ-PRODUCTION-321 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-PRODUCTION-321.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: executor-grok-4.6
- claimed_at: 2026-08-15T17:30:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root TZ not in Team Room catalog)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps / audit / PO-CANON Gantt cascade прочитаны
- [x] Claim slot заполнен
- [x] Active marker cleared on archive

## Acceptance

- [x] Раскрытый заказ: клик «… · Столярка» (или ▸) открывает detail под строкой (люди + дни); повтор закрывает
- [x] Дни в detail → PATCH estimate-days (тот же write-path, что resize)
- [x] Catalog path с confirm при production:write; без права — скрыт
- [x] Один work-detail за раз; dismiss/Esc закрывает
- [x] Timeline drag/resize без регрессии
- [x] tsc + jest gantt-bars + cockpit
- [x] Docs + archive

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page
- [x] FIC §A: page.md + PAGE-TZ-INDEX; §B–E N/A (нет нового route/permission/module/MCP)
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS: N/A (тот же estimate studio)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`orders-rail` не стейджим)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm exec jest src/app/pages/production/blocks/gantt-bars.component.spec.ts src/app/pages/production/production-cockpit.page.spec.ts src/app/pages/production/gantt-bar.model.spec.ts --no-coverage` → **52 PASS**

## Executor report

- Inline work-detail under Gantt child row; days = existing `onEstimateDaysCommit`; catalog = `promptCatalogDaysChange` + WorkTypesService.
- Conflict disclosure: left `orders-rail` and unrelated backend/deploy/paspots WIP unstaged.
- known_limitation: bottom sheet still live until 322; product/module deep-links remain in sheet.

## Closeout

- [x] archive + lock + progress + удалить `_active` и исходный TZ
- [x] Status = DONE
- closed_at: 2026-08-15T17:45:00Z
