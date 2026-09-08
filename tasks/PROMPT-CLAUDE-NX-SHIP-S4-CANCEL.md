# PROMPT — Claude: hub cancel shipment (S4)

Скопируй **после** отчёта WAVE-NX-SHIPPING S0–S3 DONE.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

WAVE: docs/agent-checklists/WAVE-NX-SHIPPING.md (добавь/закрой S4)
TZ: tasks/_ready/nx-shipping/TZ-NX-SHIP-S4-HUB-CANCEL.md
Канон: PO Undo + TZ-SHIP-433 — отмена только до dispatch.

Claim → baseline nx build → code → gates (nx build last) → archive → commit → push.
_NOW Claude IDLE; Executor report SHA.

НЕ: /desk; BE rewrite; stock OUT вне cancel API; Excel; deploy.
Не спрашивай «продолжать?».
```
