# SESSION QUEUE — 2026-08-08 hygiene

**Updated:** 2026-08-08 · TZ-COST-304 READY (завтра, docs audit)

## DONE recently (archive + lock on main)

| Item | SHA / note |
|------|------------|
| TZ-OPS-301 | `f12c2d8` |
| TZD-17 … TZD-20 | archives |
| **TZD-22** | `e64e81f` |
| TZ-CATALOG-330 … **334** | 334 on main |
| TZ-COST-301…**303** | `cec4804` |
| **TZD-24** | archive / zip download |
| TZ-PRODUCTION-303.1 / 303.1b | archives |

## READY (не сделано — выдавать по PO)

| Priority | ID | Path |
|----------|-----|------|
| 0 | **TZ-COST-304** | `tasks/_backlog/cost/TZ-COST-304-product-line-cost-audit.md` (docs · завтра) |
| 1 | **TZD-21** | `tasks/_backlog/desktop/TZD-21-desktop-pairing-keys-ttl.md` |

## IN PROGRESS (CLAIMED)

_(empty)_

## READY FOR REVIEW

_(empty)_

## PARK (не трогать без un-park)

| Stream | Items |
|--------|--------|
| Desktop | TZD-18, TZD-19, **TZD-23** (только по PO, после 22 DONE) |
| Cost | TZ-COST-305 (после решений 304) |
| Production | 300–310, DRAWINGS-301, … |
| Other | SHIPPING-301, INVENTORY-301, PROCUREMENT-301, ARCHIVE-301, DOC-330, RBAC-302/303, … |

## Masters (не задачи в очереди)

`tasks/TZ-CATALOG-300.md`, `tasks/TZ-DICT-300.md` — индексы волн, оставить в корне.

## Checkpoint 2026-08-08 (COST-304 queued)
- DONE: TZ-COST-301…303, TZD-22, TZD-24, CATALOG-334
- IN PROGRESS: _(none)_
- READY FOR REVIEW: _(none)_
- NOT DONE: **TZ-COST-304** (product-line «сумма» vs себест.); TZD-21; TZD-23 park
- NEXT: **TZ-COST-304 audit завтра** → TZ-COST-305 → TZD-21
- Blockers: на стенде override в составе не входит в CostCalculation (ожидаемо до 305)
- _active/: _(empty)_
- Deploy: NO until PO
