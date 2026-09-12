# Audit — DocStudio editor ≠ eye-preview/PDF (tables) 2026-09-12

## PO

Настроил таблицы в редакторе (масштаб текста ок) → глаз → «совсем не то». Нужен WYSIWYG: edit === preview === print.

## Root cause (два пайплайна)

| | Редактор (canvas) | Preview / PDF |
|--|-------------------|---------------|
| Рендер | Angular `studio-blocks-canvas` `.table-preview` | BE `renderStudioTableHtml` + `document-render` CSS |
| Font | **`font-size: 9px`** | нет → дефолт iframe ~16px |
| Padding | `2px 4px` | `cellpadding="6"` + CSS `4px 8px` |
| Текст | `nowrap` + ellipsis | `overflow-wrap: anywhere` (перенос) |
| Photo thumb | max-height **28px** | max 72×48 contain |
| Zoom | sheet `fit`/`100` на хосте | iframe `srcdoc` A4 mm, без того же fit |

Итог: оператор крутит **компактный** вид на холсте; глаз показывает **другую типографику и переносы** — логично «не то».

## Fix направление

Единый контракт стилей `.pi-table` / studio table для canvas + preview HTML + PDF (font, padding, wrap, photo max). Preview iframe масштабировать как лист редактора (тот же zoomMode). Не «подкрутить глаз отдельно».

Связь: #05 (frame/photo) не заменяет этот TZ.

## Closeout (2026-09-12)

`TZ-NX-PO-SWEEP-06` DONE.

**Before:** canvas `font-size:9px; padding:2px 4px; white-space:nowrap+ellipsis`
vs BE `document-render.service.ts` — никакого `font-size` (браузерный дефолт
~16px в iframe/PDF), `padding:4px 8px`, `overflow-wrap:anywhere` (перенос).
Photo thumb: canvas 28px vs BE 48px. Preview iframe — `width/height:100%` при
фиксированном `210mm×297mm` внутреннем документе → контент обрезался
(`overflow:hidden`), а не масштабировался под `zoomMode`.

**After:** единый контракт (canvas — SoT, «как в редакторе, что PO настроил»)
внесён в `buildDocumentContentStyles`'s studio-only блок (bare selectors —
scoped и в single-page, и в multi-page/table-overflow путях, не через
`.doc-body--studio` ancestor, которого нет у `renderHtmlPages`): `font-size:9px`,
`padding:2px 4px`, `white-space:nowrap;overflow:hidden;text-overflow:ellipsis`.
Legacy/Create-КП rendering (`studioCanvas:false`) не тронут — отдельный тест
подтверждает отсутствие утечки. Photo max-height default унифицирован на 28px
(`STUDIO_TABLE_PHOTO_MAX_HEIGHT_DEFAULT_PX`, shared BE constant). Preview
iframe теперь `[style.width/height]` = реальный A4 px (794×1123 portrait,
swap для landscape) + `[style.transform]="scale(sheetSize/native)"` — тот же
`sheetSize()` сигнал, что уже двигает canvas при fit/100 zoomMode.

Специи: BE `document-render.studio-canvas.spec.ts` (+3 contract tests:
single-page match, multi-page match, no-leak в legacy), FE
`studio-editor-preview-zoom.spec.ts` (+4). Полный BE (1318/1318) и FE
(829/836) suites зелёные; `nx build kppdf-web` PASS.
