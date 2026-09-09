# WAVE-NX-UX-PAGE-SWEEP — постраничный UX (кнопки / таблицы / select / expand)

**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`  
**Очередь промптов:** `docs/agent-checklists/CLAUDE-UX-PAGE-PROMPTS.md`  
**Правило PO:** один промпт = одна страница; выдавать только по «дай следующий промпт».  
**Агент:** `agent_id: claude` — сначала AUDIT, потом FIX (находки на той же странице — чинить сразу).  
**Статус:** continuous tail READY · `tasks/PROMPT-CLAUDE-UX-CONTINUOUS-REMAINING.md` · чеклист `UX-SWEEP-CONTINUOUS-CHECKLIST.md`

| # | Route | PROMPT | Status |
|---|-------|--------|--------|
| 00 | `/kit/overview` | `tasks/PROMPT-CLAUDE-UX-00-kit-overview.md` | **DONE** — audit PASS-EMPTY, FIX N/A `c516e40d` |
| 01 | `/kit/forms` | `tasks/PROMPT-CLAUDE-UX-01-kit-forms.md` | **DONE** — audit `b46d239e`, FIX `4f7afcc8` (P1+P2) |
| 02 | `/kit/overlays` | `tasks/PROMPT-CLAUDE-UX-02-kit-overlays.md` | **DONE** — audit `2f1765dc`, FIX `7307e97b` |
| 03 | `/registries` | `tasks/PROMPT-CLAUDE-UX-03-registries.md` | **DONE** — gold PASS-EMPTY `4be40d78` |
| 04 | `/orders` | `tasks/PROMPT-CLAUDE-UX-04-orders.md` | **DONE** — audit `e010b83d`, FIX `b05802df` |
| 05 | `/shipping` | `tasks/PROMPT-CLAUDE-UX-05-shipping.md` | **DONE** — audit `5586dc55`, FIX `3c70d95c` (expand-in-row + chip button) |
| 06 | `/supply` | `tasks/PROMPT-CLAUDE-UX-06-supply.md` | **DONE** — audit `af549dfd`, FIX `a2e1353d` (expand-in-row + chip button) |
| 07 | `/supply-requests` | `tasks/PROMPT-CLAUDE-UX-07-supply-requests.md` | **DONE** — audit `f6707094`, FIX `d0f83db8` (expand-in-row + 4× chip button) |
| 08 | `/warehouses` | `tasks/PROMPT-CLAUDE-UX-08-warehouses.md` | **DONE** — FIX `71b57377` (`app-pi-button`) |
| **08b** | **cross-cut `pi-button-*` → `<app-pi-button>`** | `tasks/PROMPT-CLAUDE-UX-08b-PI-BUTTON-SWEEP.md` | **DONE** — `f491c5d8`, 16 files, `rg` count=0 |
| 09 | `/storage-items` | `tasks/PROMPT-CLAUDE-UX-09-storage-items.md` | **DONE** — `d0458654` (expand-in-row + material chip reset) |
| 10 | `/stock-movements` | `tasks/PROMPT-CLAUDE-UX-10-stock-movements.md` | **DONE** — `5906bf4a` (expand-in-row via TableComponent's own [expandedRow]) |
| 11 | `/production` | — | **SKIP** (Гант ок — PO 2026-09-09, не трогать) |
| 12 | `/proposals` | `tasks/PROMPT-CLAUDE-UX-12-proposals.md` | **DONE** — `d91dd517` (counterparty subtitle + 3× underline→.pi-outline-btn) |
| 13 | `/counterparties` | `tasks/PROMPT-CLAUDE-UX-13-counterparties.md` | **DONE** — `47e2d199` (full name subtitle) |
| 14 | `/contracts` | `tasks/PROMPT-CLAUDE-UX-14-contracts.md` | **DONE** — `19ff92fc` (detail card: attachment status + signed/expires + notes) |
| 15 | `/studio` | `tasks/PROMPT-CLAUDE-UX-15-studio-list.md` | READY (list/templates only) |
| 16 | `/admin/devices` | `tasks/PROMPT-CLAUDE-UX-16-admin-devices.md` | READY |
| 17 | `/admin/roles` | `tasks/PROMPT-CLAUDE-UX-17-admin-roles.md` | READY |

## Порядок

00→10, **пропуск 11**, 12→17. Не параллелить два UX FIX на `kppdf-web`.

## После каждой волны

Cursor сверяет → **ждёт** PO «дай следующий промпт» → один copy-paste.
