# WAVE — Successors backlog 2026-09-13 (после studio-ops)

updated_at: 2026-09-13T19:00:00Z  
agent_slot: Claude  
current_wave: **2**  
status: **IN_WORK_WAVE2**

> Out-of-band (не в волнах): `TZ-VERIFY-VM52-SSH-REMAINDER-2026-09-13` — только LAN.

## Карта

| Волна | TZ по порядку | Conflict |
|-------|---------------|----------|
| **1** | SHELL-RAILS-ALWAYS | app-shell — **один** TZ, P0 |
| **2** | MODULE-LIST-PHOTOS → CATEGORY-SLUG-409 → SORTORDER-EMPTY-MIN → SUPPLY-TASK-UNCONFIRM → ISSUER-SELECT | BE+FE, один агент |
| **3** | TABLE-PRICE-SUM → TOKEN-EDITOR-CHIP | studio FE(+resolver) |

## Волна 1

| # | TZ | Status |
|---|-----|--------|
| 1.1 | `tasks/_archive/2026-09/TZ-NX-SHELL-RAILS-ALWAYS.done.md` | DONE (`63abd04c`) |

Промпт: `tasks/_ready/PROMPT-CLAUDE-SUCCESSORS-WAVE1-SHELL.md`

## Волна 2 (после отчёта 1)

| # | TZ | Status |
|---|-----|--------|
| 2.1 | `tasks/_archive/2026-09/TZ-NX-MODULE-LIST-POPULATE-PHOTOS.done.md` | DONE (`31edb081`) |
| 2.2 | `tasks/_archive/2026-09/TZ-NX-CATEGORY-DUPLICATE-SLUG-409.done.md` | DONE (`e2c40bb8`) |
| 2.3 | `tasks/_archive/2026-09/TZ-NX-SORTORDER-EMPTY-MIN.done.md` | DONE (`15a1febb`) |
| 2.4 | `tasks/_archive/2026-09/TZ-NX-SUPPLY-TASK-UNCONFIRM.done.md` | DONE (`2bb8aade`) |
| 2.5 | `tasks/_ready/TZ-NX-DOCSTUDIO-ISSUER-SELECT.md` | CLAIMED |

Промпт: `tasks/_ready/PROMPT-CLAUDE-SUCCESSORS-WAVE2.md` — **не стартовать** до WAVE1_DONE.

## Волна 3 (после WAVE2_DONE)

| # | TZ | Status |
|---|-----|--------|
| 3.1 | `tasks/_ready/TZ-NX-DOCSTUDIO-TABLE-PRICE-SUM.md` | PENDING |
| 3.2 | `tasks/_ready/TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP.md` | PENDING |

Аудит: `docs/audits/2026-09-13-docstudio-table-price-sum.md` · `docs/audits/2026-09-13-docstudio-token-editor-chip.md`  
Промпт: выдать после отчёта WAVE2 (два TZ подряд).

### Checkpoint

```
2026-09-13T17:30:00Z | WAVE1 | started | HEAD=6ceeb4a6
2026-09-13T17:30:00Z | 1.1 SHELL-RAILS-ALWAYS | CLAIMED
2026-09-13T18:00:00Z | 1.1 SHELL-RAILS-ALWAYS | DONE | commit=63abd04c | overreach from TZ-NX-SHELL-01-IDLE-RAILS reverted: both rails always in DOM, grid always 3 columns, history moved from header into rail tops (one <-> pair site-wide); live Playwright confirmed on /counterparties (idle) and /production (setTools); no demo/disabled placeholder tools restored
2026-09-13T18:00:00Z | WAVE1 | DONE | 1/1 TZ DONE — WAVE2 (MODULE-LIST-PHOTOS -> CATEGORY-SLUG-409 -> SORTORDER-EMPTY-MIN -> SUPPLY-TASK-UNCONFIRM -> DOCSTUDIO-ISSUER-SELECT) NOT started, per prompt instruction — see final report to PO
2026-09-13T19:00:00Z | WAVE2 | started | HEAD=43acfbf3
2026-09-13T19:00:00Z | 2.1 MODULE-LIST-POPULATE-PHOTOS | CLAIMED
2026-09-13T19:35:00Z | 2.1 MODULE-LIST-POPULATE-PHOTOS | DONE | commit=31edb081 | findAll now populates photoIds/mainPhotoId + blankMissingUploadUrls (reused WAVE3.1 helper); live: negative path 0 broken/0x404 on photo-less dataset, positive path temporary real-photo PATCH renders correctly then reverted; findById left untouched (out of scope, used for mutate-then-save)
2026-09-13T19:35:00Z | 2.2 CATEGORY-DUPLICATE-SLUG-409 | CLAIMED
2026-09-13T20:00:00Z | 2.2 CATEGORY-DUPLICATE-SLUG-409 | DONE | commit=e2c40bb8 | create/update now catch E11000 -> ConflictException 409 with a distinct message for both unique indexes ({type,slug} and standalone skuPrefix, the latter not in the TZ's own repro but same bug); live curl confirmed both collisions 409 not 500, test category cleaned up
2026-09-13T20:00:00Z | 2.3 SORTORDER-EMPTY-MIN | CLAIMED
2026-09-13T20:35:00Z | 2.3 SORTORDER-EMPTY-MIN | DONE | commit=15a1febb | live evidence: POST /table-templates sortOrder:"" -> 400 exact PO message; fixed shared doc-studio-payloads.ts (omits empty/non-finite sortOrder, closes table-template+text-block at once) + BE Transform belt on CreateTableTemplateDto; live re-verify 400->201, sortOrder omitted, -1 still rejected; other DTOs from preflight list not audited, left as backlog per known_limitation
2026-09-13T20:35:00Z | 2.4 SUPPLY-TASK-UNCONFIRM | CLAIMED
2026-09-13T21:15:00Z | 2.4 SUPPLY-TASK-UNCONFIRM | DONE | commit=2bb8aade | STATUS_FLOW confirmed->draft edge + unconfirm() (clears confirmedBy/At) + POST .../unconfirm; FE "В черновик" button + Подтвердить now gated behind AlertDialogComponent (reused confirmDirtyClose pattern, no native confirm); live UI round-trip + curl 400-from-draft both confirmed; SUPPLY-GATE stand smoke 23/23 PASS
2026-09-13T21:15:00Z | 2.5 DOCSTUDIO-ISSUER-SELECT | CLAIMED
```
