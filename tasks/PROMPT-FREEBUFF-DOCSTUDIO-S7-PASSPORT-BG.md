# PROMPT — Executor Doc Studio S7-PASSPORT-BG

```text
Executor kppdf-8.0 · TZ-NX-DOCSTUDIO-S7-PASSPORT-BG

Prerequisites: S7-5 DONE, tasks/_active/ empty.

1) GEMINI.md + kppdf-executor-loop
2) CLAIM → tasks/_active/TZ-NX-DOCSTUDIO-S7-PASSPORT-BG.md
3) Background image under blocks on canvas:
   - Image blocks with settings.overlay=true render as full-sheet background (z-index 0, pointer-events none)
   - Other blocks z-index > 0 remain editable
   - «На весь лист» already sets overlay — wire canvas rendering
4) Optional: document.backgroundImage[] if schema supports — check StudioDocument type + backend
5) Preview/PDF stacking should match (read document-render doc-bg CSS)
6) Gates: tsc → nx test studio → nx build
7) Archive, QUEUE S7 wave COMPLETE, _NOW update, WAVE-DOCSTUDIO-S7.md status
8) No commit

Refs: studio-editor setImageFullPage, legacy wave 17 letterhead, backend document-render .doc-bg
```
