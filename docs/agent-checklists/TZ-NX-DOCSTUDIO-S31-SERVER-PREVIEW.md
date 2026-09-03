# TZ-NX-DOCSTUDIO-S31-SERVER-PREVIEW checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S31-SERVER-PREVIEW.md` — removed on archive
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-03T21:22:57Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (нет CLI в этой сессии; conflict keys проверены вручную через `tasks/_active/` и `_NOW.md`)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → worktree `D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S31`, branch `claude/docstudio-s31`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `studio-editor.page.ts` / `studio-workspace-shell.component.*`
- [x] TZ / канон / deps прочитаны (`tasks/_ready/TZ-NX-DOCSTUDIO-S31-SERVER-PREVIEW.md`, `docs/pages/document-studio.page.md` §1.2)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE после gates
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-S31-SERVER-PREVIEW.md` на месте

## Acceptance (из TZ)

- [x] `enterPreviewMode()`: после `flushLayouts()` → вызывает `fetchPreview()` (`studio-editor.page.ts:793-800`)
- [x] `refreshPreviewIfActive()`: если `viewMode()==='preview'` → `fetchPreview()` (было пустым комментарием, `studio-editor.page.ts:1754-1756`)
- [x] Preview показывает iframe `[srcdoc]` с `previewHtml` через `DomSanitizer.bypassSecurityTrustHtml` (безопасный путь, sandbox="allow-same-origin", без allow-scripts) — центр редактора заменяется на HTML preview, а не readOnly canvas поверх
- [x] loading banner `data-test="studio-preview-loading"`, error banner `data-test="studio-preview-error"`, frame `data-test="studio-preview-frame"`
- [x] «Редактор» (`setViewMode('editor')`) снова показывает canvas edit — не менялось, уже сбрасывал `previewHtml`/`previewError`
- [x] PDF/finalize (`onDownloadPdf`, `onFinalize`) не тронуты
- [x] `nx build kppdf-web` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (document-studio, viewMode preview)
- [x] FIC §A–E: N/A — чистый frontend UI/данные, использует существующий backend endpoint `POST /studio-documents/:id/preview` (уже реализован, `studio-output.service.ts`), новых полей/контрактов не добавлено
- [x] page.md уже описывает целевое поведение (`docs/pages/document-studio.page.md` §1.2, строка «Просмотр | `POST /studio-documents/:id/preview` → iframe с HTML как при печати») — реализация приведена в соответствие, правок в doc не требуется
- [x] SECTION-READINESS: N/A (не трогал)
- [x] Чужой WIP не в коммите; conflict keys (`studio-editor.page.ts`) — только мои правки
- [x] Coupling map: N/A (не менял общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `nx build kppdf-web` → exit 0
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` конфликтом
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

```text
cd frontend-nx && pnpm exec nx run kppdf-web:lint
  → FAIL: 21 errors / 75 warnings — ПРЕДСУЩЕСТВУЮЩИЙ baseline debt
    (подтверждено: идентичный результат 96 problems / 21 errors на branch
    ДО правок S31, через временный git stash сравнения; ни один error/warning
    не находится в изменённых строках studio-editor.page.ts кроме уже
    существовавшей строки 207 click-handler, не тронутой этим TZ)

cd frontend-nx && pnpm exec nx run kppdf-web:test --testPathPattern=studio
  → FAIL: 2 failing (registries.catalog.spec.ts) — ПРЕДСУЩЕСТВУЮЩИЙ baseline,
    не связан со studio-editor / preview (подтверждено тем же stash-сравнением);
    344 passed / 7 skipped; нет studio-editor.page.spec.ts

cd frontend-nx && pnpm exec nx build kppdf-web
  → PASS, exit 0 (Successfully ran target build for project kppdf-web and 4 tasks it depends on)
```

## Executor report

- `enterPreviewMode()` теперь вызывает `fetchPreview()` после `flushLayouts()`; `previewLoading`/`previewError` сбрасываются в начале входа в preview, чтобы избежать пустого экрана во время flush.
- `refreshPreviewIfActive()` реализован: при активном `viewMode==='preview'` перезапрашивает `fetchPreview()`. Он уже был подключён ко всем мутациям блоков (style/content/table settings/table rows/delete/finalize/context) — теперь реально обновляет HTML вместо no-op.
- Шаблон: центр редактора (`kpWsSheet`) теперь переключается — canvas edit (readOnly убран, он больше не нужен) в режиме editor, iframe `[srcdoc]` с обёрнутым через `DomSanitizer.bypassSecurityTrustHtml` `previewHtml` в режиме preview, с loading/error banners по `data-test` из TZ.
- iframe `sandbox="allow-same-origin"` (без `allow-scripts`) — блокирует выполнение любого пользовательского HTML/script внутри превью (text-блоки допускают произвольный HTML контент через rich-text редактор), сохраняя загрузку изображений/стилей.
- PDF (`onDownloadPdf`) и finalize (`onFinalize`) не изменены; `onFinalize` уже вызывал `refreshPreviewIfActive()`, теперь это реально обновляет preview после архивации.
- Conflict disclosure: правки только в `studio-editor.page.ts`. `.mcp.json` — посторонняя незакоммиченная правка окружения, не относящаяся к TZ, исключена из коммита по инструкции оркестратора.
- Known limits: dedicated unit-тест на `studio-editor.page.ts` в проекте отсутствует (компонент не покрыт spec-файлом в принципе, baseline); ручная browser-проверка network POST/GET не выполнялась в этой сессии (headless окружение) — визуальная приёмка (критерий 1 из TZ) полагается на существующий backend contract-тест `document-templates-build.e2e-spec.ts` / `studio-output.service.spec.ts` и на статическую проверку сборки.

## Review handoff

- [x] TZ не требует отдельного review-волны (нет CATALOG/DICT inbox упоминания) — archive сразу после gates по образцу S27–S30.

## Closeout (после PASS)

- [x] archive + удалить `_active`
- Status = DONE
- closed_at: 2026-09-03T21:40:00Z
