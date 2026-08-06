═══════════════════════════════════════════════════════════════
TZD-15: Agent inbox workspace (drop folder → audit → propose fills)
═══════════════════════════════════════════════════════════════

> **GO** — TZD-14 DONE on origin/main. LAYER 2 · desktop.
> CONFLICT: `desktop/src/**`; `desktop/mcp/**`; `desktop/src/importers/**`; `desktop/docs/MCP.md`
> Vision §1, §5. Same desktop executor (#3) or Cursor.

РОЛЬ АГЕНТА: executor (Tauri + MCP).

ЗАВИСИМОСТИ: TZD-12 + TZD-13 DONE; **TZD-14 DONE** (MCP host up when paired); importers on main.

Проверено: `desktop/src/importers/excel.ts`, `csv.ts`; MutationJournal propose/confirm; MCP write tools.

---

## ИСХОДНОЕ

Paired desktop can host MCP (14). Нет inbox UX: drop file → audit → propose → confirm → archive file.

---

## ЧТО ДЕЛАТЬ

1. Configurable **inbox directory** (app-data default + user pick).
2. Watch/detect new `xlsx|csv|txt`; parse via existing importers.
3. Audit report + **propose** batch (in-app and/or MCP `kppdf_inbox_*`) — **no silent SoT write**.
4. After confirm (TZD-13 journal path): move to `inbox/processed/` or `inbox/failed/` + log.
5. MCP: `kppdf_inbox_list`, `kppdf_inbox_propose_file` (+ document in MCP.md).
6. Update Feature Integration Checklist §E for new tools.

---

## НЕ

- Auto-write without confirm.
- PDF perfection.
- Server sync / cloud drive.
- Touch web `frontend/` catalog/admin.
- Steal TZD-14 unfinished work — wait for archive.

---

## ACCEPTANCE

1. Drop Excel → propose Material (or configured entity) rows.
2. Confirm applies; cancel leaves SoT unchanged; file → processed/failed.
3. Failures visible in UI/log.
4. Desktop typecheck PASS; MCP.md updated.

CONFLICT KEYS: `desktop/src/;desktop/mcp/;desktop/src/importers/;desktop/docs/MCP.md;docs/FEATURE-INTEGRATION-CHECKLIST.md`

PAGES: n/a (desktop)
ПРОМПТ: GEMINI.md + этот файл после TZD-14 DONE. Push: по PO.
