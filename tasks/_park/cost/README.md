# Cost / себестоимость backlog

Аудит-база: [`docs/audits/2026-08-08-catalog-cost-pricing-hierarchy.md`](../../../docs/audits/2026-08-08-catalog-cost-pricing-hierarchy.md)

| ID | Status | File |
|----|--------|------|
| TZ-COST-301 | DONE | [hourlyRate required](./TZ-COST-301-work-type-hourly-rate-required.md) → archive |
| TZ-COST-302 | DONE | [recursive rollup](./TZ-COST-302-recursive-cost-rollup.md) → archive |
| TZ-COST-303 | DONE | [UI visibility](./TZ-COST-303-cost-visibility-ui.md) → archive |
| **TZ-COST-304** | **DONE (docs)** | [audit](../../../docs/audits/2026-08-09-product-line-cost-vs-override.md) → [archive](../../_archive/2026-08/TZ-COST-304.done.md) |
| **TZ-COST-305** | **READY / RESERVED** | [product-line in cost](./TZ-COST-305-product-line-in-cost.md) — после слота 336/335 |

**PO pain (2026-08-08):** вставил изделие в состав, ввёл «сумму» → себест. 0.  
**Канон 304:** D1=b (override×qty иначе child.costPrice×qty); D2=a (только линия);
D3=d (prefill cost→list); D4 «Цена в составе»; D5 no module override. **305 = код.**
