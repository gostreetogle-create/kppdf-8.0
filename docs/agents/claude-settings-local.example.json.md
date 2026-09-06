# Пример / SoT: Claude unattended (локально)

> **Не копируй руками.** Автоматом пишет  
> `node scripts/ensure-claude-unattended.mjs`  
> (ещё из `node start.mjs` и scheduled task каждые 5 мин).

Канон: [`CLAUDE-UNATTENDED.md`](./CLAUDE-UNATTENDED.md).

Локальный файл проекта (gitignore): `.claude/settings.local.json` —  
`defaultMode: bypassPermissions` + allow git/pnpm/edit + ask force/wipe/deploy.

Домашний: `~/.claude/settings.json` — тот же `defaultMode`.

Desktop (Windows Store): `…\Packages\Claude_*\…\claude_desktop_config.json` —  
`preferences.bypassPermissionsModeEnabled: true` +  
`epitaxyPrefs.cc-landing-draft-permission-mode: bypassPermissions`.

GrowthBook override в `~/.claude.json`:  
`tengu_permission_friction=false`, `tengu_quill_harbor=bypassPermissions`.

## Не делать

Не прописывать `claude --dangerously-skip-permissions` в алиасы/скрипты репо.  
Не просить PO помнить галки General перед уходом.
