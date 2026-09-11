# PROMPT — Claude: hide KppdfClaudeUnattended console flash

Скопируй целиком.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?». AFK PO.

[КОНТЕКСТ]
Workspace: D:\kppdf-8.0
WH-INV DONE. NEXT: мигающее окно console ~каждые 5 мин на Windows.
Причина: scripts/ensure-claude-unattended.mjs ensureWindowsSchedule() — schtasks /TR = прямой node.exe.
Ручной фикс PO (powershell -WindowStyle Hidden) работает, но /F при start.mjs перетирает.

[ЗАДАЧА]
CLAIM tasks/TZ-OPS-CLAUDE-UNATTENDED-HIDDEN-TASK.md
1) ensureWindowsSchedule: /TR через powershell.exe -NoLogo -NonInteractive -WindowStyle Hidden -Command "& '<node>' '<script>' --quiet --no-schedule"
2) Имя KppdfClaudeUnattended, /SC MINUTE /MO 5 /F, без новых .ps1/.cmd в репо
3) Не трогать GrowthBook/settings; isWin guard; macOS/Linux без изменений
4) Note в docs/agents/CLAUDE-UNATTENDED.md
Gates: node --check + на Windows Get-ScheduledTask Actions=powershell, Start-ScheduledTask LastTaskResult=0, без окна
Archive → commit → push → _NOW IDLE → Executor report + SHA.

[ОГРАНИЧЕНИЯ]
НЕ: product FE/BE; wipe; deploy; отключать задачу; «продолжать?».

[ФОРМАТ]
<thinking>…</thinking> → работа. Финал: SHA + подтверждение LastTaskResult=0.
```
