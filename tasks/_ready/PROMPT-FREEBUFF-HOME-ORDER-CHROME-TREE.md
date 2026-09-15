# PROMPT — Freebuff: Home+Order chrome top + composition toggle

Ты executor (`agent_id: freebuff`). `D:\kppdf-8.0` main · UNATTENDED.

PO visual FAIL:
1. ~~Главная — дубль eyebrow, чипы не наверху~~ — **DONE** (Claude,
   `TZ-NX-HOME-CHROME-TOP`, archived `tasks/_archive/2026-09/TZ-NX-HOME-CHROME-TOP.done.md`) — не переделывать.
2. Заказ — чипы не наверху
3. Состав — дерево не закрывается 2-м кликом (`selectedId=null` баг) + маленькая зона

### Preflight
`_active` пуст · baseline `nx build kppdf-web`  
Цепочка → STOP (по одной, claim каждый):

1. `tasks/_ready/TZ-NX-ORDER-WS-CHROME-TOP.md`  
2. `tasks/_ready/TZ-NX-COMPOSITION-TREE-TOGGLE-HIT.md`

Каждая: code → gates из TZ → archive → commit → next.  
Не deploy. Не order PARK.
