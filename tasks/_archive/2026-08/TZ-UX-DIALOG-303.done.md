# TZ-UX-DIALOG-303 — Add-and-continue catalog pickers

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (PO CLAIM + continuous executor)  
**Source:** `tasks/TZ-UX-DIALOG-303-add-and-continue-pickers.md`

## Delivered

- `ProductCompositionPickerData.onAdded` callback — write while dialog stays open
- Primary «Добавить» clears select/price, appends session list (`picker-session-added`), no close
- Footer «Закрыть» / ✕; already-added lines not rolled back
- `ProductBomPanel.applyCompositionLine` + quiet toast «Добавлено»
- Specs: add twice without close; price cleared after product add; BomPanel wires onAdded
- Docs: `ui-add-and-continue.md` + links from product/module detail + overflow-select

## Conflict disclosure

- Peer FACT-303 (orders/fact-card) — not touched
- Peer dirty WIP on bom-panel inspector polish kept in same file (CONFLICT KEY); SELECT overflow WIP outside this commit except `searchable="auto"` already on picker

## НЕ

- Dialog service rewrite; backend composition API
- desktop/** · supply/** · TYPE-303 · PRODUCTS-307 · FACT-303/orders
- deploy
- Photo multi-add → TZ-UX-DIALOG-304

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T11:22:19Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsconfig.app --noEmit)
  - tests: PASS (composition-picker + bom-panel — 15/15)
  - lint/prettier: PASS
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: photo pickers still single-shot (DIALOG-304); module checkbox multi unchanged
