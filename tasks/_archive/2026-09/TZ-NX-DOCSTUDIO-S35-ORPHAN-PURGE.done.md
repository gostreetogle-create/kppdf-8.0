# TZ-NX-DOCSTUDIO-S35-ORPHAN-PURGE: мёртвый код студии

**РОЛЬ АГЕНТА:** Executor (frontend-nx)
**LAYER:** 3
**PAGES:** document-studio
**PAGE_DOCS:** n/a (hygiene)
**ЗАВИСИМОСТИ:** S34
**CONFLICT KEYS:** `studio-shell.page.ts`; `studio-table-editor.component.ts`; `studio-editor.page.ts` (dead imports); `studio-workspace-chrome.ts` если мёртвые rail items
**IMPLICIT CONFLICT:** `nx build kppdf-web`

## ИСХОДНОЕ

- `studio-shell.page.ts` — stub, не в routes.
- `studio-table-editor.component.ts` — не импортирован.
- Dead lucide imports в editor (LayoutGrid и т.п. — проверить).
- Dual rail: `STUDIO_RAIL_ITEMS` vs `railItems=[]` — упростить комментарием или удалить мёртвое.

## ЧТО ДЕЛАТЬ

1. Удалить orphan files **или** пометить `@deprecated` + убрать из barrel, если сомнение — delete если zero refs (Grep).
2. Убрать unused imports editor.
3. Build green.

## НЕ ИЗМЕНЯТЬ

- Поведение живых панелей
- BE

## КРИТЕРИИ ПРИЁМКИ

1. Grep: нет dangling imports на удалённое.
2. `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S35-ORPHAN-PURGE.done.md`

---

## Реализация (S35)

Grep по всему `frontend-nx` подтвердил zero refs для двух файлов (кроме
самих себя) — удалены целиком:

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-shell.page.ts` —
  stub `StudioShellPage`, не в `studio.routes.ts`, никем не импортировался.
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-editor.component.ts` —
  `StudioTableEditorComponent`, никем не импортировался (актуальный
  редактор таблиц — инлайн в `studio-blocks-canvas.component.ts`).

Dead lucide import: подсчёт вхождений каждой иконки из `lucide-angular`
import в `studio-editor.page.ts` показал, что `LayoutGrid` встречается
ровно один раз (сама строка импорта) — удалён. Остальные (`ChevronLeft`,
`ChevronRight`, `Database`, `FileStack`, `FileText`, `Layers`,
`LayoutTemplate`, `Settings2`) используются и оставлены без изменений.

Dual rail `STUDIO_RAIL_ITEMS` vs `[railItems]="[]"`: `STUDIO_RAIL_ITEMS`
оказался **не** мёртвым — `studioPanelTitle()` (используется live в
`studio-editor.page.ts:624` для заголовка панели) читает его. Мёртв только
второй смысл — «рендерящийся список rail-кнопок», который никогда не
доходит до отрисовки, потому что `studio-editor.page.ts` передаёт
`[railItems]="[]"` и `[showDesktopRail]="false"` в `pi-studio-workspace-shell`
(десктопный rail этой страницы выключен целиком, in-place кнопки не
рисуются). Так как это не zero-refs, по опции TZ («упростить комментарием
**или** удалить мёртвое») — задокументировано комментарием, а не удалено,
чтобы не трогать живой контракт `studioPanelTitle()` / форму
`StudioWsRailItem`:
- `studio-editor.page.ts` — HTML-комментарий перед `<pi-studio-workspace-shell>`.
- `studio-workspace-chrome.ts` — комментарий над `STUDIO_RAIL_ITEMS`.

Вне scope (не входит в conflict keys TZ, не тронуто): `studio-geometry.ts` /
`studioSheetRect` — после удаления `studio-shell.page.ts` используется только
собственным `studio-geometry.spec.ts`; поведение живых панелей не менялось.

### Gates (факт)

```text
cd frontend-nx && pnpm exec nx build kppdf-web (baseline, до кода)
  → PASS, exit 0

cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  → PASS, exit 0, no output

cd frontend-nx && pnpm exec nx test kppdf-web (full suite, baseline check)
  → FAIL: 2 failing (registries.catalog.spec.ts) — ПРЕДСУЩЕСТВУЮЩИЙ baseline,
    файл вне diff этого TZ, идентично документированному в S31/S32/S33/S34
    (350 passed / 7 skipped / 359 total)

cd frontend-nx && pnpm exec eslint apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts apps/kppdf-web/src/app/pages/studio/studio-workspace-chrome.ts
  → PASS, exit 0, 0 errors, 5 pre-existing warnings (non-null assertions / unused var,
    вне зоны правки этого TZ)

pnpm architecture:check
  → PASS: "Architecture check passed (1396 files; baseline 17; resolved since baseline: 2)."

cd frontend-nx && pnpm exec nx build kppdf-web
  → PASS, exit 0 (Successfully ran target build for project kppdf-web and 4 tasks it depends on)
```

Grep-проверка отсутствия dangling imports на удалённое (`StudioShellPage`,
`studio-shell.page`, `StudioTableEditorComponent`, `studio-table-editor.component`)
по всему `frontend-nx` — 0 совпадений вне удалённых файлов.

Checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-S35-ORPHAN-PURGE.md`

```text
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS for changed-scope (no dedicated spec file for deleted/changed files); pre-existing baseline FAIL unrelated to this TZ (see Gates)
  - lint: PASS for changed-scope files (0 errors)
  - kppdf-web build: PASS
  - checklist: ADDED and completed
  - progress.md: N/A (не менялся; live-state в `_NOW.md`)
  - status synchronization: PASS
```
