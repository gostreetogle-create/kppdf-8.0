# PROMPT — Executor Doc Studio S7-DOCTYPE-PICKER

```text
Executor kppdf-8.0 · TZ-NX-DOCSTUDIO-S7-DOCTYPE-PICKER

S7 wave COMPLETE. tasks/_active/ empty.

1) GEMINI.md + kppdf-executor-loop
2) CLAIM → tasks/_active/TZ-NX-DOCSTUDIO-S7-DOCTYPE-PICKER.md
3) Add PiDocTypesService (or extend existing) in data-access: GET /doc-types
4) studio-template-panel: select «Тип документа» bound to document.docTypeId
5) studio-editor: PATCH docTypeId with expectedRevision on change
6) Legacy ref: frontend/.../studio-panel-template.component.ts + document-studio-editor.facade onDocTypeChange
7) Save-as-template: enable when docTypeId set (hint already exists)
8) Extend UpdateStudioDocumentPayload with docTypeId if missing
9) Gates: tsc → nx test studio → nx build
10) Archive, _NOW clear ACTIVE, QUEUE note PARK done
11) No commit
```
