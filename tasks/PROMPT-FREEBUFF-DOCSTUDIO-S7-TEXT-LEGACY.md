# PROMPT — Executor Doc Studio S7-TEXT-LEGACY-PARITY

```text
Executor kppdf-8.0 · TZ-NX-DOCSTUDIO-S7-TEXT-LEGACY-PARITY

Prerequisites: S7-2 DONE, tasks/_active/ empty.

1) GEMINI.md + kppdf-executor-loop
2) CLAIM → tasks/_active/TZ-NX-DOCSTUDIO-S7-TEXT-LEGACY-PARITY.md
3) Extend studio-text-properties.component.ts:
   - fontFamily select: Times New Roman, Arial, Calibri → patchBlockStyle
   - lineHeight compact input (0.8–3.0) optional
   - Button «⊕ Поле…» opens data-field picker dialog (port from legacy or minimal new dialog)
4) studio-blocks-canvas: apply fontFamily + lineHeight on text block article
5) Legacy refs (read-only):
   - frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.ts
   - frontend/src/app/pages/doc-constructor/texts/data-field-picker-dialog.component.ts
   - backend template-block/font.menu.ts BLOCK_FONT_MENU
6) PiRichText SubstitutionToken for {{token}} insertion
7) Gates: tsc → nx test studio → nx build
8) Archive, QUEUE S7-3 DONE, _NOW NEXT S7-4
9) No commit

Out of scope: multi-column text layout.
Optional if trivial (<30min): docTypeId picker in studio-template-panel — only if PiDocTypes service exists in nx.
```
