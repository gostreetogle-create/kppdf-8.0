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
