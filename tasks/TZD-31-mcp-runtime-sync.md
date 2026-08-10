═══════════════════════════════════════════════════════════════
TZD-31: MCP runtime sync — tools/list = desktop/mcp source
═══════════════════════════════════════════════════════════════

STATUS: READY
WAVE: WAVE-MCP-GAP-2026-08-10 #1
DEPENDS ON: none
LAYER: 2
CHECKLIST: docs/agent-checklists/TZD-31.md
PAGES: N/A (Desktop MCP host; no new web route)
PAGE_DOCS: N/A

РОЛЬ АГЕНТА: Desktop MCP Engineer

CONFLICT KEYS:
desktop/src/core/mcpHost.ts;
desktop/mcp/src/http-server.ts;
desktop/mcp/src/tools.ts;
desktop/mcp/src/config.ts;
desktop/docs/MCP.md;
desktop/docs/INSTALL.md;
docs/agent-checklists/TZD-31.md;
tasks/_backlog/desktop/WAVE-MCP-GAP-2026-08-10.md;

Проверено: docs/audits/2026-08-10-mcp-sport-demo-audit.md §3;
  desktop/mcp/src/tools.ts (registerRead/Write/Domain/Inbox/Import/Doc/Text);
  desktop/src/core/mcpHost.ts resolveMcpHostDir + spawn tsx http-server.ts;
  live tools/list on :9743 = thin TZD-12/13 subset only.

Loose wording: «MCP не видит tools» → hostDir указывает не на актуальный
`D:\kppdf-8.0\desktop\mcp` **или** процесс не перезапущен после pull.

---

## ИСХОДНОЕ

1. В репо `createKppdfMcpServer` регистрирует TZD-17…30 tools.
2. Cursor/`tools/list` на живом `:9743` **не** отдаёт `kppdf_list_categories`,
   `kppdf_propose_product_create`, import/doc/text tools.
3. Desktop стартует MCP через `resolveMcpHostDir()` (resourceDir → … → `mcp`).
4. `desktop/mcp-runtime/` **не** SoT (не править / не коммитить).

## ЧТО ДЕЛАТЬ

ШАГ 1: Observability

1. Экспорт реестра имён tools из `desktop/mcp` (const list или
   `listRegisteredToolNames()`), без дублирования руками в двух местах.
2. `GET /healthz` → добавить поля минимум: `ok`, `port`, `toolCount`,
   `packageVersion` (из package.json), `hostDir` (abs path process.cwd()
   или cfg), sample `toolsSample` (5–10 имён вкл. `kppdf_list_categories`
   если зарегистрирован).
3. При старте host — `console.log` abs path + toolCount.

ШАГ 2: Host path fix

1. `resolveMcpHostDir` / start: поддержка env **`KPPDF_MCP_HOST_DIR`**
   (абсолютный путь к пакету) с приоритетом над resourceDir walk.
2. Если entry/`package.json` name ≠ `@kppdf/desktop-mcp` — status error
   с понятным RU текстом (не silent wrong tree).
3. Документировать в MCP.md + INSTALL.md: после `git pull` → Restart MCP;
   проверка `GET …/healthz` toolCount; Cursor Reload MCP.

ШАГ 3: Smoke AC helper

1. Короткий script или test: при `createKppdfMcpServer` toolCount ≥
   порога (зафиксируй число в TZ AC после подсчёта export list; ожидаемо
   ≥ 40 с учётом TZD-17…30).
2. Не трогать product FE web.

## НЕ ИЗМЕНЯТЬ

- backend Nest domain
- `desktop/mcp-runtime/**` (если всплывёт — ignore / не commit)
- commercial/stock new tools (TZD-33/34)
- material propose field expand (TZD-32)
- deploy.ps1 / wipe

## КРИТЕРИИ ПРИЁМКИ

1. `GET http://127.0.0.1:<port>/healthz` содержит `toolCount` ≥ числа
   зарегистрированных в source tools и `toolsSample` включает
   `kppdf_list_categories` **и** `kppdf_propose_product_create`.
2. Документация: как задать `KPPDF_MCP_HOST_DIR=D:\kppdf-8.0\desktop\mcp`
   для dev Desktop.
3. Unit/smoke в `desktop/mcp` на registry/health payload.
4. Gates:
   ```text
   cd desktop/mcp && pnpm test
   cd desktop/mcp && pnpm exec tsc --noEmit
   ```
   Если правился `mcpHost.ts` — typecheck desktop app zone тоже
   (`cd desktop && pnpm exec tsc --noEmit` или принятый script пакета).
5. Archive + checklist DONE + commit/push; **deploy NO**.
6. В Executor report: фактический toolCount и путь hostDir после фикса.

## known_limitation

- MSI/packaged Desktop без бандла Node/MCP — по-прежнему dev-limitation
  (не AC «полный MSI sidecar»).
- Cursor Reload MCP — ручной шаг PO после рестарта host (не автоматизировать
  запись в `~\.cursor\mcp.json`).

## Domain preflight

- Нет смены Counterparty/Organization.
- Unique/N docs — N/A (host ops).
