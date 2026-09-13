# TZ-NX-DOCSTUDIO-SELECTED-REPLACE-JUMP: из «Выбрано» — сразу к замене

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-13
closed_by: claude
verification:
  - acceptance criteria: PASS (5/5)
  - typecheck: PASS
  - tests: PASS (FE 125 suites/865+7skip/872 tests, incl. 2 new spec files)
  - lint: PASS (0 errors, scoped files)
  - architecture:check: PASS
  - nx build kppdf-web: PASS (last gate)
  - live browser evidence: PASS (Playwright, real backend — Изменить jumps to Данные/Кому with the select actually focused)
  - checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-SELECTED-REPLACE-JUMP.md` + evidence/
  - status synchronization: PASS (WAVE-2026-09-13-STUDIO-OPS.md updated)

## Root cause

Anchor chips in the «Выбрано» buffer had no action; the data panel's TOC
category state had no external input, so the host editor couldn't command a
jump. Write-paths already existed — only the jump wiring was missing.

## Fix

1. `StudioDataPanelCategoryJump` input + effect on `studio-data-panel.component.ts`
   (nonce defeats Angular's value-equality no-op on repeat same-category jumps).
2. Anchor chips get «Изменить» (no separate ×); catalog chips keep × and also
   get «Изменить».
3. Editor's `onEditSelection` jump map + `requestAnimationFrame`-based focus on
   the real select trigger button (discovered `app-pi-select`'s host isn't
   itself focusable — verified live, not assumed).

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.ts` (+ `.spec.ts`)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-selected-jump.spec.ts` (new)
- `docs/pages/document-studio.page.md` (short addendum)
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-SELECTED-REPLACE-JUMP.md` + `evidence/TZ-NX-DOCSTUDIO-SELECTED-REPLACE-JUMP.txt` (new)

## Wave 1 — complete

All three wave-1 TZs (PHOTO-BROKEN-IMG, ADD-PAGE-WRITE-SERIAL, SELECTED-REPLACE-JUMP)
are DONE. Successors filed: `tasks/_ready/TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG.md`
(out-of-scope vitrina bug found live during 1.1's evidence gathering).
