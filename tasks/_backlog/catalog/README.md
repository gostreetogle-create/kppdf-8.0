# Catalog backlog — Wave 2+

Канон: `tasks/TZ-CATALOG-300.md`  
Audits: `docs/audits/2026-08-04-catalog-coherence-audit.md`, readiness FE↔BE  
Wave 1 index: `tasks/CATALOG-WAVE1.md` (backend 301–305 **DONE**)

## Stop / session scripts

| Doc | Role |
|-----|------|
| `TZ-DAY-2026-08-07-catalog-kind-colors-330-332.md` | **COLORS WAVE:** 330 → 331 → 332 |
| `docs/agent-handoff-2026-08-06-TZ-CATALOG-314.md` | historical 314 stop |
| `TZ-DAY-2026-08-06e-session-320-311.md` | historical 320 → 311 |

## Open queue

| ID | Title | Status |
|----|-------|--------|
| **330** | Kind colors on composition tree | **DONE** |
| **331** | Оформление каталога (persist + hue UI) | **DONE** |
| **332** | Kind colors on lists + picker | **DONE** |
| **333** | Containment outlines (рамки состава) | **DONE** · `f2aedfd` |
| **311** | CompositionTree | defer if conflicts with 330 keys |
| **315** | Lists polish + a11y | after 332 if overlapping lists |
| **306** | Coherence audit trail | discussion only |

## Done (archive only — backlog stubs removed)

310 where-used · 312 material detail · 313 attachments · **314 soft-delete** · **320 FE composition gap** · Wave1 301–305 · 316/317/319 · UI-301

## Rules

- Colors wave: **330 → 331 → 332** (see TZ-DAY)
- Never mix RAL (`color_references`) with catalog kind hues
- Never parallel overlapping conflict keys without map claim
- Never `git add .` while чужой dirty present
