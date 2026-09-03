# PROMPT — Freebuff: Doc Studio S14 (6 TZ)

```
═══ START ═══

Continuous executor · D:\kppdf-8.0 · main

Прочитай: GEMINI.md · kppdf-executor-loop/SKILL.md · docs/PO-CANON.md

Контекст: S8–S13 DONE (HEAD 2546bf88). S14 = list UX + finalize + floating typo + conflict detail.

Preflight: git fetch && merge · _active/ пуст · nx build kppdf-web PASS.
WAVE: docs/agent-checklists/WAVE-DOCSTUDIO-S14.md

1→6 подряд · CLAIM → gates → archive → commit+push → next.

1. TZ-NX-DOCSTUDIO-S14-STUDIO-LIST-FILTER
   tasks/TZ-NX-DOCSTUDIO-S14-STUDIO-LIST-FILTER.md
   Gates: nx build LAST

2. TZ-NX-DOCSTUDIO-S14-FINALIZE-RESULT
   tasks/TZ-NX-DOCSTUDIO-S14-FINALIZE-RESULT.md
   Gates: nx test studio → nx build LAST

3. TZ-NX-DOCSTUDIO-S14-FLOATING-TYPO-TOOLBAR
   tasks/TZ-NX-DOCSTUDIO-S14-FLOATING-TYPO-TOOLBAR.md
   Gates: nx build LAST

4. TZ-NX-DOCSTUDIO-S14-CONFLICT-DETAIL
   tasks/TZ-NX-DOCSTUDIO-S14-CONFLICT-DETAIL.md
   Gates: nx test studio → nx build LAST

5. TZ-NX-DOCSTUDIO-S14-TABLE-FORMAT
   tasks/TZ-NX-DOCSTUDIO-S14-TABLE-FORMAT.md
   Gates: pnpm test -- studio-data-resolver → nx build LAST

6. TZ-NX-DOCSTUDIO-S14-OPERATOR-DOCS
   tasks/TZ-NX-DOCSTUDIO-S14-OPERATOR-DOCS.md

CLOSEOUT: WAVE DONE · QUEUE · _NOW.
Three-way merge — PARK, не кодить.

═══ END ═══
```
