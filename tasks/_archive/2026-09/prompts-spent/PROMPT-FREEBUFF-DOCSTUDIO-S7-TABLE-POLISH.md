# PROMPT — Executor Doc Studio S7-TABLE-POLISH

```text
Executor kppdf-8.0 · TZ-NX-DOCSTUDIO-S7-TABLE-POLISH

Prerequisites: S7-3 DONE, tasks/_active/ empty.

1) GEMINI.md + kppdf-executor-loop
2) CLAIM → tasks/_active/TZ-NX-DOCSTUDIO-S7-TABLE-POLISH.md
3) studio-table-editor / studio-table-properties:
   - Column editor: add/remove/reorder, width, align, label (mirror TableTemplateFormDialog patterns)
   - Persist via patchTableSettings → tableTemplateColumns
4) Save table template: include category from TABLE_TEMPLATE_CATEGORIES in dialog or inline select before save
5) Fix table-templates FormArray @for reconcile TypeError if still reproduces (registries dialog)
6) Gates: tsc → nx test studio → nx build
7) Archive, QUEUE S7-4 DONE, _NOW NEXT S7-5 (+ PARK docTypeId picker)
8) No commit

Refs: frontend-nx/.../table-template-form-dialog.component.ts, studio-table-defaults.ts
```
