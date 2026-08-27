# TZ-QA-445C — DONE

> Статус: DONE · Закрыт: 2026-08-27 · agent: freebuff-2
> TZ: `tasks/TZ-QA-445C-doc-template-pdf-photo.md`
> PAGES: `/doc-constructor/builder/:id` + PDF КП

## Что сделано

1. **PDF rebuild (не stale snapshot):** `quotation-output.renderPdf` всегда
   пересобирает HTML из текущих `quotation.items` (`preferLiveRebuild`), чтобы
   `photoUrl` не терялся за замёрзшим `templateSnapshot.html`. Archive по-прежнему
   может брать snapshot.

2. **`<base href>` в document build:** `document-template` `renderHtml` /
   `renderHtmlPages` вставляют публичный origin — `/uploads` резолвится в
   srcdoc и headless PDF.

3. **Builder preview = editor:** перед `build` flush pending autosave
   (`pendingPatches`); `withPreviewBaseHref` переписывает `/uploads` и base
   под `window.location.origin` для iframe srcdoc.

4. **Таблица «Фото»:** string URL в photo-колонке → `<img>`; плейсхолдер
   `[img]` / `[image]` / `[фото]` → «Нет фото» (не сырой текст).

## Gates

- backend tsc PASS
- frontend tsc PASS
- jest quotation-output + table-template + document-template.assets: 25/25 PASS
- jest builder.page.spec: 31/31 PASS
- architecture:check — pre-existing FE cross-page violations (не зона 445C)
- Deploy: NO

## Files

- `backend/src/modules/generated-document/quotation-output.service.ts` (+spec)
- `backend/src/modules/document-template/document-template.service.ts` (+assets.spec)
- `backend/src/modules/table-template/table-template.service.ts` (+spec)
- `frontend/src/app/pages/doc-constructor/builder/builder.page.ts` (+spec)
