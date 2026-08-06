# TZD-15 checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-08/TZD-15.done.md`
> Marker: удалён из `tasks/_active/` при closeout
> Source: `tasks/_backlog/desktop/TZD-15-agent-inbox-workspace.md`
> Vision: `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md` §1, §5

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (deepseek-v4-flash, desktop/MCP executor, session №3)
- claimed_at: 2026-08-06T17:02:48Z
- workspace: D:\kppdf-8.0 (Freebuff worktree 83e0e1d5; HEAD synced to origin/main d9f3e6f6)
- team_room_claim: unavailable — Team Room CLI: backlog TZD не зарегистрирован в комнате (same as TZD-14)

## Preflight

- [x] git rev-parse --show-toplevel → worktree checkout of D:\kppdf-8.0; HEAD == origin/main (d9f3e6f6) via reset --hard (base had moved; TZD-14 content already folded into main)
- [x] Прочитал `_active-map.md` — TZD-15 зарезервирован за agent #3 (desktop); `tasks/_active/` пуст; конфликтов нет
- [x] TZ / deps (TZD-12 journal + TZD-13 MCP write tools + TZD-14 MCP host) прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-15.md` на месте

## Acceptance (TZ)

- [x] Configurable inbox directory (app-data default + user pick) — config v3 `inbox.dir`, диалог выбора + сброс
- [x] Watch/detect new `xlsx|csv|txt`; parse via existing importers — poll 4s + кнопка; excel/csv/txt (txt реализован)
- [x] Audit report + **propose** batch (in-app and/or MCP `kppdf_inbox_*`) — **no silent SoT write** — propose-only через journal, confirm/cancel отдельно
- [x] After confirm (TZD-13 journal path): move to `inbox/processed/` or `inbox/failed/` + log — inbox.log + UI-журнал
- [x] MCP: `kppdf_inbox_list`, `kppdf_inbox_propose_file` (+ document in MCP.md) — live smoke PASS
- [x] Update Feature Integration Checklist §E for new tools — §E отмечен
- [x] Desktop typecheck PASS; MCP.md updated — typecheck/svelte-check/build PASS; MCP.md раздел Tools — inbox

## Gates (факт)

- [x] `cd desktop && pnpm typecheck` — PASS
- [x] `cd desktop && pnpm check` (svelte-check) — PASS, 0 errors
- [x] `cd desktop && pnpm build` (tsc+vite) — PASS
- [x] `cd desktop/mcp && pnpm typecheck && pnpm test` — PASS, 17/17 (9 новых inbox-тестов)
- [x] `cd desktop/src-tauri && cargo check` — PASS (временные иконки сгенерированы и удалены)
- [x] MCP live smoke — tools/list содержит `kppdf_inbox_list`/`kppdf_inbox_propose_file`; inbox_list вернул файлы; wrong key → 401
- [x] xlsx/csv/txt parse+map smoke — PASS (файлы из реального каталога inbox)

## Executor report

- Сделано: `desktop/src/core/inbox.ts` (scan/audit/propose/confirm/cancel/move/log),
  `desktop/mcp/src/inbox.ts` + `inbox-tools.ts` (kppdf_inbox_list, kppdf_inbox_propose_file),
  config.ts v3 inbox.dir, mcpHost.ts KPPDF_INBOX_DIR env, text.ts импортёр,
  App.svelte карточка «Inbox», docs MCP.md + README + FEATURE-INTEGRATION-CHECKLIST §E.
- Conflict disclosure: только desktop/** + docs/FEATURE-INTEGRATION-CHECKLIST.md §E
  (CONFLICT KEYS TZ); frontend catalog/admin/web не тронуты.
- Known limits: watch = poll 4s (не нативный fs-watch); propose по строке —
  последовательные POST; MCP-рантайм не в MSI (pre-existing); icons/ нет в репо
  (cargo check на временных).

## Review handoff

- [x] READY FOR REVIEW — code-reviewer (deepseek-flash) review проведён; найденные
      проблемы исправлены: HIGH ×2 (inbox dir не передавался в MCP host; double-click
      propose без busy-guard) + LOW ×4 (skippedRows всегда 0; dangling proposals при
      partial confirm; dead emptyInboxConfig; unused cfg param). Gates перезапущены PASS.
- [x] Desktop track owner = Cursor; задача выдана напрямую исполнителю session №3
      (backlog TZD — не регистрируются в Team Room)

## Closeout (после PASS)

- [x] archive `tasks/_archive/2026-08/TZD-15.done.md` + lock + progress + удалён `_active`
- [x] Status = DONE
- closed_at: 2026-08-06T17:19:18Z
