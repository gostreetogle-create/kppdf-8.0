# TZ-NX-DOCSTUDIO-LIST-BULK-DELETE: массовое удаление документов в списке «Документы»

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: claude
verification:
  - acceptance criteria: PASS (7/7)
  - typecheck: PASS
  - tests: PASS (kppdf-web studio-list.page.spec.ts 12/12, incl. 6 new)
  - lint: PASS (baseline 38 pre-existing errors unrelated; 0 in changed files)
  - nx build kppdf-web: PASS (last gate, exit 0)
  - live browser evidence: PASS (Playwright, real backend/Mongo — 2 throwaway QA docs created via API, selected + bulk-deleted through the real UI, PO's real documents untouched)
  - checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-LIST-BULK-DELETE.md`
  - status synchronization: PASS (`_NOW.md` updated)

## Root cause

`/studio` document list only supported one-at-a-time delete via the row "×". PO
accumulated many test documents while testing and one-by-one delete was slow —
direct ask in the Claude terminal (not a Cursor-authored TZ) for checkbox
multi-select + bulk delete.

## Fix

1. Row checkbox (`app-pi-checkbox`) + header tri-state "select all" scoped to the
   currently filtered/visible rows (`studio-list.page.ts`).
2. Bulk action bar ("Удалить выбранное (N)", correct RU plural) shown only when
   `selectedIds().size > 0`, reusing the exact same destructive `AlertDialogComponent`
   confirm pattern as the existing single-row delete.
3. On confirm: parallel `service.remove(id)` per selected id — the existing single-DELETE
   endpoint, no new backend bulk-endpoint (soft-delete already atomic per document).
   Partial failure surfaces an honest toast with the failed count; `load()` always runs
   after, reloading the list and clearing selection.

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.spec.ts` (+6 tests)
- `docs/pages/document-studio.page.md` (short addendum)
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-LIST-BULK-DELETE.md` (new)

## known_limitation

- Bulk delete is N parallel HTTP DELETE calls, not a transaction — a partial network
  failure can leave some documents undeleted; surfaced via toast, not silently swallowed.
- `/studio/templates` untouched (same "×" pattern exists there but PO asked specifically
  about the documents list; successor if needed).
