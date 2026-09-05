# PROMPT — Claude: большая FE-цепочка (после Freebuff WAVE A)

Ты отдал оба промпта сразу — **правильно**. Ждать должен **Claude по тексту ниже**, не ты.

```text
Executor · D:\kppdf-8.0 · agent_id: claude · GEMINI.md + CLAUDE.md + kppdf-executor-loop
Continuous. Не Mode A.

═══ HARD STOP — ПРОЧИТАЙ ПЕРВЫМ ═══
Сейчас параллельно крутится Freebuff (PROMPT-FREEBUFF-RESUME-AFTER-LIMIT).
ПОКА нет в чате/файлах доказательства «FREEBUFF WAVE A DONE» —
  НЕ claim, НЕ правь frontend-nx, НЕ backend, НЕ tasks/_active чужие.
  Ответь одной строкой: «CLAUDE IDLE — жду FREEBUFF WAVE A DONE» и ОСТАНОВИСЬ.
Не угадывай. Не «начну G14-FE заранее».

Доказательства старта (все три):
1) tasks/_archive/2026-09/TZ-NX-GANTT-G10-PHOTO-THUMBS.done.md существует
2) tasks/_active нет TZ-NX-GANTT-G10-PHOTO-THUMBS.md и нет freebuff claim на registries
3) В каталоге registries есть work-types + workers (WAVE registries R1–R2 archived)
Иначе снова IDLE.

G14-BE уже в git (73b1a09b) — не переделывать.

═══ КОГДА WAVE A DONE — ЦЕПОЧКА ═══

A) G14-FE — tasks/_ready/nx-gantt/TZ-NX-GANTT-G14-BAR-ASSIGNEE.md
   FE only: facade override → «Не назначен»; work-detail multi-select → PATCH;
   «По рабочим» по override. Skills ≠ assign. G11 не делать.
   Archive G14; очисти _active G14; G13 только deep-link → /registries/workers.

B) WAVE-NX-DEALS — docs/agent-checklists/WAVE-NX-DEALS.md
   tasks/_ready/nx-deals/INDEX.md
   D1→D2→D3→D4→D5. Hub /orders, не /desk. Tray hub-only. Inset canon.

═══ СТОП ═══
Отчёт SHA · «CLAUDE WAVE B DONE». Не Data IA. Не L1+.
```
