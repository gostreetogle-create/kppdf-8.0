# WAVE — Successors backlog 2026-09-13 (после studio-ops)

updated_at: 2026-09-13T18:00:00Z  
agent_slot: Claude  
current_wave: **1**  
status: **WAVE1_DONE** (волна 2 не стартована — ждёт отдельного отчёта/GO)

> Out-of-band (не в волнах): `TZ-VERIFY-VM52-SSH-REMAINDER-2026-09-13` — только LAN.

## Карта

| Волна | TZ по порядку | Conflict |
|-------|---------------|----------|
| **1** | SHELL-RAILS-ALWAYS | app-shell — **один** TZ, P0 |
| **2** | MODULE-LIST-PHOTOS → CATEGORY-SLUG-409 → SORTORDER-EMPTY-MIN → SUPPLY-TASK-UNCONFIRM | BE+FE разные модули, последовательно один агент |

## Волна 1

| # | TZ | Status |
|---|-----|--------|
| 1.1 | `tasks/_archive/2026-09/TZ-NX-SHELL-RAILS-ALWAYS.done.md` | DONE (`63abd04c`) |

Промпт: `tasks/_ready/PROMPT-CLAUDE-SUCCESSORS-WAVE1-SHELL.md`

## Волна 2 (после отчёта 1)

| # | TZ | Status |
|---|-----|--------|
| 2.1 | `tasks/_ready/2026-09-13-studio-ops/TZ-NX-MODULE-LIST-POPULATE-PHOTOS.md` | PENDING |
| 2.2 | `tasks/_ready/2026-09-13-studio-ops/TZ-NX-CATEGORY-DUPLICATE-SLUG-409.md` | PENDING |
| 2.3 | `tasks/_ready/2026-09-13-studio-ops/TZ-NX-SORTORDER-EMPTY-MIN.md` | PENDING |
| 2.4 | `tasks/_ready/TZ-NX-SUPPLY-TASK-UNCONFIRM.md` | PENDING |
| 2.5 | `tasks/_ready/TZ-NX-DOCSTUDIO-ISSUER-SELECT.md` | PENDING |

Промпт: `tasks/_ready/PROMPT-CLAUDE-SUCCESSORS-WAVE2.md` — **не стартовать** до WAVE1_DONE.

### Checkpoint

```
2026-09-13T17:30:00Z | WAVE1 | started | HEAD=6ceeb4a6
2026-09-13T17:30:00Z | 1.1 SHELL-RAILS-ALWAYS | CLAIMED
2026-09-13T18:00:00Z | 1.1 SHELL-RAILS-ALWAYS | DONE | commit=63abd04c | overreach from TZ-NX-SHELL-01-IDLE-RAILS reverted: both rails always in DOM, grid always 3 columns, history moved from header into rail tops (one <-> pair site-wide); live Playwright confirmed on /counterparties (idle) and /production (setTools); no demo/disabled placeholder tools restored
2026-09-13T18:00:00Z | WAVE1 | DONE | 1/1 TZ DONE — WAVE2 (MODULE-LIST-PHOTOS -> CATEGORY-SLUG-409 -> SORTORDER-EMPTY-MIN -> SUPPLY-TASK-UNCONFIRM -> DOCSTUDIO-ISSUER-SELECT) NOT started, per prompt instruction — see final report to PO
```
