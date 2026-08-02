# Active map — two-stream focus

**Updated:** 2026-08-02 (Cursor roadmap sync; peer cleanup may refine file moves)  
**Rule:** max **2** parallel execution streams. Index companion: `tasks/README.md`.

Cursor does **not** bulk-move `tasks/` (Mode A). Peer owns parking WORKERS/WORKTYPES/MODULES. This map states intent; disk may still list extra `TZ-*.md` until peer finishes.

## Stream A — text-block-category (local agents)

| ID | Status | Owner hint |
|----|--------|------------|
| TZ-DOC-316 | active / verify | after 315 |
| TZ-DOC-317 | active | filter on **palette** after DOC-325 |
| TZ-DOC-318 | **supersede after DOC-325** | topbar texts dropdown goes away |
| TZ-DOC-323 | DONE archive | — |
| TZ-DOC-320..322 | DONE | do not reopen |

## Stream A2 — doc-constructor UX (Cursor audit 2026-08-02)

| ID | Status | Owner hint |
|----|--------|------------|
| **TZ-DOC-324** | active | IA: templates registry vs builder |
| **TZ-DOC-325** | active | after 324 — restore palette, drop topbar dup menus |
| **TZ-DOC-326** | active | after 325/316 — categoryId UI, kill legacy hints |
| Audit note | `docs/agent-checklists/DOC-CONSTRUCTOR-UX-AUDIT.md` | |

Order: **324 → 325 → 326**. Max 2 streams overall with Stream B.

## Stream C — cross-page UX sweep (Cursor 2026-08-02)

| ID | Pages | Hint |
|----|-------|------|
| TZ-UX-301 | /inventory, /storage-items, /stock-movements | Склад nav |
| TZ-UX-302 | /categories | dead docCat |
| TZ-UX-303 | /documents, /dictionaries | labels |
| TZ-UX-304 | /color-references, /doc-template-categories | pi-table |
| TZ-UX-305 | orgs, work-types, storage, materials | page.md only |
| TZ-UX-306 | /people | align WORKERS-302 |
| Index | `docs/pages/PAGE-TZ-INDEX.md` | search page→TZ |

Parallel OK with DOC-324 if conflict keys disjoint (UX-301/303/305 safe).

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
