# SESSION QUEUE — close board (no mid-stops)

**Updated:** 2026-08-05 · queue closed · waiting PO deploy gate

## Must finish (in order)

| # | TZ | Status now |
|---|---|---|
| 0 | DICT-312 + UI-TABLE-302 | **DONE** (archived in base wave) |
| 1 | **TZ-UI-TABLE-305** | **DONE** — archived and locked |
| 2 | **TZ-UI-TABLE-303** | **DONE** — archived and locked |

## Explicitly NOT in this wave (do not ask PO)

| TZ | Why |
|---|---|
| **TZ-UI-TABLE-304** | Selectable/dense — backlog until warehouse ask (SoT). Leave status backlog. |

## Done when

- [x] `_active/` empty
- [x] 305 + 303 in `tasks/_archive/2026-08/*.done.md`
- [x] code committed + pushed on `main`
- [x] **READY FOR DEPLOY** — deploy itself was not run (PO gate)

---

## Checkpoint 2026-08-05T20:30+03:00 (Cursor / PO sync)

- **DONE:** TZ-UI-TABLE-305, TZ-UI-TABLE-303; session close-board checked; `main` = `origin/main` = `497fbdd`
- **IN PROGRESS:** none
- **NOT DONE:** warm deploy (`deploy/synology/deploy.ps1`, no wipe) — waiting explicit PO «поехали» / VPN off
- **NEXT:** on PO deploy OK → warm deploy + smoke health/FE; else idle / new TZ queue from PO
- **HEAD:** `497fbddae37d0c7fb1663776ede5ad24e7bf69c4`
- **_active/:** empty
- **Locks:** `TZ-UI-TABLE-302-tree-kit`, `TZ-UI-TABLE-305-flat-kit`, `TZ-UI-TABLE-303-expandable`
- **Do not commit:** `deploy/synology/__pycache__/`, `tasks/Данные/`
- **Blockers:** none (only PO deploy decision)
