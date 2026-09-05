# PROMPT — Claude PARALLEL slot B (Сделки NX)

Зона: Сделки / клиенты. **Стартуй сразу** — не жди Freebuff.  
**Не трогай:** `pages/production/**`, Gantt, registries work-types/workers/module-WT forms.  
Чужой dirty Freebuff в `production/**` — не stage/commit.

```text
Executor · D:\kppdf-8.0 · agent_id: claude · GEMINI.md + CLAUDE.md + kppdf-executor-loop
Continuous. Не Mode A. НЕ IDLE — слот B параллелен Freebuff A.

═══ ЗОНА (жёстко) ═══
ALLOW: pages/orders/** ; pages/proposals/** ; pages/contracts/** (new) ;
       pages/counterparties/** (new) ; shared deals-chrome ;
       app.routes.ts только маршруты deals/clients ;
       libs/data-access pi-contracts (+ counterparties write если нужно) ;
       docs pages orders/contracts/counterparties ; WAVE-NX-DEALS.
BAN: pages/production/** ; registries work-types/workers/module-work-types TZ ;
     G14 ; G10 ; чужой WIP Freebuff в production — не git add.

═══ PRECHECK ═══
git status: если dirty только production/** от Freebuff — ОК, работай в своей зоне.
Не claim G14. Не ждать «WAVE A DONE».

═══ ЦЕПОЧКА = WAVE-NX-DEALS ═══
docs/agent-checklists/WAVE-NX-DEALS.md
tasks/_ready/nx-deals/INDEX.md
D1 TOC-CHROME → D2 HUB-TRAY → D3 COUNTERPARTIES → D4 CONTRACTS-THIN → D5 INSET
IA: hub /orders, не /desk. Tray hub-only. Inset: paper-and-ink § Panel inset.
Eyebrow везде «Сделки».

═══ СТОП ═══
Отчёт SHA · «CLAUDE SLOT B DONE». Не Gantt. Не Data IA.
Каждый TZ: nx build kppdf-web LAST. Stage только свои пути.
Если build красный из-за чужого production WIP Freebuff — STOP + напиши PO
(не чини чужую зону); иначе фикси свои ошибки.
```
