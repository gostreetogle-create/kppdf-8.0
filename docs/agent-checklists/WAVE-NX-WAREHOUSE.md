# WAVE-NX-WAREHOUSE — склад на NX (движок UI)

**Audit:** `docs/audits/2026-09-05-warehouse-nx-port-audit.md`
**Параллель:** `PARALLEL-SLOTS-WAREHOUSE-SUPPLY.md`
**Промпт:** `tasks/PROMPT-FREEBUFF-NX-WAREHOUSE.md`
**BE ledger:** Z-001 DONE — не переписывать транзакции.

| # | SIZE | TZ | Path | Status |
|---|------|-----|------|--------|
| W1 | L | Shell: routes + nav «Склад» + thin warehouses | `tasks/_ready/nx-warehouse/TZ-NX-WAREHOUSE-W1-SHELL.md` | DONE |
| W2 | L | Остатки: list / put / adjust / materialId | `tasks/_ready/nx-warehouse/TZ-NX-WAREHOUSE-W2-BALANCES.md` | READY |
| W3 | L | Движения: list + приход/расход | `tasks/_ready/nx-warehouse/TZ-NX-WAREHOUSE-W3-MOVEMENTS.md` | READY |
| W4 | S | FIC + page.md NX notes + DOMAIN-MAP | `tasks/_ready/nx-warehouse/TZ-NX-WAREHOUSE-W4-CLOSEOUT.md` | READY |

**Порядок:** W1 → W2 → W3 → W4 (один Freebuff continuous).
**W1 DONE:** archive `tasks/_archive/2026-09/TZ-NX-WAREHOUSE-W1-SHELL.done.md`; W2 is READY for the next claim.

**Не порт:** `/inventory` dashboard; warehouse types UI; zones UI; transfer create; shipping (отдельный модуль).

### PO defaults (зафиксировано аудитом)
1. Разделы = именованные `Warehouse` (Металл, Метизы…).
2. Форма: имя + активен (+ описание опц.); type=`main` скрыт.
3. Один ledger-движок; N имён — ок.
