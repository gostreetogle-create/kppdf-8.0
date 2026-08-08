═══════════════════════════════════════════════════════════════
TZ-COST-304: Аудит product-line price vs cost — DONE (docs)
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: cursor-architect (Mode A docs audit)
acceptance_status: PASS
verification:
  - Audit docs/audits/2026-08-09-product-line-cost-vs-override.md: PASS
  - D1–D5 explicitly chosen: PASS
  - Evidence cite cost-calculation skips product: PASS
  - TZ-COST-305 draft with AC + CONFLICT KEYS: PASS
  - No product *.ts in commit: PASS
checklist: docs/agent-checklists/TZ-COST-304.md
source: tasks/_backlog/cost/TZ-COST-304-product-line-cost-audit.md
audit: docs/audits/2026-08-09-product-line-cost-vs-override.md
successor: tasks/_backlog/cost/TZ-COST-305-product-line-in-cost.md

---

## Summary

- Разрыв: `unitPriceOverride` на линии ≠ вход CostCalculation (только material+module).
- Канон: D1=b, D2=a, D3=d, D4 «Цена в составе», D5 no module override.
- Impl → TZ-COST-305 (RESERVED до слота map).

Deploy: NO
Product code: NOT TOUCHED
