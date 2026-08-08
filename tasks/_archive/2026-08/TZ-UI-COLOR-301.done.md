# TZ-UI-COLOR-301 — Contrast sweep light + dark (P0/P1)

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (PO CLAIM + continuous executor)  
**Source:** `tasks/TZ-UI-COLOR-301-contrast-light-dark-sweep.md`

## Delivered

- Badge: default ink + gold-soft (no text-gold label); secondary success tokens; outline paper-2
- pi-table: selected row `bg-gold-soft` (+ data-selected); sticky spec aligned to `pi-table-sticky-bg`
- Gantt zebra: `bg-paper-2` (was `bg-black/[0.02]`); meta text-xs
- surface-* dark overrides; mute `/50` → `/70` on pi-table-tree grab
- Docs: DARK-THEME anti-goals; paper-and-ink live cool-graphite footnote

## НЕ

- catalog-kind hues · builder canvas · TYPE layout · desktop/supply/PRODUCTS-307
- deploy
- Full visual browser pass left for PO eyeball (code AC met)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T11:28:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsconfig.app --noEmit)
  - tests: PASS (badge + pi-table 40/40)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: PO should still eyeball /modules/:id + one table light/dark on stand
