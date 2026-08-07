# DAY — себестоимость / иерархия цен 301→303

**Дата:** 2026-08-08  
**Аудит:** `docs/audits/2026-08-08-catalog-cost-pricing-hierarchy.md`  
**Канон:** себестоимость rollup; `listPrice` = коммерция; Виды работ остаются в Каталоге.

| Order | TZ | File | Depends |
|-------|-----|------|---------|
| 1 | **TZ-COST-301** | [TZ-COST-301-work-type-hourly-rate-required.md](./TZ-COST-301-work-type-hourly-rate-required.md) | — |
| 2 | **TZ-COST-302** | [TZ-COST-302-recursive-cost-rollup.md](./TZ-COST-302-recursive-cost-rollup.md) | 301 |
| 3 | **TZ-COST-303** | [TZ-COST-303-cost-visibility-ui.md](./TZ-COST-303-cost-visibility-ui.md) | 302 |

**Правило:** claim → code → gates → Cursor PASS → archive → commit/push → next.  
Не stage чужой dirty (CATALOG-331, desktop icons, page-chrome mass). Deploy: NO.
