═══════════════════════════════════════════════════════════════
TZ-COST-302: Рекурсивный rollup себестоимости + sync costPrice — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: cursor-composer-cost302 (Cursor PASS → archive)
acceptance_status: PASS (Cursor PASS 2026-08-08)
verification:
  - Recursive nested lineType=module × qty: PASS
  - Cycle → infos warn, no 500: PASS
  - activate → Product.costPrice = totalCost: PASS
  - Overhead canon A (materials only) + ARCHITECTURE: PASS
  - GET /api/modules/:id/cost-preview read-only (no journal): PASS
  - FE module-detail «Себестоимость (расчёт)» read-only: PASS
  - jest cost-calculation.service.spec + product-module.service.spec 14/14: PASS
  - backend tsc: PASS
  - frontend tsc: PASS
checklist: docs/agent-checklists/TZ-COST-302.md
lock: .mimocode/locks/TZ-COST-302-recursive-cost-rollup.lock
source: tasks/_backlog/cost/TZ-COST-302-recursive-cost-rollup.md

---

## Summary

- BE: recursive module walk; cycle infos; activate syncs costPrice; overhead A
- GET /modules/:id/cost-preview via ProductModule → CostCalculationService
- FE: module-detail section V read-only cost preview
- ARCHITECTURE: overhead canon A + rollup/activate/preview note

## Out of scope (successors)

- TZ-COST-303 list cost UI — **only on PO**
- product→product lines in cost; listPrice auto; StorageItem price
- Deploy

## Protects

Parent cost = sum(children); module has calculated cost preview, not a second manual price; activate writes the product costPrice truth.
