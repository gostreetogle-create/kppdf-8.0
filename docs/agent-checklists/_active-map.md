# SESSION QUEUE — 2026-08-08 hygiene

**Updated:** 2026-08-08 · TZD-24 READY (installer ZIP)

## DONE recently (archive + lock on main)

| Item | SHA / note |
|------|------------|
| TZ-OPS-301 | `f12c2d8` |
| TZD-17 … TZD-20 | archives |
| **TZD-22** | `e64e81f` |
| TZ-CATALOG-330 … **334** | 334 on main |
| TZ-COST-301 | `79edbea` |
| **TZ-COST-302** | `9676155` |
| **TZ-COST-303** | `cec4804` |
| TZ-PRODUCTION-303.1 / 303.1b | archives |

## READY (не сделано — выдавать по PO)

| Priority | ID | Path |
|----------|-----|------|
| 0 | **TZD-24** | `tasks/_backlog/desktop/TZD-24-desktop-installer-zip-download.md` |
| 1 | **TZD-21** | `tasks/_backlog/desktop/TZD-21-desktop-pairing-keys-ttl.md` |

## IN PROGRESS (CLAIMED)

_(empty)_

## READY FOR REVIEW

_(empty)_

## PARK (не трогать без un-park)

| Stream | Items |
|--------|--------|
| Desktop | TZD-18, TZD-19, **TZD-23** (только по PO, после 22 DONE) |
| Production | 300–310, DRAWINGS-301, … |
| Other | SHIPPING-301, INVENTORY-301, PROCUREMENT-301, ARCHIVE-301, DOC-330, RBAC-302/303, … |

## Masters (не задачи в очереди)

`tasks/TZ-CATALOG-300.md`, `tasks/TZ-DICT-300.md` — индексы волн, оставить в корне.

## Checkpoint 2026-08-08 (downloads)
- DONE: TZ-COST-301…**303**, TZD-22, CATALOG-334; composition UX polish
- IN PROGRESS: _(none)_
- READY FOR REVIEW: _(none)_
- NOT DONE: **TZD-24** (кнопка Скачать → HTML вместо installer); TZD-21; TZD-23 park
- NEXT: **TZD-24** (ZIP + SPA skip `/downloads`); потом TZD-21
- Blockers: prod `/downloads/*.exe` отдаёт SPA `index.html` (~1.5KB) — CSP-шум
- _active/: _(empty)_
- Deploy: NO until PO + после TZD-24 (нужен zip в browser/downloads)
