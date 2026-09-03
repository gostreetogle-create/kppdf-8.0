# PROMPT — Freebuff: Doc Studio S9 FINISH (3 TZ, один агент)

> Скопируй блок `═══ START` … `═══ END` в новый чат Freebuff.

```
═══ START ═══

Continuous executor · D:\kppdf-8.0 · main · не worktree.

Прочитай: GEMINI.md · kppdf-executor-loop/SKILL.md · docs/PO-CANON.md
         docs/pages/document-studio.page.md · docs/architecture/document-studio-data-anchors.md

Контекст: S8 полностью DONE (commits 96d08634…11bb0a7e).
S9 закрыли преждевременно — archives с known_limitation БЕЗ кода:
  - S9-ANCHORS — не реализован
  - S9-VITRINA — UI shell only (48b0d894), resolver catalog-* нет
  - S9-BINDINGS — dblclick opens panel only (d981c08b), focus/picker нет

НЕ переделывай S8. НЕ archive с known_limitation вместо AC.

────────────────────────────────────────
ШАГ 0
────────────────────────────────────────
Создай docs/agent-checklists/WAVE-DOCSTUDIO-S9-FINISH.md (IN_PROGRESS).
Preflight: git fetch && merge origin/main · _active/ пуст · nx build kppdf-web PASS.

Цикл на каждую TZ: CLAIM → код → gates → archive tasks/_archive/2026-09/ → commit+push → следующая.

────────────────────────────────────────
1. TZ-NX-DOCSTUDIO-S9A-ANCHORS-FINISH
────────────────────────────────────────
Spec: tasks/TZ-NX-DOCSTUDIO-S9A-ANCHORS-FINISH.md
anchors + dual-read counterpartyId + «Выбрано» + PiSelect labels + substitution {{anchor.client.*}}
Gates: backend test studio-output studio-document → nx build kppdf-web LAST

────────────────────────────────────────
2. TZ-NX-DOCSTUDIO-S9B-CATALOG-RESOLVER-SYNC
────────────────────────────────────────
Spec: tasks/TZ-NX-DOCSTUDIO-S9B-CATALOG-RESOLVER-SYNC.md
Backend catalog-* resolver + vitrina toggle → table rows sync + catalog chips
Gates: backend test studio-data-resolver → nx build kppdf-web LAST

────────────────────────────────────────
3. TZ-NX-DOCSTUDIO-S9C-BINDINGS-FINISH
────────────────────────────────────────
Spec: tasks/TZ-NX-DOCSTUDIO-S9C-BINDINGS-FINISH.md
Dblclick → focus rich-text + anchor groups in token picker
Gates: nx test kppdf-web --testPathPattern=studio → nx build kppdf-web LAST

CLOSEOUT: WAVE DONE · QUEUE-LIVE · _NOW.md · отчёт PO одной строкой.

Commit после каждой TZ. Push после commit. Не stage чужой WIP.

═══ END ═══
```
