# PROMPT — Claude terminal: подготовка к кати (без деплоя)

> TZD-62…65 DONE. Этот промпт — только чеклист + гейты.
> Deploy / wipe — запрещены, пока PO в этом чате не скажет «кати».

**PO:** новый чат Claude Code / terminal, скопируй блок.

---

```text
Ты — executor kppdf-8.0, Claude. Репо: D:\kppdf-8.0
GEMINI.md + kppdf-executor-loop + tasks/TZ-DEPLOY-303-predeploy-refresh.md

Цель: обновить docs/agent-checklists/PRE-DEPLOY-2026-08-19.md под текущий origin/main.
НЕ запускать deploy.ps1 / deploy.py. НЕ wipe. НЕ SSH на Synology.
НЕ трогать desktop/src/App.svelte и Angular (Freebuff волна B).
Чужой uncommitted WIP (backend schemas и т.п.) не стейджить.

CLAIM первым:
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) TZ → tasks/_active/TZ-DEPLOY-303.md + checklist
3) Claim slot agent_id=claude, claimed_at ISO
Затем шаги TZ, gates, archive 2026-08/TZ-DEPLOY-303.done.md + lock + точечный commit/push только PRE-DEPLOY + _NOW + checklist.

DoD: target SHA = origin/main; таблица гейтов; фраза «деплой не выполнялся».
```
