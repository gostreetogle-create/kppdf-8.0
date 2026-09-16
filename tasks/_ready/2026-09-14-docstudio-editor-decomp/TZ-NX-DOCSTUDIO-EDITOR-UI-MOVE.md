═══════════════════════════════════════════════════════════════
TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE: Phase 3 — dumb UI → features
═══════════════════════════════════════════════════════════════

> Pack: [WAVE-MAP.md](./WAVE-MAP.md)

РОЛЬ АГЕНТА: Frontend Architect (component move — no UX change)

ЗАВИСИМОСТИ: `TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE` archived + build green

**SIZE:** L  
**PACK:** WAVE-DOCSTUDIO-EDITOR-DECOMP  
LAYER: 3

PAGES: /studio/:id ; /studio ; /studio/templates  
PAGE_DOCS: document-studio.page.md

CONFLICT KEYS: frontend-nx/libs/features/src/lib/doc-studio/ui/** ; frontend-nx/libs/features/src/lib/doc-studio/index.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.facade.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-*.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-panel-overlays.css ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-shell.component.*

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

## BUILD INTEGRITY

Baseline + gates: tsc ; `nx test kppdf-web --testPathPattern=studio-` ; `nx build kppdf-web` last

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Dumb / presentational components still under `pages/studio/`. Util already in features.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Move to `libs/features/src/lib/doc-studio/ui/` (keep selectors / `data-test` / templates unchanged)

**Shell / canvas / panels:**
- `studio-workspace-shell.component.ts` + `.html` + `.css`
- `studio-panel-overlays.css` (if only used by shell/panels)
- `studio-blocks-canvas.component.ts` (+ spec)
- `studio-elements-panel.component.ts` (+ spec)
- `studio-pages-panel.component.ts`
- `studio-layers-panel.component.ts`
- `studio-data-panel.component.ts` (+ spec)
- `studio-data-vitrina.component.ts` (+ specs)
- `studio-properties-panel.component.ts`
- `studio-table-properties.component.ts` (+ spec)
- `studio-text-properties.component.ts` (+ spec)
- `studio-template-panel.component.ts` (+ spec)

**Studio-local dialogs only (NOT shared registry forms):**
- `studio-unsaved-changes-dialog.component.ts`
- `studio-rename-document-dialog.component.ts`
- `studio-save-as-template-dialog.component.ts`
- `studio-text-library-picker-dialog.component.ts` (+ spec)
- `studio-data-field-picker-dialog.component.ts` (+ spec)
- `studio-create-doctype-dialog.component.ts`
- `studio-template-picker-dialog.component.ts` (if only studio list/editor)

ШАГ 2: Export from `doc-studio/index.ts`; update page + facade imports to `@kppdf/features/doc-studio`.

ШАГ 3: **LEAVE in app** (do not move):
- `studio-editor.page.ts`, `studio-editor.facade.ts`, `studio-editor-*.spec.ts`
- `studio-list.page.ts`, `studio-templates-list.page.ts` (+ their specs)
- `studio.routes.ts`, `studio-dirty.guard.ts`
- `apps/.../doc-studio/dialogs/table-template-form-dialog.*`
- `apps/.../doc-studio/dialogs/text-block-form-dialog.*`
- `apps/.../doc-studio/shared/**`

ШАГ 4: Fix relative util imports inside moved UI → `@kppdf/features/doc-studio` util exports (or relative `../util/` inside lib — prefer relative inside lib).

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Input/Output contracts of dumb components (no redesign)
- Facade business logic / queue
- Registries actions that import shared dialogs
- Split canvas/table-properties (PARK Phase 5)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Listed UI files live under `libs/features/.../doc-studio/ui/`; gone from `pages/studio/` (except pages/facade/routes/guard/list).
2. Selectors and `data-test` unchanged.
3. **Specs green:**
   - moved component specs (canvas, data-panel, vitrina, table/text properties, elements, template-panel, text-library-picker, data-field-picker, …)
   - full `nx test kppdf-web --testPathPattern=studio-editor`
   - `studio-list.page.spec.ts`, `studio-templates-list.page.spec.ts`
4. Editor opens; panels still Input/Output wired from thin page.
5. `nx build kppdf-web` last exit 0.
6. Archive + SHA.

Successor: Phase 4 `TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES`.
