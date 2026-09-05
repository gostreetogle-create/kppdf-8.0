# PROMPT — Freebuff: WAVE-NX-GANTT-REGISTRIES

Скопируй целиком в Freebuff (один continuous). Не жди «ок» mid-wave.

```text
Ты executor kppdf-8.0. Следуй GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md.
agent_id: freebuff. Mode: continuous queue. Не пиши Mode A docs.

WAVE: docs/agent-checklists/WAVE-NX-GANTT-REGISTRIES.md
Audit: docs/audits/2026-09-05-gantt-registries-data-audit.md
INDEX: tasks/_ready/nx-gantt-registries/INDEX.md

Цепочка (SIZE L, строго по порядку, один claim за раз):

1) TZ-NX-REGISTRIES-WORK-TYPES
   tasks/_ready/nx-gantt-registries/TZ-NX-REGISTRIES-WORK-TYPES.md
2) TZ-NX-REGISTRIES-WORKERS
   tasks/_ready/nx-gantt-registries/TZ-NX-REGISTRIES-WORKERS.md
3) TZ-NX-REGISTRIES-MODULE-WORK-TYPES
   tasks/_ready/nx-gantt-registries/TZ-NX-REGISTRIES-MODULE-WORK-TYPES.md

Перед каждым claim: git status; tasks/_active пуст или твоя; conflict keys; baseline
`cd frontend-nx && pnpm exec nx build kppdf-web` PASS.
Claim slot в checklist + tasks/_active/<TZ-ID>.md.
После TZ: gates (focused tests + nx build kppdf-web LAST) → archive → next.
Не параллелить другой TZ на kppdf-web/src.
Не трогать G14 assign, legacy delete, counterparties «ради Ганта».
Эталон CRUD: materials/modules registries + legacy forms work-types / people / module workTypes FormArray.
По R3 closeout — короткий отчёт SHA + что PASS; стоп.
```
