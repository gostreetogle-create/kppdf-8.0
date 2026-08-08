# TZ-UI-TYPE-302 — Apply type scale on catalog hotspots

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (PO CLAIM + continuous executor)  
**Source:** `tasks/TZ-UI-TYPE-302-apply-type-scale-hotspots.md`

## Delivered

- Nav labels: `text-[9px]` → `text-[11px]` (app-layout + pi-nav-dropdown compact)
- Footer: `eyebrow` (was text-[10px])
- composition-tree: kind badge `eyebrow`, depth `text-xs`, chevron `text-base`
- PiFactCard mono values → `text-sm` (body ladder)
- Titles module/product already same `text-lg sm:text-xl` — verified
- Page docs: composition-tree, fact-card, chrome, product/module detail notes

## НЕ

- order-detail title align (known_limitation / successor)
- styles.css token defs (301) · colors (COLOR-301)
- desktop/supply/PRODUCTS-307 · peer products WIP
- deploy

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T11:20:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsconfig.app --noEmit)
  - tests: PASS (composition-tree, fact-card, app-layout.nav-order, module-detail — 22/22)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: order-detail title ladder left for successor; kit-layout Syne footer out of keys
