# TZ-KP-WS-407 — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: freebuff-2
scope: multi-supplier — org hint, copy for other firm, family attach in workspace

## Verification

- [x] Org change → preview rebuild + hint shown
- [x] Copy for other firm creates new draft and opens in workspace
- [x] Family attach accessible from workspace
- [x] Tests PASS (163/163 across all proposals suites)
- [x] tsc PASS
- [x] lint PASS (0 errors, 18 pre-existing warnings)

## What was done

1. **Org switch UX** (draft service + page):
   - `orgChangeHint` signal + `previousOrg` tracking in `ProposalWorkspaceDraftService`
   - Detection in `onInspectorState`: when org changes from non-empty to different org, hint banner appears
   - Non-blocking banner in workspace page: «Шаблон для другой фирмы? Нажмите «Шаблон», чтобы сменить бланк.» with dismiss button
   - `dismissOrgHint()` resets hint and locks previousOrg

2. **Copy for other firm** (ribbon action):
   - Button «Копировать для другой фирмы» in ribbon extra slot (`kpWsRibbonExtra`)
   - `duplicateForOtherFirm()`: reads `kp.create.lastDraftId` → `ProposalsService.duplicate(id)` → navigates workspace `?id=newId` with toast

3. **Family variants** (ribbon action + draft service):
   - Button «Варианты для фирм» in ribbon extra slot
   - `openFamilyDialogForCurrentDraft()`: fetches master by stored draft id → opens `ProposalFamilyAttachDialogComponent`
   - Imports `ProposalFamilyAttachDialogComponent` in draft service
   - Reuses existing dialog — no second write-path

## Files changed

- `proposal-workspace-draft.service.ts` (+60 lines: orgChangeHint, previousOrg, org detection, dismissOrgHint, duplicateForOtherFirm, openFamilyDialog, FamilyAttach import)
- `proposal-workspace.page.ts` (+45 lines: ProposalsService injection, ribbon extra buttons, org hint banner, openFamilyDialog method, CSS)

## SHA

| Коммит | Файлы |
|--------|-------|
| (pending) | proposal-workspace-draft.service.ts, proposal-workspace.page.ts |

## known_limitation

- Template list org filter: BE does not support `organizationId` scope on templates — documented in audit §3.2. Client-side filtering by category/name only (no extra code needed — existing picker already searches by name).
- Template auto-switch on org change: NOT implemented (TZ AC explicitly forbids — «Не изменять auto-switch template on org change without user confirm»). Hint is non-blocking.