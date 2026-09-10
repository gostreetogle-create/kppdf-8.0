# CLAUDE UX PAGE PROMPTS — очередь (не выдавать пачкой)

> PO: «дай следующий промпт» → Cursor отдаёт **ровно один** блок.  
> Мастер: `WAVE-NX-UX-PAGE-SWEEP.md` · канон: `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`

| # | Prompt | Route | Status |
|---|--------|-------|--------|
| 00 | `tasks/PROMPT-CLAUDE-UX-00-kit-overview.md` | `/kit/overview` | **DONE** |
| 01 | `tasks/PROMPT-CLAUDE-UX-01-kit-forms.md` | `/kit/forms` | **DONE** |
| 02 | `tasks/PROMPT-CLAUDE-UX-02-kit-overlays.md` | `/kit/overlays` | **DONE** |
| 03 | `tasks/PROMPT-CLAUDE-UX-03-registries.md` | `/registries` | **DONE** |
| 04 | `tasks/PROMPT-CLAUDE-UX-04-orders.md` | `/orders` | **DONE** |
| 05 | `tasks/PROMPT-CLAUDE-UX-05-shipping.md` | `/shipping` | **DONE** |
| 06 | `tasks/PROMPT-CLAUDE-UX-06-supply.md` | `/supply` | **DONE** |
| 07 | `tasks/PROMPT-CLAUDE-UX-07-supply-requests.md` | `/supply-requests` | **DONE** |
| 08 | `tasks/PROMPT-CLAUDE-UX-08-warehouses.md` | `/warehouses` | **DONE** |
| **08b→17** | `tasks/PROMPT-CLAUDE-UX-CONTINUOUS-REMAINING.md` | continuous tail | **NEXT** |
| — | чеклист | `docs/agent-checklists/UX-SWEEP-CONTINUOUS-CHECKLIST.md` | SoT стадий |

Одиночные PROMPT-CLAUDE-UX-09…17 остаются как fallback, если continuous не используем.
| 10 | `tasks/PROMPT-CLAUDE-UX-10-stock-movements.md` | `/stock-movements` | READY |
| 11 | — | `/production` | **SKIP Гант** |
| 12 | `tasks/PROMPT-CLAUDE-UX-12-proposals.md` | `/proposals` | READY |
| 13 | `tasks/PROMPT-CLAUDE-UX-13-counterparties.md` | `/counterparties` | READY |
| 14 | `tasks/PROMPT-CLAUDE-UX-14-contracts.md` | `/contracts` | READY |
| 15 | `tasks/PROMPT-CLAUDE-UX-15-studio-list.md` | `/studio` | READY |
| 16 | `tasks/PROMPT-CLAUDE-UX-16-admin-devices.md` | `/admin/devices` | READY |
| 17 | `tasks/PROMPT-CLAUDE-UX-17-admin-roles.md` | `/admin/roles` | READY |

Текущий NEXT: **00** — ждать команды PO.
