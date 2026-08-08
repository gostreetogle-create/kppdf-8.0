# SESSION QUEUE — continuous executor

**Updated:** 2026-08-08T08:15Z · **TZ-SALES-303 DONE · queue idle (DICT-315 blocked)**

## DONE this session

| Item | SHA / note |
|------|------------|
| **TZ-ORDERS-302** | live BOM |
| **TZ-ORDERS-303** | party+site+line owner |
| **TZ-NAV-301** | lifecycle menu + stubs |
| **TZ-SUPPLY-301** | SupplyTask + confirm + `/supply` |
| **TZ-SALES-303** | KP family schema + thin API (D21 L1) |

## READY / NEXT

| ID | Status |
|----|--------|
| TZ-SALES-304 | READY stub (UI after PO probes API) — not auto-claim |
| **TZ-DICT-315** | blocked / dictionaries WIP |
| TZ-DICT-316 | after 315 |

## PARK

| ID | Why |
|----|-----|
| TZD-23 | PARK |
| SUPPLY-302 | BOM auto-explode (after 301) |
| deploy | только «задеплой» |

## Checkpoint 2026-08-08T08:15Z
- DONE: TZ-ORDERS-302/303 + NAV-301 + SUPPLY-301 + **TZ-SALES-303**
- IN PROGRESS: none
- NEXT: idle — SALES-304 only on PO; DICT-315 blocked; ready to propose deploy on PO command
- Blockers: DICT-315 peer WIP on dictionaries/**
- _active/: empty
- Deploy: NO (await PO)
- HEAD: (post-303 commit)
