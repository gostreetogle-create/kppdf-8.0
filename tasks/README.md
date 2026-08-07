# Active TZ backlog index

**Verified:** 2026-08-07 · stabilize · `D:\kppdf-8.0`  
**Hygiene:** DONE stubs removed from `_backlog` after archive; open queue only.  
**Board:** `docs/agent-checklists/_active-map.md`

## Tonight — stabilize (не каталог)

| Item | Path | Status |
|------|------|--------|
| **303.1** Gantt hotfix + `?q=` | `tasks/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md` | READY → executor IN FLIGHT |
| Handoff prompt | `tasks/HANDOFF-PRODUCTION-303.1-executor-prompt.md` | PO → 2nd AI |
| Cursor wait | `docs/agent-checklists/CURSOR-WAIT-303.1.md` | WAITING |
| PO smoke | `docs/pages/production-cockpit-smoke-303.1.md` | after push 303.1 |

**Hard ban until smoke:** 304–307, drag, SHIPPING, YouGile product import, SECURITY-MT без peer-файла.

## Closed (recent)

| Stream | Archive |
|--------|---------|
| Catalog Wave 1 (301–305, 316/317/319) | `_archive/2026-08/` |
| CATALOG-310, 312, 313 | `_archive/2026-08/` |
| TZD-05, 11, 12, 13 | `_archive/2026-08/` |
| PRODUCTION-303 | `_archive/2026-08/` |
| Warehouse pack B | docs/`SECTION-READINESS.md` |

## Still in `tasks/` root (intentional)

| File | Why |
|------|-----|
| `TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md` | today’s executor TZ |
| `HANDOFF-PRODUCTION-303.1-executor-prompt.md` | copy-paste for 2nd AI |
| `CATALOG-WAVE1.md` / `DICT-WAVE1.md` | wave indexes |
| `TZ-CATALOG-300.md` / `TZ-DICT-300.md` | canon |
| `README.md` | this index |

## Parked open (after 303.1 smoke)

- Production: 308 → 309 (before resize) → 310; DRAWINGS-301; 304–307 later
- Shipping: TZ-SHIPPING-301
- Security residual: `_backlog/TZ-SECURITY-MT-FOLLOWUP-park.md` (needs peer AUDIT file)
- Catalog: 314 → 320 → 311 → 315
- Desktop: TZD-14/15 in `_backlog/desktop/`
- Other: Z-series, procurement, UI-TABLE-304

**Rule:** after archive, delete `_backlog` source stub (keep archive). Never `git add .` with чужой dirty.
