# PROMPT — continuous: PO hotfix remainder (Claude)

Ты executor (`agent_id: claude`). `D:\kppdf-8.0` main · UNATTENDED.

### Preflight
1. `tasks/_active/` — если там только `TZ-NX-DOCSTUDIO-PRINT-CSS-BODY-LEAK` (Freebuff) → **можно** брать FE TZ из цепочки. Если чужой claim на тот же FE-файл — WAIT.
2. Drag DONE (`TZ-NX-DOCSTUDIO-DRAG-COORD-ROOT.done.md`) — не брать.
3. Print CSS — Freebuff; **не claim**, не ждать archive.
4. `TZ-NX-HOME-CHROME-TOP` DONE — не брать.
5. Baseline `nx build kppdf-web`
6. Pack: `tasks/_ready/2026-09-15-po-hotfix-wave/WAVE-MAP.md`

### Цепочка → STOP
0. `TZ-NX-HOME-DROP-FILLER-SUBTITLE`
1. `TZ-NX-ORDER-WS-CHROME-TOP`
2. `TZ-NX-ORDER-WS-STRIP-NAV-DUP`
3. `TZ-NX-ORDER-WS-META-INLINE`
4. `TZ-NX-ORDER-WS-PRODUCT-SELECT-ADD`
4b. `TZ-NX-ORDER-WS-COMPOSITION-DENSITY`
4c. `TZ-NX-MODULE-WORKTYPES-ROW-ALIGN`
5. `TZ-NX-COMPOSITION-TREE-TOGGLE-HIT`
6. `TZ-OPS-START-DIAGNOSTICS`

Каждая: claim → code → gates из TZ → archive → commit → next.  
Tracker: `docs/agent-checklists/WAVE-PO-HOTFIX-2026-09-15.md`  
Audit IA: `docs/audits/2026-09-15-order-workspace-ia-cleanup.md`

Не deploy. Не print-css TZ. Не новые фичи вне TZ.
