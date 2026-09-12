# TZ-NX-PO-SWEEP-05: studio table — Photo.frame + контроль вставки фото в ячейке

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-12
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (backend tsc + nx build AOT)
  - tests: PASS (backend 1315/1315; frontend 825/832, 7 skipped; +2 new FE, +6 new BE)
  - lint: N/A (не запускал отдельно, tsc/build clean)
  - checklist: ADDED
  - progress.md: N/A (ops/UX sweep wave)
  - status synchronization: PASS

## Root cause

`Photo.frame` (fit/pan from the catalog card's «РАМКА» editor) was resolved
nowhere in the studio table pipeline: `resolveCatalogPhotoUrls` only selected
`storageUrl`, and both canvas and BE PDF/preview render hardcoded
contain/28-48px. There was also no UI in Свойства таблицы to control how a
photo cell fits its frame.

## Fix

`backend/src/modules/studio-document/studio-data-resolver.ts`:
`resolveCatalogPhotoUrls` now selects `frame` alongside `storageUrl`;
`fetchLiveRows` returns `{ rows, photoFrames? }` (catalog branch only,
keyed by resolved URL — cell values stay plain strings, no `liveRows`
restructure); `resolveDataSets` carries `photoFrames` on the resolved
entry; `renderPhotoCellHtml`/`renderStudioTableHtml` take an optional
`photoOptions` (frames + block fit override + maxHeightPx) and emit
`object-fit`/`object-position` from the frame instead of a hardcoded
contain; `injectTableContent` wires it from `entry.photoFrames` + a new
`tablePhotoDisplayFromBlock` reader.

`backend/src/modules/document-render/studio-multipage.utils.ts` (PDF
pagination's own `renderStudioTableHtml` call site): same `photoOptions`
wired through a new `readDataSetEntry` + local `tablePhotoDisplayFromBlock`,
so multi-page PDF output matches single-page/canvas.

`frontend-nx` `studio-editor.page.ts`: `applyLiveRowsFromDataSet` copies
`dataSet.photoFrames` into `block.settings.livePhotoFrames` alongside
`liveRows`. `studio-blocks-canvas.component.ts`: photo cell `<img>` gets
`[ngStyle]="photoCellStyle(block, cell)"`, reusing `photoFrameStyle`/
`normalizePhotoFrame` from `@kppdf/ui/photo` (the same helper the catalog
card's РАМКА editor uses) — hardcoded CSS `object-fit`/`max-height` removed.
`studio-table-defaults.ts`: new `studioTablePhotoDisplay(block)` reader.
`studio-table-properties.component.ts`: new «Фото в ячейке» section
(gated on a photo column existing) — fit override select + max-height
number input, persisted via the existing `settingsChange` → block.settings
patch path (same as the transparent-background toggle).

Pan/crop stay catalog-owned (the card's «Рамка» button) — no second
frame-editor was built inside the table, per PO's own decision.

## Gates

| Gate | Result |
|------|--------|
| `backend tsc --noEmit` | PASS |
| `backend pnpm test` (full) | PASS 1315/1315 |
| `frontend nx test kppdf-web` (full) | PASS 825/832 (7 skipped) |
| `frontend nx build kppdf-web` | PASS (new non-blocking budget warning, +3.11kB/500kB, from `@kppdf/ui/photo` reuse) |

## Files changed

- `backend/src/modules/studio-document/studio-data-resolver.ts`
- `backend/src/modules/studio-document/studio-data-resolver.spec.ts`
- `backend/src/modules/document-render/studio-multipage.utils.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts`
- `docs/agent-checklists/TZ-NX-PO-SWEEP-05-studio-table-photo-frame.md` (new)
- `docs/audits/2026-09-12-studio-table-photo-frame.md` (closeout)
