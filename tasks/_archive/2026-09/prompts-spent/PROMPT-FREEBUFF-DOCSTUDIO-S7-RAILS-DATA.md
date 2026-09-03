# PROMPT — Executor Doc Studio S7-RAILS-DATA

```text
Executor kppdf-8.0 · TZ-NX-DOCSTUDIO-S7-RAILS-DATA

Prerequisites: S7-WIP-CLOSEOUT DONE, build green, tasks/_active/ empty.

1) GEMINI.md + kppdf-executor-loop SKILL
2) CLAIM: copy tasks/TZ-NX-DOCSTUDIO-S7-RAILS-DATA.md → tasks/_active/, fill claim slot
3) Implement L rail «Данные» (4th item left of Elements/Layers/Properties pattern)

Reference (legacy, read-only):
- frontend/src/app/pages/doc-constructor/studio/studio-panel-data.component.ts
- frontend/src/app/pages/doc-constructor/studio/document-studio-editor.facade.ts (context PATCH)
- frontend/src/app/pages/doc-constructor/studio/studio-workspace-chrome.ts (rail item data)

NX touch:
- studio-workspace-chrome.ts — add section 'data', STUDIO_RAIL_ITEMS + Database icon
- NEW studio-data-panel.component.ts — issuer read-only, counterparty/KP/order selects
- studio-editor.page.ts — @switch case 'data', load lists, PATCH doc.context via PiStudioDocumentsService.update
- data-access: extend StudioDocument + UpdateStudioDocumentPayload with optional context Record

Backend already supports context on PATCH (UpdateStudioDocumentDto.context).

4) data-test: studio-data-panel, studio-counterparty-select, studio-quotation-select, studio-order-select
5) Gates: tsc → nx test studio → nx build kppdf-web
6) Update docs/pages/document-studio.page.md (rails row)
7) Archive .done.md, QUEUE-LIVE (S7-1 DONE), _NOW (NEXT S7-2)
8) No commit unless PO asked

Do NOT implement Template rail (S7-2).
```
