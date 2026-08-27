# QA-445H: Desktop → MCP — каталог `desktop/mcp` не распознан как пакет

> Не из таймкодов PO (07:25–16:55) — попал в тот же скриншот-дамп отдельно.
> Не приоритет, проверить актуальность перед тем как брать в работу (могло
> уже починиться другим TZ после даты скриншота).

РОЛЬ: desktop (Tauri) + сборка/пакетирование `@kppdf/desktop-mcp`.

CONFLICT KEYS: `desktop/src-tauri/**`, `desktop/**mcp**`-пакет.

ЧТО: На вкладке «МСР для агентов» приложения KPPDF Desktop — красная ошибка:
> «Каталог MCP «D:\kppdf-8.0\desktop\mcp» — не пакет @kppdf/desktop-mcp
> (package.json name: нет/не читается). Задайте KPPDF_MCP_HOST_DIR (например
> KPPDF_MCP_HOST_DIR=D:\kppdf-8.0\desktop\mcp), выполните git pull в рабочей
> копии и перезапустите MCP.»

Сообщение об ошибке само по себе информативное (даёт конкретный workaround
через env-переменную) — возможно, это ожидаемое поведение при неполном
локальном сетапе конкретно этой машины PO (например, каталог `desktop/mcp`
действительно отсутствует/не собран), а не системный баг. Первый шаг —
проверить на чистом клоне, воспроизводится ли ошибка при штатной установке
по `desktop/docs/INSTALL.md`, прежде чем менять код.

НЕ: не менять механику определения `KPPDF_MCP_HOST_DIR`, если проблема
оказывается локальной (отсутствующий build-шаг на машине PO) — тогда это
вопрос в `docs/agents/CLAUDE-CODE.md`/`INSTALL.md`, а не в код.

AC: либо подтверждено и исправлено системное несоответствие путей/пакета,
либо задокументирован правильный setup-шаг, который убирает ошибку при
установке по инструкции.

---
## Executor report (auto) — closeout 2026-08-27

- agent_id: claude
- Outcome: **DONE** — no code change; confirmed known/documented limitation, not a bug
- Diagnosis: `desktop/mcp/package.json` on `main` is correct
  (`name: "@kppdf/desktop-mcp"`), and `desktop/src-tauri/capabilities/default.json`
  already whitelists `D:/kppdf-8.0/desktop/mcp` in `fs:scope` — both added by
  `ca035847` (2026-08-11), well before the PO's 2026-08-26 screenshot batch. In a
  `tauri dev` session on this checkout, `resolveMcpHostDir()` in `desktop/src/core/mcpHost.ts`
  walks up from `resourceDir()` and finds `desktop/mcp` with the correct package name,
  so the error does not reproduce for dev.
  The exact error text (and path `D:\kppdf-8.0\desktop\mcp`) only comes from the
  "legacy fallback" branch in `resolveMcpHostDir()`, which is what fires for an
  **installed NSIS build** of KPPDF Desktop — those builds have no MCP resource
  bundled yet (`sidecar пока не поставляется`, per `desktop/docs/INSTALL.md`/`MCP.md`),
  so they can never auto-find a valid `desktop/mcp` package without
  `KPPDF_MCP_HOST_DIR` set explicitly. This is expected, by-design behavior for that
  case, not a path/package resolution bug.
  `desktop/docs/MCP.md` (Env table) and `desktop/docs/INSTALL.md` (~line 102-112)
  already document the exact same fix (`KPPDF_MCP_HOST_DIR=D:\kppdf-8.0\desktop\mcp`)
  that the error message itself suggests — the AC's "setup-step documented" branch was
  already satisfied before this ticket.
  Secondary, unrelated observation: `desktop/mcp/` has no `node_modules` installed on
  this checkout (not a pnpm workspace, and `desktop`'s own `pnpm install` doesn't
  cascade into it) — would surface as a different error once host-dir detection
  passes; out of scope per TZ "НЕ", flagged for whoever next runs MCP host in dev.
- `KPPDF_MCP_HOST_DIR` resolution mechanics left untouched, per TZ instruction.
- Gates: no code changed → no new tsc/jest run required.
- Full write-up: `docs/agent-checklists/TZ-QA-445H.md`.
- Deploy: NO
