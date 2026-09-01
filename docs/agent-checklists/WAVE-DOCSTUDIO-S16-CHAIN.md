# WAVE — Doc Studio S16→S26 (continuous chain)

Status: **READY @ S20** · S17–S19B + S20-PRE DONE

> После push — сразу следующая TZ. STOP: все [x] ИЛИ hard blocker.  
> Resume: `tasks/PROMPT-FREEBUFF-DOCSTUDIO-S16-CHAIN-RESUME.md`

## Preflight

- [x] baseline build PASS

## Chain

| # | TZ | Archive | Commit |
|---|-----|---------|--------|
| 1 | [x] S16 RAIL-IA-SPLIT | `.done.md` | `64bdfd55` |
| 2 | [x] S17 RIBBON-PAGES-PANEL | `.done.md` | `426a4e67` |
| 3 | [x] S17A TABLE-COLUMN-LOCK | `.done.md` | `2c36444f` |
| 4 | [x] S18 SAVE-AS-MENU | `.done.md` | `33a0fa2a` |
| 5 | [x] S19 STUDIO-DELETE | `.done.md` | `d67385f5` |
| 5b | [x] S19B TEMPLATE-PICKER-DELETE | `.done.md` | `e7553a5b` |
| 6a | [x] **S20-PRE** PI-QUOTATIONS-CRUD | `.done.md` | `a35042f4` |
| 6 | [ ] S20 KP-QUOTATION-LIFECYCLE | claim in `_active/` | |
| 7 | [ ] S22 REGISTRY-VAT-RATE | | |
| 8 | [ ] S21 TABLE-AGGREGATE-TOKENS | | |
| 9 | [ ] S23 FORMULA-REGISTRY | | |
| 10 | [ ] S24 FORMULA-TEXT-BINDING | | |
| 11 | [ ] S26 OPERATOR-DOCS-V3 | | |

## Blocker note

~~`PiQuotationsService` lacked create/update.~~ Resolved in S20-PRE.

## Closeout

- [ ] all [x] · _active/ пуст · QUEUE/_NOW

SoT: `docs/architecture/nx-doc-studio-roadmap-v2.md`
