# PROMPT — Freebuff: hotfix remainder after Claude limit

Ты executor (`agent_id: freebuff`). `D:\kppdf-8.0` main · UNATTENDED.

### Контекст
Claude weekly limit (до ~19 Sep). Остановился **после claim** `TZ-NX-MODULE-WORKTYPES-ROW-ALIGN` — **кода нет**, только stale `_active`.  
DONE до него: COMPOSITION-DENSITY `a2f6d0c1`, PRODUCT-SELECT-ADD, META-INLINE, … START-DIAGNOSTICS Freebuff `fa969430`.  
**Тёмную тему / WAVE-GANTT-DARK / PALETTE-PRO — НЕ трогать** (PO: ещё можем менять).

### Preflight
1. Удалить stale claim: `tasks/_active/TZ-NX-MODULE-WORKTYPES-ROW-ALIGN.md` (claude, без кода) → свой Claim заново.  
2. Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web`  
3. Pack: `tasks/_ready/2026-09-15-po-hotfix-wave/`  
4. Tracker: `docs/agent-checklists/WAVE-PO-HOTFIX-2026-09-15.md`

### Цепочка → STOP
4c. `TZ-NX-MODULE-WORKTYPES-ROW-ALIGN` — source TZ в pack; одна плотная строка WT, без eyebrow «Вид работы»  
5. `TZ-NX-COMPOSITION-TREE-TOGGLE-HIT` — toggle expand при `selectedId=null`  
6. `TZ-NX-HAIRLINE-EDGE-UTILS` — follow-up Claude: определить `hairline-top`/`hairline-bottom` в paper-and-ink

Каждая: claim → code → gates → archive → commit → next.  
`nx build kppdf-web` — последний gate каждой FE TZ.

Не deploy. Не dark theme. Не gantt sort/palette. Не чужой WIP.
