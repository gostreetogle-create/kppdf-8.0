═══════════════════════════════════════════════════════════════
TZD-14: Desktop hosts MCP (autostart + status UI) — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-06
closed_by: Buffy (deepseek-v4-flash, desktop/MCP executor, session №3)
acceptance_status: PASS
verification:
  - Paired desktop → MCP autostart без терминала: PASS (spawn node via tauri-plugin-shell, CREATE_NO_WINDOW; exact command smoke-tested)
  - Unpaired → MCP не запускается, карточка объясняет причину: PASS
  - UI статус Running/Stopped/Error + URL+port + copy + LAN по умолчанию OFF: PASS
  - Stop on quit (onCloseRequested dispose + plugin RunEvent::Exit kill) + restart button: PASS
  - Persist port/bind в config.ts (versioned, CONFIG_VERSION v2, migrateMcp): PASS
  - Docs manager-facing desktop/docs/MCP.md (без Cursor): PASS
  - desktop pnpm typecheck: PASS
  - desktop svelte-check: 0 errors
  - desktop pnpm build (tsc+vite): PASS
  - desktop/mcp typecheck + tests 8/8: PASS
  - src-tauri cargo check: PASS (после генерации временных иконок — иконки не закоммичены, pre-existing gap)
  - MCP smoke: /healthz ok, Bearer верный → 406 (не 401), неверный → 401
checklist: docs/agent-checklists/TZD-14.md
lock: .mimocode/locks/TZD-14-desktop-mcp-autostart.lock
source: tasks/_backlog/desktop/TZD-14-desktop-host-mcp-autostart.md

---

## Summary

- `desktop/src/core/mcpHost.ts` (NEW): контроллер жизненного цикла MCP host —
  spawn `node <mcp>/node_modules/tsx/dist/cli.mjs <mcp>/src/http-server.ts` через
  `tauri-plugin-shell` (cwd = desktop/mcp, env KPPDF_API_BASE_URL/API_KEY/PORT/ALLOW_LAN),
  статус-машина stopped/starting/running/stopping/error, healthz-подтверждение
  (генерация-гард от устаревших поллингов), описание ошибок (Node не найден, порт занят).
- `desktop/src/core/config.ts`: блок `mcp { port, allowLan }` в версионированном
  конфиге (CONFIG_VERSION 1→2, migrateMcp нормализует старые файлы, дефолт 9743/OFF).
- `desktop/src/App.svelte`: карточка «MCP — локальный доступ для AI» — бейдж статуса,
  URL + «Копировать», поле порта + «Применить порт», чекбокс LAN (default OFF + warning),
  кнопки Запустить/Остановить/Перезапустить; автозапуск при паринге (mount + connect),
  stop при отключении, dispose при закрытии окна.
- `desktop/src-tauri`: +tauri-plugin-shell (Cargo.toml, lib.rs init);
  capabilities: `shell:allow-spawn` scoped `{name:node, cmd:node, args:true}` + `shell:allow-kill`.
- `desktop/docs/MCP.md`: раздел «Как подключить (менеджер)» — через приложение, без
  терминала и без Cursor; ручной запуск остаётся dev fallback; отмечен лимит (Node не
  бандлится в MSI). `desktop/README.md`: статус v0.4 + структура + roadmap.

Conflict disclosure: только desktop/** (CONFLICT KEYS TZ). frontend catalog/admin/web не
трогались. `desktop/src-tauri/Cargo.lock` добавлен в desktop/.gitignore (репо-конвенция —
lockfile не трекался).

Known limits:
- MCP-рантайм (Node+tsx) не упакован в инсталлятор: приложение запускает его из
  папки репозитория `desktop/mcp` (dev/repo-раскладка). Bundling (sidecar) — бэклог.
- `cargo check` локально требует иконок (`icons/` в репо нет) — проверка проведена с
  временными плейсхолдерами, после чего удалены.

Next: TZD-15 (agent inbox workspace) — по старту PO.
