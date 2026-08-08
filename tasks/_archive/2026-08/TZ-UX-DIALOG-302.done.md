# TZ-UX-DIALOG-302 — QuickCreate balanced panels + dialog canon

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (executor self / PO continuous claim)  
**Source:** `tasks/_backlog/TZ-UX-DIALOG-302-quickcreate-balanced-panels.md`

## Delivered

- `SIZE_TO_WIDTH`: S→md, M→lg, L→xl; PiDialog form xl bump → `min(920px, 100vw-2rem)`
- QuickCreate fields: 2-col grid for M/L (or ≥4 keys); S single column
- Body `max-h-[min(70vh,…)] overflow-auto`; footer stays in shell sticky slot
- products/modules openCreate: removed pinned `width:'md'` — width from component
- Docs: cookbook kinds A–D + prefer-width rule; `docs/pages/ui-dialog-canon.md`; audit outliers table
- Specs: dialogWidth mapping + grid class for L

## НЕ (as scoped)

- FieldKey API / form-profiles backend
- Full rewrite of legacy FullEditors (orders/proposals/…) — successors via outliers
- Deploy / production cockpit

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T08:42:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsc -p tsconfig.app.json --noEmit)
  - tests: PASS (jest quick-create-dialog 7/7)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: legacy form-dialogs (orders/proposals/contracts/people/org opener lg) not migrated to kind C in this TZ
