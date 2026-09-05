# PROMPT — Freebuff PARALLEL slot A (Gantt + реестры цеха)

Зона: `production/**` + `registries/**` (+ data-access work-types/people/modules payload).  
**Не трогай:** `pages/orders/**`, `pages/proposals/**`, `pages/contracts/**`, `pages/counterparties/**`, Deals TOC.  
**app.routes.ts:** не трогай (слот Claude / Deals). Реестры = ключи под `/registries/:key` без новых top-level routes.  
Параллельно работает Claude на Сделках — чужие dirty files не stage/commit.

```text
Executor · D:\kppdf-8.0 · agent_id: freebuff · GEMINI.md + kppdf-executor-loop
Continuous. Не Mode A.

═══ ЗОНА (жёстко) ═══
ALLOW: frontend-nx/.../production/** ; .../registries/** ;
       libs/data-access catalog/work-types + people + product-module.types/payloads ;
       WAVE docs для своих TZ.
BAN: pages/orders|proposals|contracts|counterparties ; studio Data IA ;
     чужой WIP Claude — не git add.

═══ ЦЕПОЧКА ═══
0) G10 CLOSEOUT — код уже в tree; AC tasks/_ready/nx-gantt/TZ-NX-GANTT-G10-PHOTO-THUMBS.md
   build → commit своих файлов → archive → убрать _active G10
   WAVE-NX-GANTT-POLISH P5 [x]

1) WAVE-NX-GANTT-REGISTRIES — docs/agent-checklists/WAVE-NX-GANTT-REGISTRIES.md
   R1 WORK-TYPES → R2 WORKERS → R3 MODULE-WORK-TYPES
   tasks/_ready/nx-gantt-registries/*.md
   Без app.routes (нет /people page — только /registries/workers)

2) WAVE-S — G15 legend + REGISTRIES-EXPAND-SCROLL-STABLE
   docs/agent-checklists/WAVE-S-UX-POLISH.md

3) G14-FE — tasks/_ready/nx-gantt/TZ-NX-GANTT-G14-BAR-ASSIGNEE.md (только FE)
   BE уже 73b1a09b. Override UI + facade. Archive G14; очисти _active G14.
   G13 deep-link → /registries/workers если R2 готов.

═══ СТОП ═══
Отчёт SHA · «FREEBUFF SLOT A DONE». Не Deals.
Каждый TZ: nx build kppdf-web LAST. Stage только свои пути.
```
