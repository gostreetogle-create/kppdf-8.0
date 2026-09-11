# PROMPT — Freebuff: NX Orders hub tray inset (Paper & Ink)

Скопируй агенту целиком. One-shot. PO AFK — не спрашивать «продолжать?».

---

UNATTENDED (hard):
- Не спрашивать «ок?», «продолжать?», «commit?». STOP только wipe/deploy/secrets/чужой active.
- Канон: `docs/agents/CLAUDE-UNATTENDED.md` дух + `kppdf-executor-loop`.

[КОНТЕКСТ]
Workspace `D:\kppdf-8.0` · `agent_id: freebuff`  
`GEMINI.md` + `.agents/skills/kppdf-executor-loop/SKILL.md`  
TZ: `tasks/_ready/TZ-NX-DEALS-ORDERS-HUB-TRAY-INSET.md`  
Канон UI: `docs/paper-and-ink.md` § Panel & expand inset · `docs/UX-FORM-CANON.md` Panel inset · `docs/pages/orders.page.md` § Визуальная иерархия / DESK-428  
Скрин PO: expand ORD — текст к рамке, плитки слиплись.

[ШАГИ]
CLAIM первым:
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-NX-DEALS-ORDERS-HUB-TRAY-INSET.md + checklist `_TEMPLATE.md`
3) agent_id freebuff + claimed_at ISO; чужой kppdf-web active = STOP
4) Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web`

Затем выполни TZ:
- gap-5 + p-4 tray; убрать `-mx-2` на composition toggle
- подблоки Снабжение/Производство/Готовность/Склад/Отгрузка = отдельные inset плитки (`bg-paper-2 p-3`, gap-3)
- не трогать write-path / desk / API
- specs + page.md строка
- gates: test order-hub-tray → lint → **nx build last**
- Executor report (auto) full SHA → archive → `_NOW.md` IDLE

В чат Cursor: `freebuff executor DONE. Look: docs/agent-checklists/TZ-NX-DEALS-ORDERS-HUB-TRAY-INSET.md`

[НЕ]
Backend; legacy `frontend/` dual patch; proposals/contracts; усиление рамок вместо воздуха; placeholders.
