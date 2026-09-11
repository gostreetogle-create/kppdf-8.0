# PROMPT — Claude: no native confirm (архив в студии)

Скопируй целиком.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?». AFK PO.

[КОНТЕКСТ]
Workspace: D:\kppdf-8.0
Hygiene 01–03 DONE: 96757c61 / 62d31f2c / 7e4f9154. _active пуст.
Остаток PO-скрина: window.confirm «Отправить документ в архив?» в studio-editor onFinalize (~:1967).
Эталон в том же файле: delete layer → AlertDialogComponent + onDialogCloseOnce (~:2091).

[ЗАДАЧА]
CLAIM tasks/TZ-NX-NO-NATIVE-CONFIRM.md
1) onFinalize → AlertDialog (title/description RU, confirm «В архив», destructive); только confirmed===true → существующий finalize flow.
2) eslint no-alert: error (frontend-nx app); rg "window\.(confirm|alert|prompt)" frontend-nx → 0.
3) page.md note; focused регресс по возможности.
Gates → archive → commit → push → _NOW Claude IDLE → Executor report (auto) + SHA.

[ОГРАНИЧЕНИЯ]
НЕ: wipe; deploy; A4; legacy frontend/**; чинить pre-existing lint baseline 38 errors; «продолжать?».

[ФОРМАТ]
<thinking>…</thinking> → работа. Финал: SHA + visual note (архив = Pi dialog, не chrome confirm).
```
