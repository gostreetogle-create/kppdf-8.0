# Claude Desktop — галочки (справка)

> **PO не обязан это трогать.** Режим AFK чинит  
> `scripts/ensure-claude-unattended.mjs` + `start.mjs` + task `KppdfClaudeUnattended`.  
> Полный канон: [`CLAUDE-UNATTENDED.md`](./CLAUDE-UNATTENDED.md).

Ниже — только если смотришь UI глазами (не чеклист перед уходом).

| Exact name in Settings | Автоцель |
|------------------------|----------|
| Classify session states | Выкл (не критично для Allow) |
| Allow bypass permissions mode | Вкл — ensure ставит prefs в конфиг Desktop |
| Dynamic workflows | Выкл |
| Keep computer awake while Claude works | Вкл в UI если есть (pref в JSON у Desktop нестабилен) |
| Create pull requests automatically | Выкл |
| Auto-fix pull requests | Выкл |
| Connect new sessions to Remote Control | Выкл |

Исторически: галка General только *разрешает* Bypass; без `bypassPermissionsModeEnabled` сессия откатывалась на Accept Edits. Ensure-скрипт пишет оба слоя.
