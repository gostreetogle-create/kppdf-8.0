# TZ-CATALOG-374 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-CATALOG-374.done.md`
> Commit/push: по `docs/GIT-POLICY.md` — Cursor Verdict PASS + archive

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-composer (TZ-CATALOG-374 frontend executor)
- claimed_at: 2026-08-16T12:12:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: best-effort FAIL (Unknown task: TZ-CATALOG-374; sync tasks first)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `modules.page` (326=products chrome; 332=form-dialog; 336=gantt; TZD-48=desktop)
- [x] TZ / канон / deps прочитаны (`TZ-CATALOG-374-modules-list-expandable-composition.md`, products expand эталон, `PO-CANON.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → READY FOR REVIEW → DONE
- [x] `tasks/_active/TZ-CATALOG-374.md` удалён после archive

## Acceptance

- [x] Клик по строке модуля в list раскрывает tray под строкой со составом (не уводит сразу на detail)
- [x] Повторный клик сворачивает; клик по другой строке переключает
- [x] Ссылка в «Название» / «Открыть карточку» ведёт на `/modules/:id`
- [x] Empty / loading / error — русские, понятные
- [x] Визуально узнаваемый паритет с expand Продукции (`border-l-gold` + `gold-soft`)
- [x] Код готов к второй секции tray (`expandedSection`) без фейковых вкладок
- [x] Gates PASS; archive после Cursor PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (`/modules` list expand)
- [x] FIC §A–E: N/A — UI list parity с существующим products expand; нет нового API/write-path
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS: N/A — page.md + PAGE-TZ-INDEX достаточны для list expand
- [x] Чужой WIP не в коммите; conflict keys соблюдены (не chrome filters-rail / UX-327)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS

cd frontend && pnpm test -- --testPathPattern="modules.page" --coverage=false
→ PASS (24 tests)
```

Primary signal: `/modules` — row-click expand состава; detail через имя / «Открыть карточку».
Secondary: tsc + modules.page tests.

## Executor report

- `onRowClick` → toggle `expandedId` + lazy `getModuleTree(id, 2)` (не navigate).
- Tray: gold-soft / border-l-gold; секция «Состав» + «Открыть карточку»; empty/loading/error RU.
- Tree children → links `/materials/:id` / `/modules/:id`; nested module preview toggle.
- `expandedSection: 'composition'` — задел successor без пустых вкладок.
- Grid: без expand (клик карточки → detail), как known_limitation.
- Specs: expand/collapse/switch/empty/tree/edit-no-expand + name link.

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor Verdict PASS → archive

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T12:30:00+03:00
