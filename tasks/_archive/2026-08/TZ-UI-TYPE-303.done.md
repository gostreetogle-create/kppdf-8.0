# TZ-UI-TYPE-303 — Content label step (readable info labels)

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (PO CLAIM + continuous executor)  
**Source:** `tasks/TZ-UI-TYPE-303-content-label-step.md`

## Delivered

- `--text-label: 13px` + `@utility pi-label` (body, weight 500, not uppercase mono)
- pi-table th → `pi-label text-muted-foreground`; sort glyph `text-xs` (was `[10px]`)
- FactCard label + FactStack title → `pi-label`
- module-detail work-types th → `pi-label`; kind «модуль» / photo chrome stay `eyebrow`
- product passport labels inherit via FactCard; kind «товар» stays `eyebrow`
- design-spec + audit §2 step + ui-fact-card rules (kept FACT-303 Adoption)

## Conflict disclosure

FACT-303 CLAIMED `fact-card/**` + `ui-fact-card.md` (orders consumer). TYPE-303 only swapped label classes; no FactCard API change. Adoption section preserved.

## НЕ

- nav compact raised; COLOR-301; desktop/supply/orders peer/PRODUCTS-307
- deploy

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T11:25:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsconfig.app --noEmit)
  - tests: PASS (fact-card, pi-table, module-detail — 29/29)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: empty-state «00» still eyebrow (decorative); PO eyeball passport th light/dark
