# PROMPT — Freebuff: NX Gantt L0 continuous (MASTER)

```
═══ START ═══

Continuous executor · D:\kppdf-8.0 · main

Прочитай: GEMINI.md · .agents/skills/kppdf-executor-loop/SKILL.md · docs/PO-CANON.md

WAVE-CHECKLIST (SoT прогресса — открыть ПЕРВЫМ):
  docs/agent-checklists/WAVE-NX-PRODUCTION-GANTT.md

Начни с ПЕРВОЙ строки chain где [ ] (не [x]). Пропускай уже [x].

Эталон UI: docs/ux/production-gantt-studio-spec.md
Эталон page: docs/pages/production-cockpit.page.md
Legacy код (читать, не рерайтить in-place): frontend/src/app/pages/production/**

═══ ЖЁСТКО: НЕ ОСТАНАВЛИВАТЬСЯ ═══

ЗАПРЕЩЕНО завершать turn / «готово к продолжению» после одной TZ.
После archive+commit+push — СРАЗУ claim следующей [ ] из WAVE. Без паузы. Без вопроса PO.

Единственные STOP:
  (a) G0–G7 все [x] и Closeout [x]
  (b) blocker без обхода (напиши blocker + что пробовал)
  (c) чужой tasks/_active пересекает conflict keys / nx build

Если контекст переполнен: /clear → RESUME:
  tasks/PROMPT-FREEBUFF-NX-GANTT-RESUME.md

═══ ЦИКЛ ═══

CLAIM (TZ → tasks/_active/ + checklist Claim slot agent_id) →
код/docs по TZ → gates → archive .done.md → commit/push по GIT-POLICY →
отметить [x] в WAVE → СЛЕДУЮЩАЯ

Gates каждой TZ с FE-кодом: LAST = cd frontend-nx && pnpm exec nx build kppdf-web

═══ ПОРЯДОК ═══

 0. G0 PORT-AUDIT     tasks/_ready/nx-gantt/TZ-NX-GANTT-G0-PORT-AUDIT.md
 1. G1 SHELL-ROUTE    tasks/_ready/nx-gantt/TZ-NX-GANTT-G1-SHELL-ROUTE.md
 2. G2 READ-MODEL     tasks/_ready/nx-gantt/TZ-NX-GANTT-G2-READ-MODEL.md
 3. G3 TREE-CASCADE   tasks/_ready/nx-gantt/TZ-NX-GANTT-G3-TREE-CASCADE.md
 4. G4 PAN-ZOOM-FIX   tasks/_ready/nx-gantt/TZ-NX-GANTT-G4-PAN-ZOOM-FIX.md
 5. G5 WRITE-PATH     tasks/_ready/nx-gantt/TZ-NX-GANTT-G5-WRITE-PATH.md
 6. G6 WORKERS-VIEW   tasks/_ready/nx-gantt/TZ-NX-GANTT-G6-WORKERS-VIEW.md
 7. G7 SMOKE-DOCS     tasks/_ready/nx-gantt/TZ-NX-GANTT-G7-SMOKE-DOCS.md

═══ ЗАПРЕТЫ ═══

- Doc Studio / S37 / studio-editor
- L1–L6 (уведомления, design-gate, авто-сварщик, табель %)
- Перерисовка визуала с нуля; bottom «Карточка»
- Wipe / deploy / ломающие schema Order

═══ ФИНАЛ ═══

WAVE Closeout [x] · _active пуст · _NOW/QUEUE · push · краткий отчёт PO: /production работает

═══ END ═══
```
