# WAVE-NX-SHIPPING — отгрузка на NX

**Audit:** `docs/audits/2026-09-08-shipping-nx-port-audit.md`  
**Эталон:** legacy `frontend/.../shipping/shipping.page.ts` + `docs/pages/shipping.page.md`  
**Промпт:** `tasks/PROMPT-CLAUDE-NX-SHIPPING.md`  
**Исполнитель:** `agent_id: claude` continuous  
**Статус:** S0–S4 DONE — WAVE DONE

| # | SIZE | TZ | Path | Status |
|---|------|-----|------|--------|
| S0 | L | Data-access shipments + Orders.ship | `tasks/_ready/nx-shipping/TZ-NX-SHIP-S0-DATA-ACCESS.md` | DONE (`d1e0a04b`) |
| S1 | L | Registry `/shipping` + nav + route | `tasks/_ready/nx-shipping/TZ-NX-SHIP-S1-REGISTRY.md` | DONE (`d027275c`) |
| S2 | L | Hub tray READ shipments | `tasks/_ready/nx-shipping/TZ-NX-SHIP-S2-HUB-READ.md` | DONE (`ae22acff`) |
| S3 | L | Hub ship-without-doc | `tasks/_ready/nx-shipping/TZ-NX-SHIP-S3-HUB-SHIP.md` | DONE (`cfd5292c`) |
| S4 | S | Hub cancel до dispatch | `tasks/_ready/nx-shipping/TZ-NX-SHIP-S4-HUB-CANCEL.md` | DONE |

**Порядок:** S0 → S1 → S2 → S3 (один Claude continuous; implicit `nx build kppdf-web`). Затем отдельно `PROMPT-CLAUDE-NX-SHIP-S4-CANCEL.md`.

**PO lock:** списание склада только на dispatch; отмена до dispatch на реестре; документ опционален; ship из hub = whole-order `POST /orders/:id/ship` + метаданные; `/desk` — не эта волна.

**Не в волне:** `/desk`; Purchase*; hard-delete shipped; BE schema rewrite; legacy `frontend/` sync; Excel.
