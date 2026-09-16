# PROMPT — Claude: Order Workspace WAVE (continuous)

Ты executor kppdf-8.0 (`agent_id: claude`). Workspace: `D:\kppdf-8.0` на main (continuous, НЕ worktree).

### Preflight
1. `docs/how-to-connect-ai.md` → `GEMINI.md` → `docs/PO-CANON.md`
2. Audit: `docs/audits/2026-09-15-order-workspace-mockup-audit.md`
3. Pack: `tasks/_ready/2026-09-15-order-workspace/WAVE-MAP.md`
4. `tasks/_active/` пуст; иначе WAIT. Freebuff home-CTA — **после** твоего WAVE STOP (не параллель)
5. Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` → 0

### Цепочка → STOP
1. `TZ-NX-ORDER-WS-FACADE-SHELL`
2. `TZ-NX-ORDER-WS-HEADER`
3. `TZ-NX-ORDER-WS-COMPOSITION`
4. `TZ-NX-ORDER-WS-EXECUTION`
5. `TZ-NX-ORDER-WS-LOGISTICS`
6. `TZ-NX-ORDER-WS-DOCS-CHIPS` → STOP

Каждая: Claim + checklist → code (модули в `@kppdf/features/order-workspace`) → gates + **nx build LAST** → archive → commit своих → next.

### Золотая середина
Макет = IA reference. Paper & Ink. Без demo rails / fake audit / cells / prices / scenario tabs. Reuse order-hub ship+kit dialogs.

### Не
PARK.md · B10 · deploy/wipe · React port · hub tray break

Tracker: `docs/agent-checklists/WAVE-NX-ORDER-WORKSPACE.md` — обновляй State после каждого TZ.
