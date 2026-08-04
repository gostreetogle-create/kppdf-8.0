# Backlog queue — audit 2026-08-02

**Purpose:** parked TZ until PO un-parks. Not for bulk execution.  
**Companion:** `tasks/README.md` (active root) · `_archive/2026-08/` (DONE).

## How to use

| Action | When |
|--------|------|
| Keep here | Heavy / vision / after-deploy lifecycle |
| Promote to `tasks/` root | PO says «делай X» and DEPLOY-301 allows |
| Archive | Already shipped — don’t leave stale copy |

## DO NOW (done this audit pass)

| Item | Action taken |
|------|----------------|
| Склад nav (UX-301 false DONE) | Restored in `app-layout` + pageKeys |
| text-block-categories pageKey | Set on nav item |
| MATERIALS-308 | Archived — code already had `materialId` |

## KEEP — after first deploy (heavy)

| Cluster | IDs | Why parked |
|---------|-----|------------|
| **Production / Gantt** | PRODUCTION-301…307, `vision/GANT-calendar` | Needs people, work-types days, CORE snapshots |
| **Commerce chain** | CORE-301 → INVENTORY-301 → PROCUREMENT-301 → SHIPPING-301 → DOC-330 → ARCHIVE-301 | Multi-day domain |
| **Products flag** | PRODUCTS-306 | After PRODUCTION-301 |
| **People** | UX-306 | **DONE 2026-08-04** → `tasks/_archive/2026-08/TZ-UX-306.done.md` |
| **Route ACL** | ACCESS-303 | Medium — deep-link gates (nav filter partially done) |
| **Nav ACL residual** | ACCESS-304 | **DONE 2026-08-04** → `tasks/_archive/2026-08/TZ-ACCESS-304.done.md` |
| **RBAC docs/lite** | RBAC-302, 303 | Docs/policy; RBAC-304 **DONE 2026-08-04** → archive |
| **Z-series** | Z-002…007 + Z-001 pointer | Platform; Z-001 already DONE in archive |

## Pointers (not re-work)

- `TZ-ORDERS-301-*.md` → archive DONE  
- `z-series/.../Z-001-*.md` → archive DONE (keep as index pointer only)

## Not deploy blockers

Everything in this folder. Deploy gate = **`tasks/TZ-DEPLOY-301`** only.
