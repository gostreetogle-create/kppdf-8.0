# PROMPT — Freebuff/Claude: start.mjs diagnostics + false reuse fix

Ты executor (`agent_id: freebuff` или `claude`). Workspace: `D:\kppdf-8.0` на main.

### Preflight
`docs/how-to-connect-ai.md` → `GEMINI.md` → claim `tasks/_ready/TZ-OPS-START-DIAGNOSTICS.md`  
`_active` пуст (не трогать frontend-nx product / order-workspace).

### Сделать
1. Фикс: `frontendReused` без живого HTTP на :4201 → respawn nx serve + лог
2. Wait ticks: `stage=` + last line из `.logs/launcher-frontend.log`
3. Timeout: dump 20 строк лога
4. Короткий timing summary
5. `node --check start.mjs` → archive → commit → STOP

Не deploy. Не product UI.
