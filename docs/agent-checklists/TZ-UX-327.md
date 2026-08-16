# TZ-UX-327 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-UX-327.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (Cursor PASS → archive + commit)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: composer-frontend-executor
- claimed_at: 2026-08-16T12:56:27Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root executor; no OrchestratorKit claim for this TZ)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на modules.page keys
- [x] TZ / канон / deps прочитаны (TZ-UX-326 эталон products.page.ts)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → READY FOR REVIEW → DONE
- [x] `tasks/_active/TZ-UX-327.md` удалён при archive

## Acceptance

- [x] `/modules` фильтр в chrome-rail под ← как `/products`
- [x] Нет локального w-12 filters-rail
- [x] Gates PASS (tsc + modules.page tests)

## Integrity slot (до READY / archive)

- [x] Тип изменения: page
- [x] FIC §A–E: page chrome tools migrate; materials/products не трогаем
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS: N/A (chrome layout only)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A (не трогал общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md — touch on closeout if needed

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS (exit 0)

cd frontend && pnpm test -- --testPathPattern="modules.page" --coverage=false
→ PASS 27/27 (exit 0)
```

## Executor report

- Mirrored TZ-UX-326 products chrome onto `/modules`:
  - `PiChromeToolsService` owner `modules-page`
  - L=`filters`, R=`view-list`/`view-grid`/`refresh`
  - Removed `aside.w-12` / `filters-rail`; flyout absolute left + backdrop
  - `<1680` `modules-chrome-fallback` (filter/view/refresh icons)
  - Kept toolbar search, composition select, Create
- Specs updated for chrome mock/setTools + flyout
- Docs: `modules.page.md`, `PAGE-TZ-INDEX`, wave #2 status
- Did **not** touch materials.page / products.page
- Deploy: not run

## Review handoff

- [x] READY FOR REVIEW (WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE #2)
- [x] Cursor Verdict PASS

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T13:00:00+03:00
