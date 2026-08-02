# Active map — two-stream focus

**Updated:** 2026-08-02 (Cursor roadmap sync; peer cleanup may refine file moves)  
**Rule:** max **2** parallel execution streams. Index companion: `tasks/README.md`.

Cursor does **not** bulk-move `tasks/` (Mode A). Peer owns parking WORKERS/WORKTYPES/MODULES. This map states intent; disk may still list extra `TZ-*.md` until peer finishes.

## Stream A — text-block-category (local agents)

| ID | Status | Owner hint |
|----|--------|------------|
| TZ-DOC-316 | active | after 315 |
| TZ-DOC-317 | active | after 316 |
| TZ-DOC-318 | active | after 317 |
| TZ-DOC-323 | active | peer (legacy enum) |
| TZ-DOC-320..322 | DONE in `_archive/2026-08/` | do not reopen |
| TZ-DOC-319 | peer spacer | cross-check only |

## Stream B — inventory integrity (P0)

| ID | Status | Owner hint |
|----|--------|------------|
| **Z-001** | **activated** `tasks/Z-001-inventory-write-transactions.md` | **local/Gemini executor**; Cursor = spec only (Mode A) |
| Checklist | `docs/agent-checklists/Z-001.md` | |

Do **not** parallel Z-001 with TZ-MATERIALS-308 (`stock-movement.service.ts`).

## Park / verify (not Stream A/B)

| Cluster | Note |
|---------|------|
| TZ-MATERIALS-307..309 | Still on disk; **not** archived DONE (archive only …306). Verify before execute or park to `_backlog`. |
| TZ-WORKERS-*, TZ-WORKTYPES-* | Peer → `_backlog` |
| TZ-MODULES-301/302 | Peer → `_backlog` |
| Extra TZ-PRODUCTS-* | Peer park; do not open new domains this week |
| Z-002..Z-007 | Stay in `tasks/_backlog/z-series/` until after Z-001 |

## Conflict snapshot

```
Stream A  ≈  frontend doc-constructor / text-block UI (+ DOC-323 backend enum)
Stream B  ≈  shipment / purchase-order / order / stock-movement / reservation
```

If peer updates this file after cleanup, keep Stream A/B rows authoritative and list parked IDs under Park.
