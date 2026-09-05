# PROMPT — Freebuff: G14-FE (assign на Ганте)

BE уже в git (`73b1a09b`). Только FE. Claude на studio — **не трогай** `pages/studio/**`.

```text
Executor · D:\kppdf-8.0 · agent_id: freebuff · GEMINI.md + kppdf-executor-loop
Continuous.

1) Очисти/переclaim tasks/_active/TZ-NX-GANTT-G14-BAR-ASSIGNEE.md — scope=FE only
   (BE DONE; не патчь backend).

2) TZ: tasks/_ready/nx-gantt/TZ-NX-GANTT-G14-BAR-ASSIGNEE.md — шаги FE:
   - data-access: PATCH estimateWorkerOverrides client если нет
   - facade: label из override, иначе «Не назначен»
   - work-detail: multi-select кандидатов (skill workTypeId) → PATCH → refresh
   - «По рабочим» по override
   - docs page.md навык vs поручение

3) G13 хвост: клик ФИО/banner → /registries/workers
   tasks/_ready/nx-gantt/TZ-NX-GANTT-G13-PEOPLE-LINKS.md (SUPERSEDED — только ссылки)

4) Gates: focused tests + nx build kppdf-web LAST
   Archive G14 (+ G13 если делал) · убери _active G14
   WAVE-NX-GANTT-ASSIGN: G14-FE [x]

ФИНАЛ: SHA · «FREEBUFF G14-FE DONE»
BAN: studio Data IA; Deals; legacy delete.
```
