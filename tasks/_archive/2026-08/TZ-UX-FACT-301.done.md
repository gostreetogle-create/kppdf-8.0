# TZ-UX-FACT-301 — PiFactCard + FactStack UI kit

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (PO CLAIM)  
**Source:** `tasks/_backlog/TZ-UX-FACT-301-pi-fact-card.md`

## Delivered

- `app-pi-fact-card`: label / value / caption / `[actions]`; variants default|emphasis|danger; mono
- `app-pi-fact-stack`: title + projected cards
- Barrel `shared/ui/fact-card/index.ts`
- Docs `ui-fact-card.md`; jest smoke 3/3
- **Not** wired to product-detail

## НЕ

- DETAIL-301+; composition-tree; deploy

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T09:52:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsconfig.app --noEmit)
  - tests: PASS (fact-card.component.spec 3/3)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: deploy NO; wiring = DETAIL-301+
