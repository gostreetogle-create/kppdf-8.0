# TZ-SALES-374 checklist

> Status: **DONE**
> Marker: _(removed — archived)_
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)
> ready_for_review_at: 2026-08-15T10:10:00Z

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (Cursor Agent)
- claimed_at: 2026-08-15T09:54:59Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root executor; Team Room CLI not required for root tasks)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — AUTH-305 keys не пересекаются
- [x] TZ / PO checklist / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-SALES-374.md` на месте

## Acceptance

- [x] Toolbar Рамка/Шапка — Lucide icon buttons с aria/title состояния
- [x] `sheetLayout.tableHeaderFontSize` + `tableFontSize`; UI два контроля; preview th vs td
- [x] Row gutter: только chevron; pencil/⋯/trash → drawer «Действия» с ясным RU
- [x] Expand frame вокруг data-row+drawer + dim siblings
- [x] Optional: «пресет» → «шаблон» в Ещё
- [x] Docs + gates из TZ

## Integrity slot (до READY / archive)

- [x] Тип изменения: page
- [x] FIC §A–E: page.md + PAGE-TZ-INDEX обновлены; schema/DTO sheetLayout field additive
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS N/A (proposals create chrome, not section readiness)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd frontend && pnpm test -- proposal-create` → PASS (7 suites / 61 tests)
- `cd backend && pnpm test -- table-template.service` → PASS (7 tests, incl. 374 header font)

## Executor report

- Chrome: Square/Bold icon-buttons; dual font header+body in toolbar + Вид листа; preview th/td separate sizes.
- Row gutter: chevron only; drawer «Действия» with RU labels incl. «Создать копию в каталоге»; ink frame + sibling dim.
- Docs: proposals-create.page.md + PAGE-TZ-INDEX note 374.
- Conflict vs AUTH-305: OK. Deploy НЕ. Archive after Cursor PASS.

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor Verdict: **PASS** (2026-08-15)
  - Cross-check `9b50bc9e`: Lucide Square/Bold; dual `tableHeaderFontSize`/`tableFontSize`; gutter chevron-only; drawer «Действия»; expand frame CSS; preset→шаблон.
  - Browser Create КП: toolbar Рамка/Шапка + два шрифта; drawer «Действия» / «Убрать из КП» after expand.
  - Gates credible; integrity page.md + PAGE-TZ-INDEX OK.
- [x] Archive/closeout — Buffy after this PASS

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T07:00:00Z

## Executor report (closeout)

- implementation: `9b50bc9ec044216817fd0928c8fd3d29cb3f52e6`
- archive: `tasks/_archive/2026-08/TZ-SALES-374.done.md`
- lock: `.mimocode/locks/TZ-SALES-374-kp-table-editor-chrome.lock`
- closeout: `2678cefc8e2a923380186f97a1aa94e05b13ae3b`
- cursor_verdict: PASS
