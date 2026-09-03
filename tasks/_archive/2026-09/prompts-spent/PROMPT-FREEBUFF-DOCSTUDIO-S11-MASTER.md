# PROMPT — Freebuff: Doc Studio S11 (RESUME TZ1 fix)

```
═══ START ═══

Continuous executor · D:\kppdf-8.0 · main

Прочитай: GEMINI.md · kppdf-executor-loop/SKILL.md
         tasks/TZ-NX-DOCSTUDIO-S11-SELECT-LABELS.md  ← ОБНОВЛЁН fix
         docs/agent-checklists/WAVE-DOCSTUDIO-S11.md
         tasks/_active/TZ-NX-DOCSTUDIO-S11-SELECT-LABELS.md  ← CLAIM уже есть, продолжай

BLOCKER TZ1 (разрешён в spec):
  @if(open) уничтожал options → viewChildren пуст когда closed.
  FIX: listbox always mounted [hidden]=!open; option register/unregister map; update select specs.

1. Доделай TZ1 по обновлённому spec → archive → commit+push
2. TZ2→6 без паузы (tasks/TZ-NX-DOCSTUDIO-S11-*.md + PROMPT master chain)

Gates TZ1: nx test paper-and-ink --testPathPattern=select → nx build kppdf-web LAST
Не archive пока select test красный.

═══ END ═══
```
