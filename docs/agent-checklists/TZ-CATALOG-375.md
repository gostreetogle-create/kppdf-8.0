# TZ-CATALOG-375 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-CATALOG-375.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: agent-3e757640b7 (frontend executor)
- claimed_at: 2026-08-16T12:39:07Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-CATALOG-375; sync tasks first)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-CATALOG-375.md` на месте

## Acceptance

- [x] List: клик по строке (не только имя) toggle expand tray
- [x] Tray: gold-soft + блоки RU; «Открыть карточку»; пустые блоки скрыты
- [x] Имя / склад / row-actions не ломают expand-контракт
- [x] Gates: tsc + materials.page tests PASS
- [x] Docs: materials.page.md + PAGE-TZ-INDEX CATALOG-375

## Integrity slot (до READY / archive)

- [x] Тип изменения: **page** (`/materials` list expand)
- [x] FIC §A: page.md + PAGE-TZ-INDEX обновлены; §B–E N/A (нет permission/module/MCP)
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS N/A (паритет UX list, не смена готовности раздела)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A (не трогал общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS

cd frontend && pnpm test -- --testPathPattern="materials.page" --coverage=false
→ PASS (3 suites, 25 tests)
```

## Executor report

- `/materials` list: `(rowClick)` → `expandedId` toggle; gold tray с блоками
  Идентификация / Поставщик / Геометрия / Цена и склад / Описание.
- Detail: name link (`open-row-link`) + «Открыть карточку»; stopPropagation на name/stock.
- pi-row-actions edit не открывает expand.
- Тесты expand в `materials.page-373.spec.ts` (real imports; list mode forced).
- known_limitation: grid card click = navigate-to-detail (без expand).
- Не тронуты: products.page / modules.page / desktop / chrome-rail.

## Review handoff

- [x] READY FOR REVIEW (CATALOG-375)
- [x] **Не** archive до Cursor Verdict PASS

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_

## known_limitation

- Grid: клик по карточке = navigate-to-detail (без expand), как в TZ.
