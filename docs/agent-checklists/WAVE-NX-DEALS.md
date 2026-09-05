# WAVE-NX-DEALS — рабочее место сделок на NX

**Peer:** Claude 2026-09-05 (ответ на `PROMPT-CLAUDE-DEALS-NX-PEER`) — принят Cursor.  
**Audits:** `docs/audits/2026-09-05-deals-nx-migration-audit.md` (+ § Peer ниже)  
**IA:** гибрид C→A — сначала hub на `/orders`; **`/desk` не в этой волне** (отдельный ADR по команде PO).  
**Промпт:** `tasks/PROMPT-FREEBUFF-NX-DEALS.md`  
**Не смешивать** с Gantt-registries / DocStudio Data IA / G14 FE.

| # | SIZE | TZ | Path | Status |
|---|------|-----|------|--------|
| D1 | L | TOC chrome + eyebrow «Сделки» | `tasks/_archive/2026-09/TZ-NX-DEALS-D1-TOC-CHROME.done.md` | DONE |
| D2 | L | Hub tray + list expand/columns | `tasks/_archive/2026-09/TZ-NX-DEALS-D2-HUB-TRAY.done.md` | DONE |
| D3 | S | Counterparties thin page | `tasks/_archive/2026-09/TZ-NX-DEALS-D3-COUNTERPARTIES.done.md` | DONE |
| D4 | S | Contracts thin list+card | `tasks/_archive/2026-09/TZ-NX-DEALS-D4-CONTRACTS-THIN.done.md` | DONE |
| D5 | S | Inset audit + page.md | `tasks/_archive/2026-09/TZ-NX-DEALS-D5-INSET-AUDIT.done.md` | DONE |

**Порядок:** D1 → D2 → D3 → D4 → D5 (один Freebuff continuous; один `kppdf-web` build).  
D3/D4 не параллелить с другим агентом на `app.routes.ts`.

### PO defaults (Claude H — принято Cursor)

1. Сначала `/orders` hub, `/desk` позже — **Да**.  
2. Договоры thin в этой волне — **Да**.  
3. Заказчики в этой волне после hub — **Да** (после D2, не блокер D2).
