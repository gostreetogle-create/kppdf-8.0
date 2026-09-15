# WAVE — Successors backlog 2026-09-13 (после studio-ops)

updated_at: 2026-09-13T23:15:00Z  
agent_slot: Claude  
current_wave: **3**  
status: **WAVE3_DONE**

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
| 2.5 | `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-ISSUER-SELECT.done.md` | DONE (`e6908e11`) |

Промпт: `tasks/_ready/PROMPT-CLAUDE-SUCCESSORS-WAVE2.md` — **не стартовать** до WAVE1_DONE.

## Волна 3 (после WAVE2_DONE)

| # | TZ | Status |
|---|-----|--------|
| 3.1 | `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-TABLE-PRICE-SUM.done.md` | DONE (`7321b4d6`) |
| 3.2 | `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP.done.md` | DONE (`cc8e029b`) |

Аудит: `docs/audits/2026-09-13-docstudio-table-price-sum.md` · `docs/audits/2026-09-13-docstudio-token-editor-chip.md`  
Промпт: `tasks/_ready/PROMPT-CLAUDE-SUCCESSORS-WAVE3.md` — spent (WAVE3_DONE).

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
2026-09-13T23:00:00Z | 2.5 DOCSTUDIO-ISSUER-SELECT | DONE | commit=e6908e11 | BE: UpdateStudioDocumentDto.organizationId + update() reuses OrganizationService.findById's existing IDOR visibility policy (raw unresolved org id, not the resolveOrganizationId fallback); FE: readonly "Наша фирма" text -> app-pi-select filtered to isOurCompany orgs (live evidence: 10/13 orgs on stand are supplier seed data, not issuer candidates), disabled when <=1 candidate; nav fix corrected mid-flight from a no-op edit (nav-categories.ts items[] is never rendered anywhere in app-shell — reverted) to the real visible surface (admin-group-chips.ts's ADMIN_TOC_CHIPS, the actual "Устройства|Роли" tab strip) -> new "Наши организации" chip, live-verified clickable to /registries/organizations; live-reproduced known_limitation is WORSE than TZ text describes (full GET/PATCH/DELETE 403 lockout for the switching admin, not just list-disappearance, with an unexplained infinite-spinner UX) -> filed as WARN per TZ's own instruction, documented in page.md + evidence, not blocking; fixed all 13 studio-editor-*.spec.ts PiOrganizationsService mocks (missing .list broke the full suite); all gates PASS (BE 136/1361, FE 125/903+7skip, architecture:check, nx build); both throwaway test docs deleted (one via API, one via direct Mongo after self-lockout)
2026-09-13T23:00:00Z | WAVE2 | DONE | 5/5 TZ DONE (2.1-2.5) — see final report to PO; new wave NOT proposed per prompt instruction
2026-09-13T23:15:00Z | WAVE3 | started | HEAD=3c122f96
2026-09-13T23:15:00Z | 3.1 TABLE-PRICE-SUM | CLAIMED
2026-09-14T00:15:00Z | 3.1 TABLE-PRICE-SUM | DONE | commit=7321b4d6 | BE+FE price alias parity (listPrice/basePrice/pricePerUnit + _ variants — the exact catalog field names the resolver itself reads, previously unbound); FE gained sum alias group + quick-add "+ Сумма" chip; new healStudioTableColumns wired into the existing emitColumnStructure choke point fixes the exact PO repro (dup "Цена" labels -> price stays, sum becomes "Сумма") without touching a deliberate custom label; type-select now disabled for every standard key (lineValue never reads column.type) with a title hint, live for custom keys only; modules-without-price BE test added (price/sum=0, not a crash); live curl against a real product confirmed listPrice-key binding + sum=price*qty at qty=1 and qty=5 end-to-end through the real preview render; live Playwright confirmed the quick-add chip and type-lock in an actual browser, including on a column added mid-session; all gates PASS (BE 136/1364, FE 125/916+7skip, architecture:check, nx build); both throwaway docs deleted via direct Mongo (block deletion has no studio-documents API path)
2026-09-14T00:15:00Z | 3.2 TOKEN-EDITOR-CHIP | CLAIMED
2026-09-14T01:15:00Z | 3.2 TOKEN-EDITOR-CHIP | DONE | commit=cc8e029b | root cause matched the audit exactly: S44's .substitution-token CSS had nothing to attach to since studio-blocks-canvas.component.ts's textHtml() never called migratePlainTokensToNodes (only the RTE dialog did) -> canvas showed raw {{...}} black text; fixed by reusing that same function (widened its export via the rich-text barrel, was lib-internal) + copying the RTE's own chip CSS onto the canvas; new session-level (not persisted, not per-block) Токены|Значения segment in Свойства текста, default Токены; Значения substitutes from a client-side bag built entirely from context this editor session already loads (organization/counterparty/anchor/quotation/order) -- no new backend resolve API needed, the TZ's own preferred option covered every required token namespace; unresolved tokens in Значения mode keep the chip (documented choice per TZ's "выбрать одно" instruction); dblclick-to-edit needed zero code change to stay token-only (RTE is a structurally separate component); live Playwright confirmed the full loop end-to-end on a real counterparty value + confirmed dblclick independence; caught and fixed a known backtick-in-styles-template-literal pitfall proactively (from memory) before it became a debugging session; all gates PASS (FE 126/937+7skip, paper-and-ink 35/363, architecture:check, nx build); both throwaway docs deleted via direct Mongo (one abandoned after re-hitting the ISSUER-SELECT 403 lockout, one used for the successful run)
2026-09-14T01:15:00Z | WAVE3 | DONE | 2/2 TZ DONE (3.1-3.2) — see final report to PO; new wave NOT proposed per prompt instruction
```
