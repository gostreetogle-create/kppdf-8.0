# TZ-NX-DOCSTUDIO-LIST-BULK-DELETE checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-LIST-BULK-DELETE.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T18:20:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room CLI не настроен в этой сессии)

## Preflight

- [x] `git branch --show-current` → `main`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто, нет чужого CLAIM
- [x] TZ прочитан/написан (`tasks/_active/TZ-NX-DOCSTUDIO-LIST-BULK-DELETE.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-LIST-BULK-DELETE.md` на месте

## Acceptance

- [x] Чекбокс на строке + «выбрать все» в шапке (tri-state)
- [x] Панель «Удалить выбранное (N)» при выборе ≥1, корректное RU-склонение
- [x] Confirm — тот же destructive dialog, что у одиночного удаления
- [x] Confirm → параллельное удаление всех выбранных, reload, сброс выбора
- [x] Частичный отказ → честный toast, остальные не роняет (jest, мокнутый частичный fail)
- [x] Одиночное удаление/дублирование/поиск/фильтр — без регресса (полный existing suite зелёный)
- [x] Живой browser-прогон против реального backend (Playwright, 2 throwaway QA-документа, не трогая реальные документы PO)

## Integrity slot

- [x] Тип изменения: page (UI-доработка существующей страницы, без нового route/permission/module)
- [x] FIC §A/B/C — N/A: нет нового route/permission/backend-модуля, используется существующий `DELETE /studio-documents/:id`
- [x] `document-studio.page.md` — addendum §1 добавлен
- [x] DOMAIN-MAP / SECTION-READINESS — N/A, контур `/studio` не менялся
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map — N/A, общее поле не тронуто

## Build integrity

- [x] Baseline до кода: `nx build kppdf-web` → exit 0
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

```
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit         → PASS (0 output)
cd frontend-nx && pnpm exec nx test kppdf-web --testFile=.../studio-list.page.spec.ts → PASS (12/12, incl. 6 new bulk-delete tests)
cd frontend-nx && pnpm exec nx lint kppdf-web                                          → baseline 38 errors (pre-existing, _NOW.md PARK); 0 in changed files (studio-list*)
cd frontend-nx && pnpm exec nx build kppdf-web                                         → PASS exit 0 (baseline + after code, both green; same pre-existing budget warnings)
```

Live Playwright (real backend, real Mongo, no mocks):
- Login (admin/admin123) → 200
- `/studio`, search filter `QA-BULK-DELETE-TEST` → 2 throwaway rows (created via API for this test, not PO's real documents)
- Select-all on filtered view → bulk bar "Выбрано: 2" + "Удалить выбранное (2)"
- Confirm dialog "Удалить 2 документа?" (correct RU plural for N=2)
- Confirm → both deleted, list reloads to "Документов не найдено", 0 console errors
- Screenshots: `.logs/qa-shots/bulk-delete-confirm-dialog.png`, `.logs/qa-shots/bulk-delete-after.png`

## Executor report

Root cause / what: no multi-select existed on `/studio` document list; PO accumulated
many test documents and one-by-one delete was slow. Added row checkboxes + tri-state
"select all" (visible/filtered set) + bulk-delete action bar reusing the existing
destructive-confirm dialog pattern and the existing per-id `DELETE` endpoint (parallel
calls, no new backend surface — soft-delete already atomic per document).

Files changed:
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.spec.ts` (+6 tests, + Lucide icon providers for checkbox rendering)
- `docs/pages/document-studio.page.md` (short addendum)

Known limitation (documented in TZ): bulk delete is N parallel HTTP DELETE calls, not
a transaction — a partial network failure can leave some documents undeleted; this is
surfaced honestly via toast, not silently swallowed. `/studio/templates` untouched
(out of scope — PO asked specifically about the documents list).

## Review handoff

- [x] Прямой запрос PO в терминале — нет отдельной Cursor-волны/inbox
- [x] Archive после gates PASS + живого прогона (не требует Cursor Verdict — не часть волны)

## Closeout

- [x] archive + `_NOW.md` обновлён + удалён `_active`
- [x] Status = DONE
- closed_at: 2026-09-14T18:35:00Z
