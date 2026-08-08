═══════════════════════════════════════════════════════════════
TZ-COST-305: Product-line вклад в себестоимость + default/copy в picker — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T06:30:00Z
closed_by: continuous-executor-composer (self PASS → archive)
acceptance_status: PASS
verification:
  - Parent product-line+override → totalCost includes override×qty: PASS
  - Without override → child.costPrice×qty; both empty → 0 + infos: PASS
  - overhead% not applied to product-line bucket: PASS
  - Picker «Цена в составе, ₽» + prefill costPrice→listPrice: PASS
  - backend tsc: PASS
  - jest cost-calculation 10/10: PASS
  - frontend tsc: PASS
  - jest picker + bom-panel 12/12: PASS
checklist: docs/agent-checklists/TZ-COST-305.md
lock: .mimocode/locks/TZ-COST-305-product-line-in-cost.lock
source: tasks/_backlog/cost/TZ-COST-305-product-line-in-cost.md
audit: docs/audits/2026-08-09-product-line-cost-vs-override.md

---

## Summary

- BE: `productLines[]` + `totalProductLineCost`; D1=b formula; totalCost += bucket; overhead stays materials-only.
- BE tests: override / costPrice / none+infos / material+module regression.
- FE picker: RU copy + hint; prefill costPrice→listPrice; no child card write.
- FE BOM inspector: product-line contribution hint.
- Docs: product-detail.page.md + ARCHITECTURE cost formula.

## Known limits

- Live recursion of child BOM instead of stale costPrice — out of scope.
- Cost breakdown dialog FE types for productLines — optional follow-up (inspector covers AC).
- Module manual override — forbidden (D5).

Deploy: NO
