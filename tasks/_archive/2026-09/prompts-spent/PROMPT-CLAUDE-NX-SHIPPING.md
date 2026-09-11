# PROMPT — Claude continuous: WAVE-NX-SHIPPING

Скопируй целиком. Freebuff PARK — только claude.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

WAVE: docs/agent-checklists/WAVE-NX-SHIPPING.md
Аудит: docs/audits/2026-09-08-shipping-nx-port-audit.md
Эталон: docs/pages/shipping.page.md + legacy frontend/.../shipping/shipping.page.ts
PO lock: списание только dispatch; отмена до dispatch на /shipping; документ опц.; hub ship = whole-order POST /orders/:id/ship; /desk не в волне.

═══ ОЧЕРЕДЬ ═══
1) tasks/_ready/nx-shipping/TZ-NX-SHIP-S0-DATA-ACCESS.md
2) tasks/_ready/nx-shipping/TZ-NX-SHIP-S1-REGISTRY.md
3) tasks/_ready/nx-shipping/TZ-NX-SHIP-S2-HUB-READ.md
4) tasks/_ready/nx-shipping/TZ-NX-SHIP-S3-HUB-SHIP.md

Цикл на каждый: Claim → baseline nx build → code → gates TZ (вкл. nx build kppdf-web последним) → archive tasks/_archive/2026-09/ → commit → push → next.
После 4: WAVE DONE, _NOW Claude IDLE, Executor report со всеми SHA.

НЕ: /desk; Freebuff; dropDatabase; deploy без PO; Excel; BE rewrite; паузы; чужой WIP.
Не спрашивай «продолжать?».
```
