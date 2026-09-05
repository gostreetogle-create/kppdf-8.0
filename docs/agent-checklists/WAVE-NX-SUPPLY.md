# WAVE-NX-SUPPLY — снабжение + «в работу» ↔ склад

**Audit:** `docs/audits/2026-09-05-warehouse-nx-port-audit.md`  
**Параллель:** `PARALLEL-SLOTS-WAREHOUSE-SUPPLY.md`  
**Промпт:** `tasks/PROMPT-CLAUDE-NX-SUPPLY.md`  
**Зависит:** W1 shell DONE перед S1 (routes); S0 BE может идти параллельно с WAVE-WAREHOUSE.

| # | SIZE | TZ | Path | Status |
|---|------|-----|------|--------|
| S0 | L | BE: availability + reserve + shortage→SupplyRequest | `tasks/_archive/2026-09/TZ-NX-SUPPLY-S0-KIT-RESERVE-BE.done.md` | **DONE** |
| S1 | L | NX `/supply` реестр (без mock quick) | `tasks/_ready/nx-supply/TZ-NX-SUPPLY-S1-PAGE.md` | READY (blocked on W1 DONE) |
| S2 | L | Order hub: confirm материалов / deep-link supply | `tasks/_ready/nx-supply/TZ-NX-SUPPLY-S2-HUB-CONFIRM.md` | READY (blocked on S1) |

**Порядок:** S0 DONE (∥ Freebuff W1/W2) → после W1 archive: S1 → S2.  
**Не порт:** Supply quick mock как SoT; Purchase*/Tender UI; жёсткий стоп производства при нехватке.
