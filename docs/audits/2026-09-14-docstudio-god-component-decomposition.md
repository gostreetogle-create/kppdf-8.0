# Audit: DocStudio God Component → Facade (2026-09-14)

> Phase 0 analysis (Cursor Mode A). Implementation = `TZ-NX-DOCSTUDIO-EDITOR-FACADE` (executor).  
> Plan approved by PO 2026-09-14.

## Verdict

`StudioEditorPage` (~3004 LOC) is the God Component. UI panels/canvas are already mostly dumb; **orchestration + revision write-queue + ERP/catalog state** still live on the page. Phase 1 = extract `StudioEditorFacade` **in-place** (same folder), no Nx move, no dumb-UI edits, no logic rewrite.

## Size map (pages/studio)

| File | ~LOC | Role |
|------|------|------|
| `studio-editor.page.ts` | 3004 | God — extract |
| `studio-table-properties.component.ts` | 993 | fat properties (later) |
| `studio-blocks-canvas.component.ts` | 635 | dumb canvas |
| `studio-text-properties` / data-panel / vitrina | 450–520 | dumb/semi |

## State today

Angular **signals on the page**: `document`, `blocks`, selection, chrome UI, catalog selections, ERP lists, preview, busy flags.  
Non-signal critical: `catalogWriteChain` Promise queue + `layoutSavePromise` / dirty layout.  
NgRx: **not in monorepo**.

## Target (Phase 1 only)

```
pages/studio/studio-editor.facade.ts  ← NEW: signals + queue + domain methods
pages/studio/studio-editor.page.ts    ← thin: template, HostListener, shell tools, delegates
```

- Facade: `providers: [StudioEditorFacade]` on the page (instance-scoped — **not** `providedIn: 'root'`).
- Page re-exports the **same signal object refs** + thin method wrappers so existing `TestableEditor` casts keep working without rewriting specs.
- Move code **as-is** (queue, 409 soft-retry, liveRows merge, PDF/preview).

## Wave pack (PO 2026-09-14)

SoT: `tasks/_ready/2026-09-14-docstudio-editor-decomp/WAVE-MAP.md`

| Phase | TZ | Note |
|-------|-----|------|
| 1 | EDITOR-FACADE | in-place next to page |
| 2 | EDITOR-UTIL-MOVE | → `@kppdf/features/doc-studio` util |
| 3 | EDITOR-UI-MOVE | dumb UI → features; page stays in app |
| 4 | EDITOR-FACADE-TO-FEATURES | facade → features; shared registry dialogs stay in app |
| 5 | EDITOR-UI-SPLIT | **PARK** |

## Spec gates (must stay green)

`studio-editor-write-serial`, `catalog-insert`, `catalog-queue`, `live-rows`, `live-qty`, `hydrate-serial`, `stale-liverows`, `column-rehydrate`, `token-display`, `outside-click`, `chrome-ia`, `selected-jump`, `selected-insert-party-text`, `finalize`, `preview-zoom`, `text-library-insert`.
