# TZ-UX-311 — Composition tree mini-thumb + name wrap

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (PO CLAIM + executor)  
**Source:** `tasks/_backlog/TZ-UX-311-composition-tree-thumb-wrap.md`

## Delivered

- BE `TreeNode.photoUrl?: string` via catalog-graph (mainPhotoId → first photoIds → Photo.storageUrl; omit when none)
- FE `CompositionTreeNode.photoUrl`; `app-composition-tree`: thumb after kind badge; Lucide Image placeholder; name `line-clamp-2` + `break-words` (no truncate); qty/count stay `shrink-0`
- Docs: `docs/pages/ui-composition-tree.md` §11
- Jest FE (wrap + thumb) + BE getTree photoUrl; org-scope test aligned with global module parents

## НЕ (as scoped)

- QuickCreate / FORM
- page chrome UX-309
- BOM add/remove API
- Deploy

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T09:36:30Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsconfig.app + backend tsconfig.build --noEmit)
  - tests: PASS (composition-tree.component.spec 7/7; catalog-graph.service.spec 13/13)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: none for scoped AC; deploy NO
