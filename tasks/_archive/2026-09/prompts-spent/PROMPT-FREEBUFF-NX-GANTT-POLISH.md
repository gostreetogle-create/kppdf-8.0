# PROMPT — Freebuff: NX Gantt polish continuous (MASTER)

Скопируй блок ниже агенту **Freebuff**.

```
═══ START ═══

Continuous executor · D:\kppdf-8.0 · main · agent_id: freebuff (или Buffy)

Прочитай: GEMINI.md · .agents/skills/kppdf-executor-loop/SKILL.md · docs/PO-CANON.md

WAVE-CHECKLIST (SoT прогресса — открыть ПЕРВЫМ):
  docs/agent-checklists/WAVE-NX-GANTT-POLISH.md

INDEX TZ: tasks/_ready/nx-gantt/INDEX.md

Начни с ПЕРВОЙ строки chain где [ ] (не [x]). Пропускай уже [x].

═══ ЖЁСТКО: НЕ ОСТАНАВЛИВАТЬСЯ ═══

ЗАПРЕЩЕНО завершать turn после одной TZ.
После archive+commit+push — СРАЗУ claim следующей [ ] из WAVE. Без паузы. Без вопроса PO.

Единственные STOP:
  (a) P1–P5 все [x]
  (b) blocker без обхода (напиши blocker + что пробовал)
  (c) чужой tasks/_active пересекает conflict keys

═══ ЦИКЛ ═══

CLAIM (TZ → tasks/_active/ + checklist Claim slot) →
код по TZ → gates → archive .done.md → commit/push по GIT-POLICY →
отметить [x] в WAVE → СЛЕДУЮЩАЯ

Gates каждой TZ: LAST = cd frontend-nx && pnpm exec nx build kppdf-web

═══ ПОРЯДОК ═══

 P1 SKIP if already [x] in WAVE (catalog-spec DONE) — start at first [ ]
 P2 tasks/_ready/nx-gantt/TZ-NX-GANTT-G8-CALENDAR-WASH.md
 P3 tasks/_ready/TZ-NX-GANTT-G9-RANGE-REFIT-FORWARD.md
 P4 tasks/_ready/TZ-NX-DOCSTUDIO-S43-VITRINA-TITLE-WRAP.md
 P5 tasks/_ready/nx-gantt/TZ-NX-GANTT-G10-PHOTO-THUMBS.md

P6 НЕТ. Не удалять frontend/production. STOP после P5 → отчёт PO.

═══ ЗАПРЕТЫ ═══

- Не трогай backend Order org-scope (это Claude)
- Не L1+ Ганта, не contracts/Invoice, не wipe/deploy
- Не invent новых экранов вне TZ

═══ ФИНАЛ ═══

WAVE P1–P5 все [x] · _active пуст · _NOW обновить · push · краткий отчёт PO

═══ END ═══
```
