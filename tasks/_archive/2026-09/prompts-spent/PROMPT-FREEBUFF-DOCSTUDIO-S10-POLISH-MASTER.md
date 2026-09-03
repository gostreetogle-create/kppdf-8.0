# PROMPT — Freebuff: Doc Studio S10 POLISH (2 TZ)

```
═══ START ═══

Continuous executor · D:\kppdf-8.0 · main · не worktree.

Прочитай: GEMINI.md · kppdf-executor-loop/SKILL.md · docs/PO-CANON.md

Контекст: S8+S9-FINISH DONE (commits до 30b3eede). Остались дыры S9A/B из оригинального AC — см. TZ S10.

Preflight: git fetch && merge · _active/ пуст · nx build kppdf-web PASS.
WAVE: docs/agent-checklists/WAVE-DOCSTUDIO-S10-POLISH.md

Цикл: CLAIM → код → gates → archive tasks/_archive/2026-09/ → commit+push → next.

1. TZ-NX-DOCSTUDIO-S10-DATA-PANEL-POLISH
   Spec: tasks/TZ-NX-DOCSTUDIO-S10-DATA-PANEL-POLISH.md
   payer/supplier pickers · PiSelect labels · cascade КП→client · catalog chips+remove
   Gates: backend test studio-output → nx build kppdf-web LAST

2. TZ-NX-DOCSTUDIO-S10-OPERATOR-DOCS-SYNC
   Spec: tasks/TZ-NX-DOCSTUDIO-S10-OPERATOR-DOCS-SYNC.md
   document-studio.page.md §7 + QUEUE/_NOW sync
   Gates: docs only — nx build kppdf-web smoke if touched imports (optional)

CLOSEOUT: WAVE DONE · отчёт PO одной строкой.
Commit+push после каждой TZ. Не stage чужой WIP.

═══ END ═══
```
