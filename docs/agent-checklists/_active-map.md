# SESSION QUEUE — 2026-08-08 hygiene

**Updated:** 2026-08-08T00:10:00Z · TZD-22 archived (Cursor PASS); COST-302 still READY FOR REVIEW

## DONE recently (archive + lock on main)

| Item | SHA / note |
|------|------------|
| TZ-OPS-301 | `f12c2d8` |
| TZD-17 … TZD-20 | archives |
| **TZD-22** | `e64e81fca6514e0ad2ad9ae6a9b9a8820a7d8871` |
| TZ-CATALOG-330 … **334** | 334 on main |
| TZ-COST-301 | `79edbea` |
| TZ-PRODUCTION-303.1 / 303.1b | archives |

## READY (не сделано — выдавать по PO)

| Priority | ID | Path |
|----------|-----|------|
| 1 | **TZ-COST-303** | after 302 archive · UI visibility |
| 2 | **TZD-21** | `tasks/_backlog/desktop/TZD-21-desktop-pairing-keys-ttl.md` |

## IN PROGRESS (CLAIMED)

_(empty)_

## READY FOR REVIEW

| ID | agent_id | notes |
|----|----------|-------|
| **TZ-COST-302** | cursor-composer-cost302 | gates green; **await Cursor PASS** before archive |

## PARK (не трогать без un-park)

| Stream | Items |
|--------|--------|
| Desktop | TZD-18, TZD-19, **TZD-23** (только по PO, после 22 DONE) |
| Production | 300–310, DRAWINGS-301, … |
| Other | SHIPPING-301, INVENTORY-301, PROCUREMENT-301, ARCHIVE-301, DOC-330, RBAC-302/303, … |

## Masters (не задачи в очереди)

`tasks/TZ-CATALOG-300.md`, `tasks/TZ-DICT-300.md` — индексы волн, оставить в корне.

## Checkpoint 2026-08-08T00:10:00Z
- DONE: TZ-COST-301, **TZD-22** (Cursor PASS → archive)
- IN PROGRESS: _(none)_
- READY FOR REVIEW: **TZ-COST-302**
- NOT DONE: TZ-COST-303, TZD-21; TZD-23 park until PO
- NEXT: Cursor PASS on COST-302 → archive; TZD-21 only on PO; **no TZD-23 / no deploy**
- HEAD: e64e81fca6514e0ad2ad9ae6a9b9a8820a7d8871 (TZD-22)
- Blockers: none
- _active/: TZ-COST-302.md
- Deploy: NO
