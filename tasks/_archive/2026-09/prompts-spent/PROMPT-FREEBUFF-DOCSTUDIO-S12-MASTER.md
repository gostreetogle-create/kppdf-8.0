# PROMPT — Freebuff: Doc Studio S12 (6 TZ chain)

```
═══ START ═══

Continuous executor · D:\kppdf-8.0 · main · не worktree.

Прочитай: GEMINI.md · kppdf-executor-loop/SKILL.md · docs/PO-CANON.md
         docs/architecture/nx-doc-studio.md (D2, D3, D5)
         docs/pages/document-studio.page.md §7 PARK

Контекст: S8–S11 DONE (HEAD dcdc74f4). S12 = page geometry + data polish.

Preflight: git fetch && merge · _active/ пуст · nx build kppdf-web PASS.
WAVE: docs/agent-checklists/WAVE-DOCSTUDIO-S12.md

Цикл: CLAIM → код → gates → archive tasks/_archive/2026-09/ → commit+push → next БЕЗ паузы.

1. TZ-NX-DOCSTUDIO-S12-PAGE-BACKGROUND
   tasks/TZ-NX-DOCSTUDIO-S12-PAGE-BACKGROUND.md
   Gates: nx build kppdf-web LAST

2. TZ-NX-DOCSTUDIO-S12-PAGE-MARGINS
   tasks/TZ-NX-DOCSTUDIO-S12-PAGE-MARGINS.md
   Gates: backend test studio-document studio-output → nx build LAST

3. TZ-NX-DOCSTUDIO-S12-SHEET-LAYOUT-D5
   tasks/TZ-NX-DOCSTUDIO-S12-SHEET-LAYOUT-D5.md
   Gates: pnpm test -- studio-multipage → nx build LAST

4. TZ-NX-DOCSTUDIO-S12-DATA-CASCADE
   tasks/TZ-NX-DOCSTUDIO-S12-DATA-CASCADE.md
   Gates: nx test kppdf-web --testPathPattern=studio → nx build LAST

5. TZ-NX-DOCSTUDIO-S12-TABLE-TOTALS
   tasks/TZ-NX-DOCSTUDIO-S12-TABLE-TOTALS.md
   Gates: pnpm test -- studio-data-resolver → nx build LAST

6. TZ-NX-DOCSTUDIO-S12-OPERATOR-DOCS
   tasks/TZ-NX-DOCSTUDIO-S12-OPERATOR-DOCS.md
   Gates: docs-only

CLOSEOUT: WAVE DONE · QUEUE · _NOW · отчёт PO одной строкой.
Commit+push после каждой TZ. Ctrl+Z — PARK, не кодить.

═══ END ═══
```
