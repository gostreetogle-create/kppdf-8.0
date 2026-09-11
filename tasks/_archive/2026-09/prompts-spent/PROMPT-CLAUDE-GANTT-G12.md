# PROMPT — Claude: Gantt G12 (PARK — только если PO сказал «G12»)

> G11 chip CANCELLED (`WAVE-NX-GANTT-ASSIGN`). G12 park зависит от «Не назначен» UI.  
> **Не отдавай**, пока PO явно не сказал «делай G12».

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md.

STOP если PO не просил G12 в этом чате.

TZ: tasks/_backlog/nx/TZ-NX-GANTT-G12-UNASSIGNED-FILTER.md
Аудит: docs/audits/2026-09-05-gantt-orders-workers-merge-audit.md
Перед кодом: если чип/фильтр «Не назначен» отсутствует после G11 cancel — напиши мини-TZ в tasks/_ready и реализуй вместе (filter + loud unassigned label), не молчи.

Claim → FE Gantt filter «только без исполнителя» → gates nx build → archive → push.
НЕ: legacy frontend delete; BE schema; desk; deploy.
```
