# SESSION QUEUE

**Updated:** 2026-08-08 · shop-north B continuous queue

## Checkpoint (wave A COMPLETE — 2026-08-08)

- **DONE wave desktop bulk-import (A):** **TZD-23** · **TZD-26** · **TZD-18** ·
  **TZD-19** · **TZD-27** · **TZD-28** · **TZD-29** — все 7 на main, archived,
  locks + checklists + progress + STATUS обновлены. `tasks/_active/` пуст.
- **NEXT A: idle** — desktop bulk-import волна готова; деплой (desktop ZIP + BE)
  только по отдельной команде PO.
- READY B (shop-north): SUPPLY-302 → ORDERS-304 → 305 → SALES-302 → FACT-303 → 304 → FORM-307
  (исполнитель B продолжает свою очередь — не трогаю conflict keys)
- SoT: `D:\kppdf-8.0` main
- Ban cross-touch: desktop/mcp/import-task/journal ↔ shop-north keys
- Deploy: NO

## Checkpoint 2026-08-08T11:00:00Z
- DONE: TZ-SUPPLY-302 — BOM explode → idempotent SupplyTasks, archived/locked
- IN PROGRESS: none
- NOT DONE: ORDERS-304 → ORDERS-305 → SALES-302 → FACT-303 → FACT-304 → FORM-307
- NEXT: claim TZ-ORDERS-304
- HEAD: pre-commit
- Blockers: none
- _active/: empty after closeout

## PARK

SALES-304 · SHIPPING · Gantt 308–310
