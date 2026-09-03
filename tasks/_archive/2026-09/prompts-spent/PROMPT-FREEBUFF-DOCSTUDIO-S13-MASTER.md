# PROMPT — Freebuff: Doc Studio S13 (6 TZ)

```
═══ START ═══

Continuous executor · D:\kppdf-8.0 · main

Прочитай: GEMINI.md · kppdf-executor-loop/SKILL.md · docs/PO-CANON.md

Контекст: S8–S12 DONE (HEAD 25e649a5). S13 = polish + D1/D3 + vitrina + scoped undo.

Preflight: git fetch && merge · _active/ пуст · nx build kppdf-web PASS.
WAVE: docs/agent-checklists/WAVE-DOCSTUDIO-S13.md

1→6 подряд · CLAIM → gates → archive → commit+push → next.

1. TZ-NX-DOCSTUDIO-S13-TYPOGRAPHY-PDF
   tasks/TZ-NX-DOCSTUDIO-S13-TYPOGRAPHY-PDF.md
   Gates: pnpm test -- document-render.block-style → nx build LAST

2. TZ-NX-DOCSTUDIO-S13-VITRINA-PHOTOS
   tasks/TZ-NX-DOCSTUDIO-S13-VITRINA-PHOTOS.md
   Gates: nx build LAST

3. TZ-NX-DOCSTUDIO-S13-PER-PAGE-BACKGROUND
   tasks/TZ-NX-DOCSTUDIO-S13-PER-PAGE-BACKGROUND.md
   Gates: pnpm test -- studio-multipage → nx build LAST

4. TZ-NX-DOCSTUDIO-S13-TABLE-VAT-ROW
   tasks/TZ-NX-DOCSTUDIO-S13-TABLE-VAT-ROW.md
   Gates: pnpm test -- studio-data-resolver → nx build LAST

5. TZ-NX-DOCSTUDIO-S13-UNDO-SCOPE
   tasks/TZ-NX-DOCSTUDIO-S13-UNDO-SCOPE.md
   Gates: nx test kppdf-web --testPathPattern=studio → nx build LAST
   НЕ делать three-way merge.

6. TZ-NX-DOCSTUDIO-S13-OPERATOR-DOCS
   tasks/TZ-NX-DOCSTUDIO-S13-OPERATOR-DOCS.md

CLOSEOUT: WAVE DONE · QUEUE · _NOW · одна строка PO.

═══ END ═══
```
