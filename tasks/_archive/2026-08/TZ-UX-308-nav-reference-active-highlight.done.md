# TZ-UX-308 — Nav «Справ.» yellow active on /categories

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (executor self / PO CLAIM)  
**Source:** `tasks/_backlog/TZ-UX-308-nav-reference-active-highlight.md`

## Delivered

- reference `entryPath` → `/categories` (classification redirect canon)
- classification leaf path → `/categories`; `activeAliases`: classification / appearance / documents-ref
- exported `matchActiveCategoryId()`; AppLayout delegates
- jest: `/categories` → reference; `/products` → catalog
- documents-ref duplicate leaf removed (alias covers redirect)

## НЕ (as scoped)

- dialogs / QuickCreate
- admin/**
- Deploy

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T08:58:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsc -p tsconfig.app.json --noEmit)
  - tests: PASS (jest app-layout.nav-order 4/4)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: none for scoped AC
