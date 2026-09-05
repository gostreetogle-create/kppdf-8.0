# WAVE-NX-WAREHOUSE — склад на NX (движок UI)

**Audit:** `docs/audits/2026-09-05-warehouse-nx-port-audit.md`
**Параллель:** `PARALLEL-SLOTS-WAREHOUSE-SUPPLY.md`
**Промпт:** `tasks/PROMPT-FREEBUFF-NX-WAREHOUSE.md`
**BE ledger:** Z-001 DONE — не переписывать транзакции.

| # | SIZE | TZ | Path | Status |
|---|------|-----|------|--------|
| W1 | L | Shell: routes + nav «Склад» + thin warehouses | `tasks/_archive/2026-09/TZ-NX-WAREHOUSE-W1-SHELL.done.md` | DONE |
| W2 | L | Остатки: list / put / adjust / materialId | `tasks/_archive/2026-09/TZ-NX-WAREHOUSE-W2-BALANCES.done.md` | DONE |
| W3 | L | Движения: list + приход/расход | `tasks/_archive/2026-09/TZ-NX-WAREHOUSE-W3-MOVEMENTS.done.md` | DONE |
| W4 | S | FIC + page.md NX notes + DOMAIN-MAP | `tasks/_archive/2026-09/TZ-NX-WAREHOUSE-W4-CLOSEOUT.done.md` | DONE |

**Порядок:** W1 → W2 → W3 → W4 (один Freebuff continuous). W1–W4 DONE (`d9631c00`, `f7b9242a`, `7f90a28d`, W4 docs-only).

**Не порт:** `/inventory` dashboard; warehouse types UI; zones UI; transfer create; shipping (отдельный модуль).

### PO defaults (зафиксировано аудитом)
1. Разделы = именованные `Warehouse` (Металл, Метизы…).
2. Форма: имя + активен (+ описание опц.); type=`main` скрыт.
3. Один ledger-движок; N имён — ок.

## W4 evidence (DoD)

- [x] `docs/DOMAIN-MAP.md` — Warehouse row + route table say **live** (W1–W3), not gap/placeholder.
- [x] `docs/pages/PAGE-TZ-INDEX.md` — `/warehouses`, `/storage-items`, `/stock-movements` rows marked W1/W2/W3 **DONE**.
- [x] `docs/pages/{warehouses,storage-items,stock-movements}.page.md` — NX SoT/implementation notes already present (written during W1–W3); legacy `frontend/` remains the cutover reference, unchanged.
- [x] `docs/FEATURE-INTEGRATION-CHECKLIST.md` §A — one-line closure note: port of pre-existing routes/pages, no new route/permission/seed row, so §A checklist items don't apply (same style as the `/production` precedent already in that file).
- [x] `docs/CAPABILITY-LEDGER.md` — `Warehouse: warehouses, stock, movements` already `included`; accurate as-is, no change needed.
- [x] No product code changed (docs-only TZ; the one code fix from W3 — a duplicated barrel export — was already committed in the W3 commit, not here).
- **WAVE status: DONE.**
