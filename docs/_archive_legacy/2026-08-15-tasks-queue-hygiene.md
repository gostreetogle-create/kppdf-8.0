# Audit — tasks queue hygiene (2026-08-15)

Цель: live queue = только PO-critical AUTH-305; остальное park/backlog/archive.

## Spent → archive (sibling / prior waves)

Sibling hygiene уже убрал root spent specs (не трогали HUB/SALES/UX/CATALOG/FRONTEND-302 в этом проходе):

- `tasks/_archive/2026-08/specs-spent/` — ORDERS-HUB, SALES-370…378, UX-318/319/321, CATALOG-371…373, FRONTEND-301/302-A*, DOC-TABLES, AUTH-303/304/306 и др.
- DONE markers — `tasks/_archive/2026-08/*.done.md` (waves prior).
- После hygiene root `tasks/TZ-*.md` = только **AUTH-305**.

## Remains for PO (live)

| Path | Role |
|------|------|
| `tasks/_active/TZ-AUTH-305.md` | единственный `_active` marker |
| `tasks/TZ-AUTH-305-device-access-rollout.md` | root KEEP / linked from active |
| `docs/agent-checklists/TZ-AUTH-305.md` | PREP; deploy только по «деплой» |

## Park / backlog (not live)

| Path | Note |
|------|------|
| `tasks/_park/TZ-AUTH-307-auth-cutover-cleanup.md` | PARKED; blocked on 305 cutover + PO |
| `tasks/_backlog/TZ-FRONTEND-304-composition-container-boundary.md` | READY, not claimed |
| `tasks/_backlog/TZ-UX-322-page-tools-into-chrome-rail.md` | verified stay |
| `tasks/_backlog/TZ-SALES-377-kp-continuation-background-table.md` | verified stay |

## This hygiene pass

1. AUTH-307: root → `_park/`; checklist Status → PARKED.
2. FRONTEND-304: root → `_backlog/`; checklist → BACKLOG.
3. `_NOW.md`: ACTIVE = AUTH-305 only.
