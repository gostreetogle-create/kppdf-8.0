# Claude Code — AFK без чеклиста PO

> Цель: отдал continuous-промпт → ушёл → DONE. **Никаких «перед уходом включи галку».**

Автоматика (не руками):

| Что | Кто делает |
|-----|------------|
| `.claude/settings.local.json` (bypass + allow/ask) | `scripts/ensure-claude-unattended.mjs` |
| `~/.claude/settings.json` `defaultMode: bypassPermissions` | тот же скрипт |
| Desktop `bypassPermissionsModeEnabled` + draft mode `bypassPermissions` | тот же скрипт (Windows Store config) |
| GrowthBook `tengu_quill_harbor` / friction (иначе откат на Accept Edits ~каждые 9 мин) | тот же скрипт |
| Повтор каждые 5 мин | Windows Scheduled Task `KppdfClaudeUnattended` (ставит скрипт сам), Action = **hidden PowerShell** wrapper вокруг `node.exe` — иначе каждые 5 мин видна вспышка консоли (`node.exe` сам — консольное приложение) |
| При `node start.mjs` | start.mjs тихо зовёт ensure |

Запуск вручную не нужен; если чинишь с нуля:

```bash
node scripts/ensure-claude-unattended.mjs
```

## Почему раньше «вставал» даже с bypass в settings

1. Desktop **игнорирует** `defaultMode` из settings и берёт режим из Electron prefs.  
2. Без плоского `bypassPermissionsModeEnabled: true` сессия **молча** откатывается на Accept Edits (баг Anthropic).  
3. GrowthBook (`tengu_quill_harbor=acceptEdits`) периодически перетирает режим — нужен watchdog каждые 5 мин.

## Cursor → Claude handoff

Cursor сам вставляет блок UNATTENDED в PROMPT (запрет «продолжать?» в чате).  
Permission UI закрывает ensure-скрипт; чат-подтверждения — контракт executor-loop.

## Windows: почему через hidden PowerShell, а не прямой node.exe (2026-09-11, `TZ-OPS-CLAUDE-UNATTENDED-HIDDEN-TASK`)

`ensureWindowsSchedule()` в `scripts/ensure-claude-unattended.mjs` ставит `/TR`
как `powershell.exe -NoLogo -NonInteractive -WindowStyle Hidden -Command "& node <script> --quiet --no-schedule"`,
**не** `node.exe` напрямую — `node.exe` консольный, без обёртки Планировщик
каждые 5 мин мигает окном. Ручной PO-фикс делал то же самое; проблема была в
том, что любой `start.mjs`/ensure с `/F` перетирал его обратно на прямой node.
Теперь скрипт сам всегда ставит hidden-обёртку — руками через `schtasks` не
переключать `/TR` назад на прямой `node.exe`.

Без кавычек внутри `-Command`: `schtasks /Create /TR` при сохранении сам
перезаписывает одинарные кавычки на двойные, а вложенные `""` затем ломают
разбор аргументов у самого PowerShell (`LastTaskResult=1` при живой проверке).
Поэтому node вызывается как `node` (через `PATH`, тот же контекст пользователя,
что и у Scheduled Task с `LogonType=InteractiveToken`), путь к скрипту — без
пробелов в этом репо. `-EncodedCommand` не подошёл отдельно — у `/TR` жёсткий
лимит 261 символ, base64 в него не влезает.

## Риски

Bypass = commit/push/тесты без клика. Force-push / wipe / deploy остаются в `ask` или стоп по `GEMINI.md`.  
Scheduled task правит только локальные Claude prefs на этой машине.

## 100% без Allow (новый чат)

Обычный «New chat» в Desktop **не всегда** стартует в Bypass — поэтому для AFK:

1. Закрой старую сессию с Allow.  
2. Запусти **`D:\kppdf-8.0\.claude\run-continuous.cmd`** (двойной клик или из терминала).  
   Файл локальный (`.claude/` в gitignore), внутри уже  
   `--permission-mode bypassPermissions --dangerously-skip-permissions` + ensure.  
3. В этот чат вставь continuous-промпт от Cursor.

Так — сто процентов на bash/grep/pnpm/git. Спросит только wipe/deploy/force (или если сам напишешь «стоп»).

Не полагайся на «просто новый чат в UI» без этого лаунчера — Desktop может снова дать Accept Edits.
