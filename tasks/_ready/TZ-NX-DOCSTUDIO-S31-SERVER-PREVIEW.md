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
