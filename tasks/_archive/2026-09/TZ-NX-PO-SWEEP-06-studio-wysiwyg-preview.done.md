# TZ-NX-PO-SWEEP-06: studio WYSIWYG — editor === preview === PDF (таблицы)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-12
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (backend tsc + nx build AOT)
  - tests: PASS (backend 1318/1318; frontend 829/836, 7 skipped; +3 BE, +4 FE new)
  - lint: N/A (не запускал отдельно, tsc/build clean)
  - checklist: ADDED
  - progress.md: N/A (ops/UX sweep wave)
  - status synchronization: PASS

## Root cause

Two independent style pipelines drifted: the editor canvas
(`studio-blocks-canvas.component.ts` `.table-preview`) tuned to
`font-size:9px; padding:2px 4px; white-space:nowrap+ellipsis`, while BE
preview/PDF rendering (`document-render.service.ts`
`buildDocumentContentStyles`) had no font-size at all (ambient browser
default), `padding:4px 8px`, and `overflow-wrap:anywhere` (actual wrapping).
Photo thumb max-height also differed (28px canvas vs 48px BE). Separately,
the preview iframe stretched `width/height:100%` while its own document was
a fixed `210mm×297mm` page — content clipped instead of scaling with the
editor's `zoomMode`.

## Fix

`document-render.service.ts`: added the canvas's own table contract
(font-size 9px, padding 2px 4px, nowrap+ellipsis) as bare selectors inside
the already-studio-only `studioCanvasCss` block — works in both
`renderHtml` (single-page) and `renderHtmlPages` (multi-page/table-overflow;
its `<body>` has no `.doc-body--studio` class, so scoping relies on the
block being conditionally emitted + source order, not an ancestor
selector). The pre-existing global `th,td{padding:4px 8px;overflow-wrap:
anywhere}` rule (shared with legacy/Create-КП rendering) stays untouched.

Photo max-height default unified: was 48 in two BE
`tablePhotoDisplayFromBlock` copies + `renderPhotoCellHtml`'s own default —
now a shared `STUDIO_TABLE_PHOTO_MAX_HEIGHT_DEFAULT_PX = 28` constant
matching the FE canvas default from #05.

`studio-editor.page.ts`: the preview `<iframe>` is now sized to its real A4
pixel dimensions (`previewNativeSheetSize`, swapping for landscape) and
scaled via `[style.transform]="scale(previewZoomScale())"`, where
`previewZoomScale = sheetSize().width / native.width` — the same
`sheetSize()` signal the editor canvas already renders at for `fit`/`100`
zoom, so editor and preview now visually match instead of the iframe
clipping its content.

## Gates

| Gate | Result |
|------|--------|
| `backend tsc --noEmit` | PASS |
| `backend pnpm test` (full) | PASS 1318/1318 |
| `frontend nx test kppdf-web` (full) | PASS 829/836 (7 skipped) |
| `frontend nx build kppdf-web` | PASS (no new warnings) |

## Files changed

- `backend/src/modules/document-render/document-render.service.ts`
- `backend/src/modules/document-render/document-render.studio-canvas.spec.ts`
- `backend/src/modules/studio-document/studio-data-resolver.ts`
- `backend/src/modules/studio-document/studio-data-resolver.spec.ts`
- `backend/src/modules/document-render/studio-multipage.utils.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-preview-zoom.spec.ts` (new)
- `docs/agent-checklists/TZ-NX-PO-SWEEP-06-studio-wysiwyg-preview.md` (new)
- `docs/audits/2026-09-12-studio-editor-preview-wysiwyg.md` (closeout)
