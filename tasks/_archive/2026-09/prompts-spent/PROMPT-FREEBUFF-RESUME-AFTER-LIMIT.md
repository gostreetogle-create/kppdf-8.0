# PROMPT — Freebuff RESUME (новый слот, лимит сгорел)

Один continuous. Экономия: не перечитывай весь репо — только пути ниже.  
Не трогай `backend/**` (G14-BE уже `73b1a09b`). Не стартуй Deals / Data IA в этом промпте.

```text
Executor · D:\kppdf-8.0 · agent_id: freebuff · GEMINI.md + kppdf-executor-loop
Не Mode A. Continuous. Один claim → gates → archive → next.

═══ ФАКТ (не спорь) ═══
DONE: polish P1–P4 (G8,G9,S43). Gantt L0. G14-BE SHA 73b1a09b.
WIP: G10 код уже в working tree (facade firstPhotoUrl + rail/gantt thumbs + specs),
     НО нет archive, файл ещё в tasks/_active/TZ-NX-GANTT-G10-PHOTO-THUMBS.md,
     изменения production/** скорее всего не закоммичены.
НЕ начато: WAVE-NX-GANTT-REGISTRIES, WAVE-S, Deals, Data IA.

═══ ЦЕПОЧКА ═══

0) G10 CLOSEOUT
   - Сверь AC: tasks/_ready/nx-gantt/TZ-NX-GANTT-G10-PHOTO-THUMBS.md (или _active копия)
   - Добей дыры если есть; LAST: cd frontend-nx && pnpm exec nx build kppdf-web
   - Commit push · archive tasks/_archive/2026-09/TZ-NX-GANTT-G10-PHOTO-THUMBS.done.md
   - Удали tasks/_active/TZ-NX-GANTT-G10-PHOTO-THUMBS.md
   - Отметь WAVE-NX-GANTT-POLISH P5 [x]
   - В отчёте одной строкой: «G10 ARCHIVED — production briefly free»

1) WAVE-NX-GANTT-REGISTRIES (L×3)
   docs/agent-checklists/WAVE-NX-GANTT-REGISTRIES.md
   tasks/_ready/nx-gantt-registries/INDEX.md
   R1 TZ-NX-REGISTRIES-WORK-TYPES
   R2 TZ-NX-REGISTRIES-WORKERS
   R3 TZ-NX-REGISTRIES-MODULE-WORK-TYPES
   (промпт-детали внутри каждого TZ; эталон materials CRUD)

2) WAVE-S-UX-POLISH (S×2)
   docs/agent-checklists/WAVE-S-UX-POLISH.md
   S: TZ-NX-GANTT-G15-LEGEND-FOOTER (tasks/_ready/nx-gantt/)
   S: TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE (tasks/_ready/)

═══ СТОП ═══
После WAVE-S — короткий отчёт: SHA по TZ + «FREEBUFF WAVE A DONE».
Не начинай Deals / Data IA / G14-FE (это Claude после тебя).
Не параллель с другим агентом на frontend-nx/apps/kppdf-web.
```
