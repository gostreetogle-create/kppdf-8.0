# TZ-NX-DOCSTUDIO-C3-RIBBON-TO-RAILS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-C3-RIBBON-TO-RAILS.md`
> Wave: `docs/agent-checklists/WAVE-DOCSTUDIO-CHROME-IA.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-06T17:40:00+03:00
- workspace: D:\kppdf-8.0 (continuous main checkout)
- team_room_claim: unavailable (no Team Room CLI in this executor)

## Preflight

- [x] Continuous workspace, branch `main`, origin/main aligned
- [x] `tasks/_active/` empty of conflicting kppdf-web/src/** claims
- [x] C3 TZ, WAVE, audit §3, geometry law (`kp-workspace-geometry.md`) read
- [x] C2 DONE `85f1dc8e` pushed; C2 files not reopened
- [x] Constraints: no backend finalize/PDF contract changes, no Data IA vitrina, no list/templates pages, no legacy `frontend/**`, no A4 reflow
- [x] Baseline build before product edits — PASS, exit 0

### Preflight Check Output

- **Context:** editor ribbon template ~165–224, setTools effect ~757–779, shell html header, S41 editor spec (no-CD pattern), S38 unsaved-changes dialog, rename/save-as/pdf/finalize handlers
- **Acceptance:** ribbon = crumbs only `Документы / Студия / {name}`; lifecycle actions on right chrome-rail; «Сохранить как…» stays in Шаблон panel; crumb «Документы» passes dirty guard
- **Geometry risk:** ribbon height kept (~36px single line); no viewport/panel geometry change

## Acceptance

- [x] No action-button row in ribbon; crumbs only `Документы / Студия / {name}` (`data-test="studio-ribbon-crumbs"`); `kpWsRibbonActions` block deleted; badgeText/totalText no longer fed from editor
- [x] Right rail: `mode-editor` / `mode-preview` / `save` / `pdf` / `archive` above panel tools; RU aria+titles; save disabled while saving, pdf while pdfLoading, archive unless draft/finalizing
- [x] «Сохранить как…» only in Шаблон panel (`(saveAsTemplate)` binding retained; ribbon button removed)
- [x] Crumb «Документы» → `openDocumentList()` (S38 dirty dialog) — proven in spec: clean doc navigates, dirty doc opens dialog and does not navigate
- [x] A4 geometry unchanged — no shell/viewport/panel CSS touched (ribbon slot styles only)
- [x] Gates PASS

## Changed scope

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` — ribbon crumbs, rail tools, icon imports, dead ribbon styles removed
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-chrome-ia.spec.ts` (new)
- `docs/pages/document-studio.page.md` §1.2 rewritten (crumbs) + §1.3 rail table
- `studio-workspace-shell.component.ts/.html` NOT changed — shell API already optional (badgeText/totalText default `''`), no consumers broken

## Gates

- [x] Baseline build (pre-claim): PASS, exit 0
- [x] `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS, exit 0
- [x] Focused jest: studio-editor-chrome-ia **6 passed** (new), studio-workspace-chrome + studio-editor-catalog-queue **5 passed**
- [x] Changed-file ESLint: 0 errors (pre-existing non-null/unused warnings only)
- [x] `nx build kppdf-web` — PASS, exit 0, run LAST
- [x] `git diff --check` — PASS

## Executor report

- **Outcome:** C3 DONE — editor ribbon = breadcrumbs only; lifecycle actions on right chrome-rail; «Сохранить как…» only in Шаблон panel; dirty-guarded crumb navigation.
- **Implementation commit:** `45d7e6b89827ba9bd8bafd75a21c961a416c4f16` (pushed to origin/main; pre-push typecheck OK)
- **known_limitation:** icon polish / rail order tunable by successor; generated-documents archive out of scope (per TZ).
