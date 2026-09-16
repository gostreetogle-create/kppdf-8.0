# PROMPT — Claude: VERIFY+FIX Order Workspace до green

Ты executor kppdf-8.0 (`agent_id: claude`). Workspace: `D:\kppdf-8.0` на main (continuous, НЕ worktree).

### UNATTENDED
PO потом только глазами. Твоя задача: **прогнать всё → починить всё в scope → green → STOP**.  
Не deploy. Не wipe. Не ждать «ок» mid-run.

### Startup
1. `docs/how-to-connect-ai.md` → `GEMINI.md` → `docs/PO-CANON.md`
2. `tasks/_active/` пуст; иначе WAIT
3. Claim: `tasks/_ready/TZ-VERIFY-FIX-2026-09-15-ORDER-WORKSPACE.md` + checklist Claim slot
4. Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web`

### Делай по TZ (полностью)
- SHA/archives Order Workspace 6/6 + home CTA `6f0eeb79`
- Focused tests order-detail / home / order-workspace / order-hub / pi-orders → **fix until PASS**
- Full `nx build kppdf-web` LAST
- BE order tsc/tests + `pnpm architecture:check`
- Live smoke `/home`→edit→`/orders/:id` если API доступен; иначе WARN среда
- Audit `docs/audits/2026-09-15-order-workspace-verify.md` → VERIFY PASS
- Archive + commit (свои фиксы + docs) → `_active` empty → **STOP**

### Scope only
`order-workspace/**`, `order-detail/**`, `home/**` (CTA), `order-hub` reuse, `pi-orders.service` wrappers.  
Чужой WIP не коммитить. PARK / deploy / новые фичи — нет.

### Отчёт PO
Таблица area | PASS/FAIL/WARN | evidence.  
Одной строкой: можно смотреть глазами `/orders/:id` — да/нет.
