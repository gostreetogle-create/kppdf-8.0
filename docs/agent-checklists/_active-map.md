# SESSION QUEUE — continuous executor

**Updated:** 2026-08-08T08:20Z · **DICT-315 DONE · queue idle**

## DONE this session

| Item | SHA / note |
|------|------------|
| **TZ-ORDERS-302** | live BOM |
| **TZ-ORDERS-303** | party+site+line owner |
| **TZ-NAV-301** | lifecycle menu + stubs |
| **TZ-SUPPLY-301** | SupplyTask + confirm + `/supply` |
| **TZ-SALES-303** | KP family schema + thin API (D21 L1) |
| **TZ-DICT-315** | form-profiles settings UI (STRICT carve) |

## READY / NEXT

| ID | Status |
|----|--------|
| **TZ-DICT-316** | READY after 315 (QuickCreate wire) — claim next if map allows |
| TZ-SALES-304 | READY stub (UI after PO probes API) — not auto-claim |

## PARK

| ID | Why |
|----|-----|
| TZD-23 | PARK |
| SUPPLY-302 | BOM auto-explode (after 301) |
| deploy | только «задеплой» |

## Checkpoint 2026-08-08T08:20Z
- DONE: … + SALES-303 + **TZ-DICT-315**
- IN PROGRESS: none
- NEXT: DICT-316 (QuickCreate) if PO queue says so; else idle / propose deploy
- Blockers: none
- _active/: empty
- Deploy: NO
- HEAD: (post-315 commit)
