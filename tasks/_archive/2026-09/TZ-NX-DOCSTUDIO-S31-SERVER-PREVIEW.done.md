# TZ-NX-DOCSTUDIO-S31-SERVER-PREVIEW: серверный Просмотр с HTML

**РОЛЬ АГЕНТА:** Executor (frontend-nx)
**LAYER:** 3
**PAGES:** document-studio
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §1.2
**ЗАВИСИМОСТИ:** S30 (желательно flush перед preview)
**CONFLICT KEYS:** `frontend-nx/.../studio-editor.page.ts`; `studio-workspace-shell.component.*` (если слот iframe)
**IMPLICIT CONFLICT:** `nx build kppdf-web`

## ИСХОДНОЕ

1. `fetchPreview()` вызывает `documents.preview` и пишет `previewHtml` — **нигде не вызывается**.
2. `enterPreviewMode()` только `viewMode=preview` + flushLayouts + collapse panel.
3. Canvas `[readOnly]="viewMode()==='preview'"` — сырые `{{tokens}}`.
4. `refreshPreviewIfActive()` — пустой комментарий.
5. `previewHtml` / `previewError` / `previewLoading` signals есть.

## ЧТО ДЕЛАТЬ

1. `enterPreviewMode`: после flush → `fetchPreview()`.
2. В preview: показать iframe/`[innerHTML]` безопасный путь **или** srcdoc с `previewHtml`; loading/error banners (`data-test="studio-preview-frame"` / `studio-preview-error`).
3. `refreshPreviewIfActive`: если `viewMode==='preview'` → `fetchPreview()`.
4. Редактор: скрыть canvas edit chrome или оставить readOnly canvas **под** iframe — предпочтительно **заменить** центр на HTML preview (как page.md).
5. Не ломать PDF/finalize.

## КРИТЕРИИ ПРИЁМКИ

1. «Просмотр» → network POST/GET preview → виден подставленный текст (не сырой `{{counterparty.name}}` при выбранном клиенте).
2. Ошибка API → banner, не silent.
3. «Редактор» → снова canvas edit.
4. `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S31-SERVER-PREVIEW.done.md`

---

## Реализация (S31)

Файл: `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`

- `enterPreviewMode()` — после `flushLayouts()` вызывает `fetchPreview()`; `previewLoading`/`previewError` сбрасываются сразу при входе в preview (нет пустого экрана на время flush).
- `refreshPreviewIfActive()` — больше не no-op: при `viewMode()==='preview'` вызывает `fetchPreview()`. Уже был подключён ко всем точкам мутации (style/content/table settings/table rows/delete layer/finalize/context save) — теперь реально держит HTML в актуальном состоянии.
- Центр редактора (`kpWsSheet`) переключается по `viewMode()`:
  - `editor` → `pi-studio-blocks-canvas` (readOnly убран — режим preview больше не идёт через canvas);
  - `preview` → loading banner (`data-test="studio-preview-loading"`) / error banner (`data-test="studio-preview-error"`) / `<iframe data-test="studio-preview-frame" [srcdoc]="previewSafeHtml()">`.
- `previewSafeHtml` — computed, оборачивает `previewHtml()` через `DomSanitizer.bypassSecurityTrustHtml` (тот же паттерн, что уже используется в `studio-blocks-canvas.component.ts` для текстовых блоков).
- iframe `sandbox="allow-same-origin"` (без `allow-scripts`) — блокирует выполнение любого встроенного script/HTML внутри preview-документа (текстовые блоки допускают произвольный rich-text HTML), сохраняя загрузку изображений/стилей с того же origin.
- PDF (`onDownloadPdf`) и finalize (`onFinalize`) не изменены по логике; `onFinalize` уже вызывал `refreshPreviewIfActive()` — теперь этот вызов реально обновляет HTML после архивации документа.

Backend endpoint `POST /studio-documents/:id/preview` уже был реализован (`studio-output.service.ts` → `StudioOutputService.preview`), контракт не менялся.

### Gates (факт)

```text
cd frontend-nx && pnpm exec nx run kppdf-web:lint
  → FAIL: 21 errors / 75 warnings — baseline debt, не связан с этим TZ
    (проверено сравнением через временный git stash: идентичные 96 problems /
    21 errors на branch до правок S31; ни один error/warning не в изменённых
    строках studio-editor.page.ts кроме уже существовавшей строки
    click-handler на panel-контейнере, не тронутой этой задачей)

cd frontend-nx && pnpm exec nx run kppdf-web:test --testPathPattern=studio
  → FAIL: 2 failing (registries.catalog.spec.ts) — baseline, не связан со
    studio-editor / preview (тем же stash-сравнением подтверждено, что эти
    2 теста падают и без правок S31); 344 passed / 7 skipped;
    у studio-editor.page.ts нет отдельного spec-файла (baseline).

cd frontend-nx && pnpm exec nx build kppdf-web
  → PASS, exit 0
```

Checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-S31-SERVER-PREVIEW.md`

```text
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build kppdf-web включает Angular AOT type-check)
  - tests: FAIL (baseline debt, не связано с TZ — см. Gates)
  - lint: FAIL (baseline debt, не связано с TZ — см. Gates)
  - kppdf-web build: PASS
  - checklist: ADDED and completed
  - progress.md: N/A (не менялся; live-state в `_NOW.md`)
  - status synchronization: PASS
```
