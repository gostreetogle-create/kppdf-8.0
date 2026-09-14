# TZ-NX-DOCSTUDIO-EDITOR-FACADE: Phase 1 — Extract Facade in-place

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: claude
verification:
  - acceptance criteria: PASS (7/7)
  - typecheck: PASS
  - tests: PASS (kppdf-web full suite 129/129, 980 passed / 7 pre-existing skip / 987 total, 0 failed)
  - nx build kppdf-web: PASS (last gate, exit 0)
  - checklist: docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-FACADE.md
  - commit: 142d66e4 (pushed origin/main)
  - status synchronization: PASS (WAVE-MAP.md + WAVE-DOCSTUDIO-EDITOR-DECOMP-CONTINUOUS.md updated)

## Root cause

`studio-editor.page.ts` — god component (~3168 LOC): signals, the
`catalogWriteChain` write-queue, and every domain method (save/hydrate/
catalog-insert/table-patch/preview/PDF/finalize/context/КП) lived directly
on the `@Component`, mixed with Angular-chrome concerns (HostListener,
ResizeObserver, ShellToolRailService, viewChild sheet).

## Fix

Extracted an instance-scoped `StudioEditorFacade` (`@Injectable()`,
`providers: [StudioEditorFacade]` on the page — not `providedIn: 'root'`)
holding essentially the entire domain layer, mechanically moved as-is (no
algorithm changes to `catalogWriteChain`/409-retry/liveRows/PDF). Page keeps
only what genuinely requires the component/view context: template + styles,
`@HostListener`, `viewChild('sheetHost')`, `ResizeObserver`, `ShellToolRailService`
+ its tool-rail-building `effect()`, `canDeactivate`, and the DOM-dependent
canvas-fit state (`zoomMode`/`sheetSize`/`setZoomMode`/`syncSheetSize`/
`previewZoomScale`, which need the sheet's `viewChild` ref a plain
`Injectable` can't have).

One deliberate, documented indirection: `toggleOrientation()`'s post-write
`syncSheetSize()` call is routed through a `syncSheetSizeHook` the page
registers on the facade in its constructor (same timing, same target —
forced by the page/facade DOM boundary, not a behavior change).

Zero spec rewrite: page re-exports the same signal object refs and adds
one-line method delegates. Three spec-access patterns found only by running
the suite (not predictable from the TZ alone) needed extra page-side
plumbing beyond "same signal refs": (1) the shellTools-effect routes clicks
through the page's own delegate methods (`this.saveDocument()`, not
`this.facade.saveDocument()`) so `jest.spyOn(component, 'saveDocument')`
still intercepts; (2) two originally-`private` page methods
(`insertTextContent`, `saveLayouts`) that specs call directly via a
`Testable`-style cast got page delegates + were promoted out of `private` in
the facade (grepped all 16 `studio-editor-*.spec.ts` — these are the only
two actually invoked that way); (3) `catalogWriteChain`/`layoutsDirty`,
directly read/written by specs as fields, got live get/set page accessors
(not a one-time copied value, since the facade reassigns them async).

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.facade.ts` (new)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (~3168 → ~470 LOC)
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-FACADE.md` (new)

## Successor

Phase 2 `TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE` (facade's pure helpers → `libs/features/src/lib/doc-studio/util/`).
