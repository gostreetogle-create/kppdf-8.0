═══════════════════════════════════════════════════════════════
TZD-27: Mutation journal — product.create / product.update — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: buffy-desktop-ex (Freebuff desktop executor, wave #5)
acceptance_status: PASS (all AC + gates green)
verification:
  - backend tsc --noEmit: PASS
  - backend jest mutation-journal + import-task: 27/27 PASS (incl. product kinds)
  - desktop/mcp pnpm test: 58/58 PASS
  - desktop/mcp typecheck: PASS
checklist: docs/agent-checklists/TZD-27.md
lock: .mimocode/locks/TZD-27-journal-product-writes.lock
source: tasks/_backlog/desktop/TZD-27-journal-product-writes.md
wave: tasks/_backlog/desktop/WAVE-DESKTOP-BULK-IMPORT.md (#5)

---

## Summary

- **Journal kinds** `product.create` | `product.update`: propose валидирует
  name+kind (unit default шт) — **не** вызывает ProductService до confirm;
  confirm/undo зеркально material с org scope (`ProductService.create/update/remove`).
- **MCP:** `kppdf_propose_product_create` / `kppdf_propose_product_update`
  (confirm/cancel/undo reuse kind-agnostic); `kppdf_validate_product`
  (passport dry-run, без BOM) + domain schema `entity=product`;
  `aiReport.rows[].entity` ('material'|'product', default material) —
  `apply_plan` ветка product через тот же propose-batch.
- **MCP.md Product path protocol** (validate → HITL → where_used → apply → confirm).
- AC: propose product.create → journal row, Product count unchanged ✅;
  confirm → ProductService ✅; undo/cancel как material ✅;
  apply_plan entity=product → product propose ids ✅.

## Out of scope (successors)

- BOM-линии из Excel — не эта волна (reuse web BomPanel).
- Order / Proposal(КП) kinds; counterparty bulk — отдельная будущая волна.

## Protects

Изделия теперь заливаются оптом через тот же двойной HITL
(plan → ok → propose → confirm), а не silent SoT; где используется
продукт — видно через TZD-19 graph tools до массовых update.
