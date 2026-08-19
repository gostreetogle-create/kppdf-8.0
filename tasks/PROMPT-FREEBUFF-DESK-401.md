# Промпт Freebuff — TZ-DESK-401 (только каркас стола)

Для PO: вставь блок целиком. **Не** начинай 402–404, пока не скажешь «раскладка ок».
Деплой запрещён. Обрыв: `tasks/PROMPT-RESUME-ANY.md`.

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
Skills: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
Канон: docs/PO-CANON.md
Спек: docs/superpowers/specs/2026-08-18-manager-desk-design.md
TZ: tasks/TZ-DESK-401.md
Этот промпт: tasks/PROMPT-FREEBUFF-DESK-401.md

WORKSPACE GATE: Get-Location · git rev-parse --show-toplevel · git branch --show-current
Только D:\kppdf-8.0 на main. .freebuff/worktrees запрещён.

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-DESK-401.md + checklist docs/agent-checklists/TZ-DESK-401.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at + workspace
4) Чужие _active keys → конфликт = STOP
5) Team Room claim best-effort
Затем выполни TZ-DESK-401 1:1. Не выдумывай TZ. Не трогай _park.
deploy.ps1 / wipe / «кати» — ЗАПРЕЩЕНЫ.
НЕ меняй order-form-dialog, production-cockpit, dashboard-stats KPI, desktop.
НЕ вызывай GET /api/orders. Гант не встраивать.

DoD: archive tasks/_archive/2026-08/TZ-DESK-401.done.md + lock + push своих путей.
Стоп. 402 не брать. Отчёт: SHA + что кликается на /desk.
```
