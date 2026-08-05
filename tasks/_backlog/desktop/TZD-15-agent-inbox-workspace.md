═══════════════════════════════════════════════════════════════
TZD-15: Agent inbox workspace (drop folder → audit → propose fills)
═══════════════════════════════════════════════════════════════

> PARKED. After TZD-12 + TZD-13 (+ importers from TZD-01/v0.3). LAYER 2.
> CONFLICT: `desktop/src/**`; `desktop/mcp/**`; reuse `desktop/src/importers/**`
> Vision §1, §5 TZD-15.

РОЛЬ АГЕНТА: executor.

ЗАВИСИМОСТИ: TZD-12, TZD-13; excel/csv importers already on main (v0.3).

Проверено: `desktop/src/importers/excel.ts`; `csv.ts`; pipeline stub; vision inbox.

---

## ЧТО ДЕЛАТЬ

1. Configurable **inbox directory** under app-data or user-chosen folder.
2. Detect new files (xlsx/csv/txt); parse via existing importers.
3. Produce **audit report** + **propose** batch (MCP tool and/or in-app UI) — no silent write.
4. After confirm (TZD-13), move file to `inbox/processed/` or `inbox/failed/` with log.
5. MCP tool: `kppdf_inbox_list` / `kppdf_inbox_propose_file`.

---

## НЕ

- Auto-write without confirm.
- PDF perfection (stub OK; TZD-04 may precede polish).
- Server-side file sync (local disk only this TZ).

---

## ACCEPTANCE

- [ ] Drop Excel → propose rows for Material (or configured entity).
- [ ] Confirm applies; file archived to processed.
- [ ] Failures visible; SoT unchanged on cancel.

CONFLICT KEYS: `desktop/src/;desktop/mcp/;desktop/src/importers/;desktop/docs/MCP.md`
