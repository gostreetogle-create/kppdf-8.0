# TZ-NX-DOCSTUDIO-C3-RIBBON-TO-RAILS — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-06T17:47:00+03:00
closed_by: freebuff
agent_id: freebuff
workspace: `D:\kppdf-8.0`
implementation_sha: pending focused commit

## Outcome

- Editor ribbon is breadcrumbs only: `Документы / Студия / {name}` (`kpWsRibbonExtra` slot, `data-test="studio-ribbon-crumbs"`). All seven action buttons (`К списку`, `Редактор`, `Сохранить`, `Сохранить как…`, `Просмотр`, `PDF`, `В архив`) removed from the ribbon; `kpWsRibbonActions` block deleted.
- Crumb «Документы» routes through `openDocumentList()` — the S38 dirty dialog still guards the leave; after leaving, `/studio` list (C1, no auto-resume).
- Crumb `{name}` keeps the rename dialog (`openRenameDialog()`); «Студия» is plain text (current section).
- Right chrome-rail gains lifecycle tools above panel tools, in TZ order: `mode-editor` (PenLine), `mode-preview` (Eye), `save` (Save, disabled while saving), `pdf` (FileDown, disabled while pdfLoading), `archive` (Archive, disabled unless draft / while finalizing, honest «Уже в архиве» label otherwise). Panel tools `elements/layers/pages/properties/template` unchanged below.
- `badgeText`/`totalText` no longer fed from the editor (`''` passed; shell inputs remain optional — API intact, no other consumers affected).
- «Сохранить как…» remains only in the Шаблон panel (`(saveAsTemplate)="openSaveAsTemplateDialog()"`).
- `docs/pages/document-studio.page.md`: §1.2 rewritten to crumbs-only contract, §1.3 documents the right-rail lifecycle tools and tool ids.
- `studio-workspace-shell.component.ts/.html` untouched — the shell already renders empty ribbon groups cleanly; A4 geometry law respected (zero viewport/panel CSS changes).

## Changed files

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-chrome-ia.spec.ts` (new)
- `docs/pages/document-studio.page.md`

## Verification

- Baseline `nx build kppdf-web` (pre-claim): PASS, exit 0.
- App typecheck `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`: PASS, exit 0.
- Focused tests: studio-editor-chrome-ia **6 passed** (rail order + active states, click→handler rails, crumbs-only template assertions, save-as panel exclusivity, clean + dirty crumb navigation), studio-workspace-chrome + studio-editor-catalog-queue **5 passed** (D56 left rail unaffected, S41 queue unaffected).
- Changed-file ESLint: 0 errors (pre-existing warnings only).
- Final `nx build kppdf-web` (LAST gate): PASS, exit 0.
- `git diff --check`: PASS.

## Scope integrity

No backend contract changes (finalize/PDF untouched), no Data IA vitrina changes, no list/templates page changes, no legacy `frontend/**`, no A4 geometry change, no desktop, no S45/S46, no foreign WIP staged.

## Executor report (auto)

C3 completed the ribbon→rails chrome IA slice. Next: C4 docs/integrity closeout (PAGE-TZ-INDEX, WAVE DONE, _NOW), then the wave is finished.
