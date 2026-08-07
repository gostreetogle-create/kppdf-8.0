# SESSION QUEUE — 2026-08-08 hygiene

**Updated:** 2026-08-08T00:10:00Z · TZ-CATALOG-334 DONE

## DONE recently (archive + lock on main)

| Item | SHA / note |
|------|------------|
| TZ-OPS-301 | `f12c2d8` |
| TZD-17 … TZD-20 | archives |
| TZ-CATALOG-330 … **334** | 334 · `0f90243` |
| TZ-COST-301 | `79edbea` |
| TZ-PRODUCTION-303.1 / 303.1b | archives (root copies removed) |

## READY (не сделано — выдавать по PO)

| Priority | ID | Path |
|----------|-----|------|
| 1 | **TZ-COST-303** | after 302 archive · UI visibility |
| 2 | **TZD-21** | `tasks/_backlog/desktop/TZD-21-…` |

## IN PROGRESS (CLAIMED)

_(empty)_

## READY FOR REVIEW

| ID | agent_id | notes |
|----|----------|-------|
| **TZ-COST-302** | cursor-composer-cost302 | gates green; **await Cursor PASS** before archive |
| **TZD-22** | cursor-composer-tzd22 | Import Task; **await Cursor PASS** before archive |

## PARK (не трогать без un-park)

| Stream | Items |
|--------|--------|
| Desktop | TZD-18, TZD-19, TZD-23 (после 22) |
| Production | 300–310, DRAWINGS-301, … |
| Other | SHIPPING-301, INVENTORY-301, PROCUREMENT-301, ARCHIVE-301, DOC-330, RBAC-302/303, … |

## Masters (не задачи в очереди)

`tasks/TZ-CATALOG-300.md`, `tasks/TZ-DICT-300.md` — индексы волн, оставить в корне.

## Checkpoint 2026-08-08T00:10:00Z
- DONE: TZ-CATALOG-334 (nest cohesion)
- IN PROGRESS: _(none)_
- READY FOR REVIEW: **TZ-COST-302**, **TZD-22** (archive only after Cursor/PO PASS)
- NOT DONE: TZ-COST-303, TZD-21; TZD-23 park
- NEXT: Cursor PASS → archive 302 and/or 22
- HEAD: `0f90243` (+ uncommitted TZD-22 / COST-302 peer WIP)
- Blockers: none · Team Room claim 334 unavailable (best-effort send)
- _active/: TZ-COST-302.md, TZD-22.md
- Deploy: NO
