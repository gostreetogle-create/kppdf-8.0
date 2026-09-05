# QUEUE-LIVE

| Slot | Волна | Статус |
|------|-------|--------|
| **#1** | Claude | **IDLE — org-scope harden DONE** (`TZ-BACKEND-ORDER-ORG-SCOPE-HARDEN.done.md`) |
| **#2** | Freebuff | polish P1–P5 in progress |

## NEXT (спеки готовы, промпты — по команде PO)

Цепочка: `docs/agent-checklists/WAVE-NX-GANTT-POLISH.md`  
P1 catalog-spec → P2 G8 → P3 G9 → P4 S43 → P5 G10 photos  

Claude: ждать новую TZ / PO команду. Known_limitation, если PO захочет полное
закрытие: `reserveStock`/`ship`/`cancel`/`remove` на Order всё ещё unscoped
(session-transaction-wrapped) — см. `docs/audits/2026-09-05-gantt-nx-l0-peer-review.md`.

PARK: legacy Gantt delete — только Да PO (`_backlog/nx/TZ-NX-GANTT-LEGACY-DECOMMISSION.md`)

## DONE

Gantt G0–G7 · Doc Studio FINISH · S42 · peer review · **org-scope harden (5 Order methods)**  
