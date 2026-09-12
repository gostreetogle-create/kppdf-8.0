# TZ-NX-PO-SWEEP-06 checklist — studio WYSIWYG editor===preview===PDF

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-PO-SWEEP-06-studio-wysiwyg-preview.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-12T00:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI local, no Team Room in this session)

## Preflight

- [x] `_NOW.md` + `tasks/_active/` — только этот TZ
- [x] TZ + audit прочитаны

### Preflight Check Output
- **Context read:** audit 2026-09-12 (canvas 9px/2px4px/nowrap vs BE no font-size/cellpadding=6/wrap/48px photo); `studio-blocks-canvas.component.ts` `.table-preview` CSS (canvas contract: font-size 9px, padding 2px 4px, white-space nowrap+ellipsis); `document-render.service.ts` `buildDocumentContentStyles` (global `th,td{padding:4px 8px;overflow-wrap:anywhere}` — shared by legacy/Create-КП + studio, no font-size); `studio-output.service.ts` `preview()`/`downloadPdf()` both call the SAME `renderStudioDocument()` → single html; `studio-editor.page.ts` preview iframe (`width:100%;height:100%` while inner doc is fixed `210mm×297mm` — clips instead of scaling); `syncSheetSize()` (fit = measured host rect; '100' = hardcoded 794×1123, same 96dpi numbers)
- **Key Constraints:** не трогать global (non-studio) `th,td` rule — Create-КП/legacy must stay untouched; `renderHtmlPages`'s outer `<body>` has no `doc-body--studio` class (checked) — table CSS must not depend on that ancestor; landscape+100% zoom pre-existing editor quirk (sheetSize hardcodes portrait dims) — out of scope, preview now matches it (parity, not a new fix)
- **Planned Deliverable:** studio-scoped table CSS contract (9px/2px4px/nowrap+ellipsis) in `buildDocumentContentStyles`'s `studioCanvasCss` block (bare selectors, scoped by source-order + the block already being studio-only-emitted, not by ancestor class — works in both `renderHtml` and `renderHtmlPages`); BE photo max-height default unified 48→28 (matches FE/canvas default from #05); preview iframe sized to native A4 px + `transform:scale(sheetSize/native)` for fit/100 parity
- **Validation Path:** BE contract specs (document-render.studio-canvas.spec.ts) + FE computed-signal specs (studio-editor-preview-zoom.spec.ts) + full BE+FE suites + `nx build kppdf-web` last

## Acceptance (из TZ)

- [x] Один документ: editor vs eye — таблицы визуально сопоставимы (кегль/плотность/переносы — единый CSS contract; ширина колонок не трогал, уже % based)
- [x] PDF/print path использует тот же table CSS contract (`buildDocumentContentStyles` — один код-путь для preview() и downloadPdf(), оба вызывают `renderStudioDocument`)
- [x] Specs green; `nx build kppdf-web` last
- [x] Closeout в audit: before/after note

## Integrity slot

- [x] Тип изменения: page (studio editor) + backend module (document-render)
- [x] FIC / page.md / DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP: N/A (внутренний рендер-контракт, не новый route/permission)
- [x] Чужой WIP не в коммите

## Gates (факт)

- `backend: pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `backend: pnpm test` (full) → PASS 1318/1318 (133 suites), +3 новых (document-render.studio-canvas.spec.ts)
- `frontend: nx test kppdf-web` (full) → PASS 829/836 (7 skipped), +4 новых (studio-editor-preview-zoom.spec.ts)
- `frontend: nx build kppdf-web` → PASS (те же pre-existing warnings что и #05, ничего нового)

## Executor report

- **BE `document-render.service.ts`:** `studioCanvasCss` (only emitted when `studioCanvas===true`, for both `renderHtml` single-page и `renderHtmlPages` multi-page — verified `renderHtmlPages`'s outer `<body>` has no `doc-body--studio` class, so used bare `table{font-size:9px}` / `th,td{padding:2px 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}` selectors relying on source-order override + the conditional block itself, not an ancestor class) — matches canvas's `.table-preview` contract exactly. Global (non-studio) `th,td{padding:4px 8px;overflow-wrap:anywhere}` untouched — legacy/Create-КП unaffected (verified by negative test).
- **BE photo max-height default:** was 48 in two `tablePhotoDisplayFromBlock` copies (`studio-data-resolver.ts`, `studio-multipage.utils.ts`) + `renderPhotoCellHtml`'s own default param — now a shared exported `STUDIO_TABLE_PHOTO_MAX_HEIGHT_DEFAULT_PX = 28` matching FE canvas's own default (`STUDIO_TABLE_PHOTO_MAX_HEIGHT_DEFAULT_PX` in `studio-table-defaults.ts`, added in #05). Updated the one stage-05 spec assertion that expected the old 48px default.
- **FE `studio-editor.page.ts` preview iframe:** was `width:100%;height:100%` on an iframe whose OWN document is fixed `210mm×297mm` (~794×1123px) — mismatched against whatever `.kp-ws-sheet` measured (a `fit`-mode scale), so the doc clipped instead of shrinking (`overflow:hidden` on the render CSS's `html,body`). Now: iframe sized to its true native px (`previewNativeSheetSize` — swaps for landscape) + `[style.transform]="scale(previewZoomScale())"` where `previewZoomScale = sheetSize().width / native.width` — same `sheetSize()` signal the editor canvas itself already renders at, so `fit`/`100` now visually match between editor and preview.
- **Known pre-existing gap not touched:** `syncSheetSize()`'s `'100'` branch hardcodes portrait 794×1123 regardless of orientation — a latent editor-canvas quirk for landscape+100% zoom, unrelated to this TZ's WYSIWYG-parity scope; preview now reproduces the SAME numbers (parity with editor, not a new bug).
- Audit closeout added (before/after summary).

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-12
