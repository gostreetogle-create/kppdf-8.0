# TZD-14 checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-08/TZD-14.done.md`
> Marker: удалён из `tasks/_active/` при closeout
> Source: `tasks/_backlog/desktop/TZD-14-desktop-host-mcp-autostart.md`
> Vision: `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md` §1–2, §8

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (deepseek-v4-flash, desktop/MCP executor, session №3)
- claimed_at: 2026-08-06T16:15:12Z
- workspace: D:\kppdf-8.0 (Freebuff worktree 83e0e1d5; HEAD synced to origin/main c60c592)
- team_room_claim: unavailable — Team Room CLI: «Unknown task: TZD-14; sync tasks first» (backlog TZD не зарегистрирован в комнате)

## Preflight

- [x] git rev-parse --show-toplevel → worktree checkout of D:\kppdf-8.0; HEAD == origin/main (c60c592), sync ff-only OK
- [x] Прочитал `_active-map.md` — каталог wave 2 (320/311) чужие ключи; desktop/** свободен; `tasks/_active/` пуст
- [x] TZ / vision / deps (TZD-11 http-server + config env) прочитаны
- [x] GEMINI.md + AI-AGENT-GUIDE.md + PO-DIARY §1–§4 прочитаны (кратко)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-14.md` на месте

## Acceptance (TZ)

- [x] Paired desktop → MCP up without terminal (autostart на 127.0.0.1:configurable port) — spawn node via tauri-plugin-shell (CREATE_NO_WINDOW); smoke команды PASS
- [x] Unpaired → MCP not started (clearly disabled) — guard в startMcp + карточка объясняет
- [x] UI status Running / Stopped / Error; URL+port + copy; LAN bind default OFF
- [x] Stop MCP on quit; restart button — onCloseRequested dispose + plugin RunEvent::Exit kill
- [x] Persist port/bind в `config.ts` (versioned) — CONFIG_VERSION v2, migrateMcp
- [x] Docs manager-facing в `desktop/docs/MCP.md` (без требования Cursor)
- [x] `pnpm typecheck` / svelte-check PASS for desktop

## Gates (факт)

- [x] `cd desktop && pnpm typecheck` — PASS
- [x] `cd desktop && pnpm check` (svelte-check) — PASS, 0 errors
- [x] `cd desktop && pnpm build` (tsc+vite) — PASS
- [x] `cd desktop/mcp && pnpm typecheck && pnpm test` — PASS, 8/8
- [x] `cd desktop/src-tauri && cargo check` — PASS (tauri-plugin-shell 2.3.5; временные иконки сгенерированы и удалены — icons/ не в репо, pre-existing gap)
- [x] MCP smoke — `/healthz` ok; Bearer верный → 406 (не 401); неверный → 401
- [x] diff --check — PASS (на коммите)

## Executor report

- Сделано: mcpHost.ts (контроллер), config.ts mcp-блок v2, App.svelte карточка MCP
  (статус/URL/копировать/порт/LAN/restart), tauri-plugin-shell init + capability
  (spawn scoped node + kill), docs MCP.md + README.
- Conflict disclosure: только desktop/** (ключи TZ); catalog/admin/web не тронуты;
  `Cargo.lock` добавлен в desktop/.gitignore (репо-конвенция).
- Known limits: Node-рантайм не бандлится в MSI (dev/repo-раскладка desktop/mcp);
  icons/ отсутствует в репо (cargo check требует локальных иконок).

## Review handoff

- [x] READY FOR REVIEW — code-reviewer (deepseek-flash) review проведён; найденный баг
      (error→stopped clobber при healthz-timeout) исправлен, gates перезапущены PASS
- [x] Desktop track owner = Cursor; задача выдана напрямую исполнителю session №3

## Closeout (после PASS)

- [x] archive `tasks/_archive/2026-08/TZD-14.done.md` + lock + progress + удалён `_active`
- [x] Status = DONE
- closed_at: 2026-08-06T16:28:14Z
