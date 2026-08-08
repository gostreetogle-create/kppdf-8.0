═══════════════════════════════════════════════════════════════
TZ-COST-303: Видимость себестоимости в UI каталога / BOM — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: agent-3e757640b7 (Cursor PASS → archive)
acceptance_status: PASS (Cursor PASS 2026-08-08)
verification:
  - Modules list «Себест.» = см. карточку (no N+1): PASS
  - Product list/detail Себест. рядом с Прайс: PASS
  - BOM inspector material price×qty / module preview×qty: PASS
  - No manual module price field: PASS
  - frontend tsc: PASS
  - product-bom-panel.component.spec 4/4: PASS
checklist: docs/agent-checklists/TZ-COST-303.md
lock: .mimocode/locks/TZ-COST-303-cost-visibility-ui.lock
source: tasks/_backlog/cost/TZ-COST-303-cost-visibility-ui.md
audit: docs/audits/2026-08-08-catalog-cost-pricing-hierarchy.md

---

## Summary

- FE modules list: column «Себест.» hint «см. карточку» (302 has per-id preview only).
- FE products list/grid + detail: costPrice (Себест.) next to listPrice (Прайс).
- BOM inspector: read-only line contribution via MaterialsService / getCostPreview.
- Docs: product-detail.page.md, ARCHITECTURE cost UI visibility.

## Known limits

- No batch module cost-preview → list not live totals.
- Nested product-line contribution not shown in inspector (out of P0 AC).

Deploy: NO
