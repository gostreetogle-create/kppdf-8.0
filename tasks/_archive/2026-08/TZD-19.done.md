═══════════════════════════════════════════════════════════════
TZD-19: MCP product graph + integrity (BOM / where_used) — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: buffy-desktop-ex (Freebuff desktop executor, wave #4)
acceptance_status: PASS (all AC + gates green)
verification:
  - desktop/mcp typecheck: PASS
  - desktop/mcp pnpm test: 51/51 PASS (incl. 4 new graph tests)
checklist: docs/agent-checklists/TZD-19.md
lock: .mimocode/locks/TZD-19-mcp-graph-integrity.lock
source: tasks/_backlog/desktop/TZD-19-mcp-graph-integrity.md
wave: tasks/_backlog/desktop/WAVE-DESKTOP-BULK-IMPORT.md (#4)

---

## Summary

- **5 graph read tools** (имена фиксированы, живые REST shape):
  `kppdf_get_product_composition`, `kppdf_get_product_where_used`,
  `kppdf_get_material_where_used`, `kppdf_get_module_composition`,
  `kppdf_get_module_where_used`.
- **`kppdf_run_integrity_suite`** — read-only smoke на sample ids из
  products/materials/modules → `{ ok, checks[], warnings[] }`; **не**
  sandbox_reset, **не** write. Core `runIntegritySuite` deps-injected.
- **`kppdf_list_modules`** — supporting list tool (нужен сьюте).
- **MCP.md Graph protocol:** перед `propose product.update` /
  массовым `material.update` — where_used/composition check.
- AC: 5 tools + mock tests ✅; живой API shape ✅; MCP.md graph protocol ✅.

## Out of scope (successors)

- Journal product.* kinds (TZD-27) · doc drafts (TZD-28) · todos (TZD-29).
- composition write tools / Gantt — не этот TZ.

## Protects

Агент видит BOM/where_used до массовых apply → не ломает каталог при
product mass-write (TZD-27) и не делает «тихо 0» себест. у детей при
массовом material.update.
