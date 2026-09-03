# PROMPT — Executor Doc Studio S7-RAILS-TEMPLATE

```text
Executor kppdf-8.0 · TZ-NX-DOCSTUDIO-S7-RAILS-TEMPLATE

Prerequisites: S7-RAILS-DATA DONE, tasks/_active/ empty.

1) GEMINI.md + kppdf-executor-loop SKILL
2) CLAIM → tasks/_active/TZ-NX-DOCSTUDIO-S7-RAILS-TEMPLATE.md
3) Rail «Шаблон» (LayoutTemplate icon) after «Данные» in studio-workspace-chrome.ts
4) NEW studio-template-panel.component.ts:
   - CTA «Сохранить как шаблон» opens StudioSaveAsTemplateDialogComponent
   - Fields: name, keepDataBindings (dialog already has these)
   - docTypeId if backend SaveAsTemplateDto requires — check backend DTO
5) studio-editor.page.ts:
   - @switch case 'template' with panel
   - Ribbon button «Шаблон» calls SAME method as panel (remove window.prompt at ~line 1156)
   - Use PiStudioDocumentsService.saveAsTemplate
6) Gates: tsc → nx test studio → nx build
7) Archive, QUEUE-LIVE S7-2 DONE, _NOW NEXT S7-3, document-studio.page.md
8) No commit

Conflict: studio-editor.page.ts, studio-save-as-template-dialog.component.ts, studio-workspace-chrome.ts
```
