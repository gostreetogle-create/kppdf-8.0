═══════════════════════════════════════════════════════════════
TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES: Phase 4 — facade → features
═══════════════════════════════════════════════════════════════

> Pack: [WAVE-MAP.md](./WAVE-MAP.md)

РОЛЬ АГЕНТА: Frontend Architect (relocate facade only)

ЗАВИСИМОСТИ: `TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE` archived + build green

**SIZE:** S  
**PACK:** WAVE-DOCSTUDIO-EDITOR-DECOMP  
LAYER: 3

PAGES: /studio/:id  
PAGE_DOCS: document-studio.page.md

CONFLICT KEYS: frontend-nx/libs/features/src/lib/doc-studio/studio-editor.facade.ts ; frontend-nx/libs/features/src/lib/doc-studio/index.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.facade.ts

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

## BUILD INTEGRITY

Baseline + gates: tsc ; `nx test kppdf-web --testPathPattern=studio-editor` ; `nx build kppdf-web` last

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

- Facade still at `pages/studio/studio-editor.facade.ts`
- Util + dumb UI already in `@kppdf/features/doc-studio`
- Page still provides Facade and re-exports for TestableEditor

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Move `studio-editor.facade.ts` → `libs/features/src/lib/doc-studio/studio-editor.facade.ts`

- Export `StudioEditorFacade` from `doc-studio/index.ts`
- Delete app copy
- **Keep** `Injectable()` without `providedIn: 'root'`
- Page still: `providers: [StudioEditorFacade]`, `inject(StudioEditorFacade)` from `@kppdf/features/doc-studio`

ШАГ 2: Break app→features illegal deps

Facade **must not** import from `apps/kppdf-web/**`.

If facade still opens shared registry dialogs (`TableTemplateFormDialog`, `TextBlockFormDialog`):
- Move those `open*` call sites to **page** methods that:
  1. open dialog via `PiDialogService` + `onDialogCloseOnce`
  2. call facade methods with the result (`applySavedTableTemplate`, `applySavedTextBlock`, …)
- Prefer extracting thin `openSaveTableTemplateDialog()` on page that uses existing facade APIs after dialog closes — **minimal** surface; do not rewrite save logic.

Studio-local dialogs already in features/ui — facade may import them from `./ui/...` or public barrel.

ШАГ 3: Page remains thin glue

- HostListeners, ResizeObserver, `ShellToolRailService`, shared dialog openers, template wiring
- Signal re-exports + method delegates for specs **unchanged in spirit**

ШАГ 4: Gates + archive wave closeout note in checklist

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Routes, guard, list/templates pages location
- Queue/retry/liveRows algorithms
- Dumb UI internals
- Shared dialogs file location under `app/doc-studio/dialogs` (unless already unused — do not move to features in this TZ)
- Phase 5 splits

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. No `studio-editor.facade.ts` under `pages/studio/`.
2. Facade imported from `@kppdf/features/doc-studio`; still page-provided instance.
3. `rg "from '.*apps/kppdf-web" libs/features/src/lib/doc-studio` → 0 (no app imports).
4. **Specs green:** full `nx test kppdf-web --testPathPattern=studio-editor` (TestableEditor still on page).
5. Dirty guard / chrome tools / rename & save-as-template & shared table/text library save still work (page opens shared dialogs if needed).
6. `nx build kppdf-web` last exit 0.
7. Archive; WAVE 1–4 marked DONE in WAVE-MAP status table (docs commit OK).

Successor: PARK Phase 5 only on PO command.
