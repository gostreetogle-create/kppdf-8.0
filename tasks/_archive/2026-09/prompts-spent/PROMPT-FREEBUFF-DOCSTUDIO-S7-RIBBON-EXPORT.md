# PROMPT — Executor Doc Studio S7-RIBBON-EXPORT

```text
Executor kppdf-8.0 · TZ-NX-DOCSTUDIO-S7-RIBBON-EXPORT

Prerequisites: S7-4 DONE, tasks/_active/ empty.

1) GEMINI.md + kppdf-executor-loop
2) CLAIM → tasks/_active/TZ-NX-DOCSTUDIO-S7-RIBBON-EXPORT.md
3) studio-editor.page.ts ribbon:
   - PDF: PiStudioDocumentsService.downloadPdf — ensure not wrongly disabled on draft with blocks; error toast on fail; data-test studio-download-pdf
   - В архив: finalize flow, disable when not draft, refresh document after success
   - Редактор|Просмотр: fetchPreview on switch; invalidate preview after block/layout/context changes
4) Optional live smoke: login admin@kppdf.local / admin123, /studio/:id, PDF blob size > 0 (evidence in .done.md)
5) Gates: tsc → nx test studio → nx build
6) Archive, QUEUE S7-5 DONE, _NOW NEXT S7-6 (+ PARK docTypeId)
7) No commit
```
