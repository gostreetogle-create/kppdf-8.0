# Cost / себестоимость backlog

Аудит-база: [`docs/audits/2026-08-08-catalog-cost-pricing-hierarchy.md`](../../../docs/audits/2026-08-08-catalog-cost-pricing-hierarchy.md)

| ID | Status | File |
|----|--------|------|
| TZ-COST-301 | DONE | [hourlyRate required](./TZ-COST-301-work-type-hourly-rate-required.md) → archive |
| TZ-COST-302 | DONE | [recursive rollup](./TZ-COST-302-recursive-cost-rollup.md) → archive |
| TZ-COST-303 | DONE | [UI visibility](./TZ-COST-303-cost-visibility-ui.md) → archive |
| **TZ-COST-304** | **READY (завтра, docs)** | [product-line cost audit](./TZ-COST-304-product-line-cost-audit.md) |
| TZ-COST-305 | after 304 decisions | draft created by 304 closeout |

**PO pain (2026-08-08):** вставил изделие в состав, ввёл «сумму» в диалоге,
пересчитал себест. → 0. Причина: override на линии ≠ вход CostCalculation
(пока только material+module). 304 решает канон; 305 — код.
