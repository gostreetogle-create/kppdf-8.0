# Аудит 2026-09-06 — DocStudio liveRows пропадают после drag

date: 2026-09-06  
author: Cursor (Mode A)  
trigger: PO — вставка из «Выбрано» даёт строки; после move/release строки исчезают и не возвращаются кликами

### Preflight Check Output
- **Context read:** `studio-editor.page.ts` `saveLayouts` / `applyLiveRowsFromDataSet` / `refreshLiveDataSetsOnLoad`; `studio-blocks-canvas` `tableRows`; BE `hydrateLiveDataSetRows` comment (не персистит)
- **Key Constraints:** Mode A; фикс в S46 до S45
- **Planned Deliverable:** этот audit + TZ S46
- **Validation Path:** AC S46 smoke drag

## Для PO

Ты описал реальный баг, не «ощущение». Строки после вставки живут **только в памяти экрана**. Как только двигаешь таблицу, программа сохраняет позицию на сервер и **подменяет** всю таблицу ответом сервера — а сервер эти временные строки не хранит. Поэтому они исчезают. Клики их не возвращают, потому что повторная подгрузка при клике не делается.

## Root cause (file:line)

| Шаг | Код |
|-----|-----|
| Строки появляются | `applyLiveRowsFromDataSet` → `settings.liveRows` |
| Сервер не хранит liveRows | `studio-document.service.ts` hydrate «Does not persist the hydrated rows» |
| Drag сохраняет layout | `flushLayouts` → `saveLayouts` |
| Стирание | `saveLayouts` → `this.blocks.set(normalized)` из API **без** liveRows (`studio-editor.page.ts` ~2223–2226) |
| Клики не помогают | нет re-putDataSet на select |

## Fix direction (S46)

Merge client `liveRows` при apply layout response (+ safety re-hydrate). Не писать liveRows в Mongo без отдельного решения PO.

## Related

- TZ: `tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-S46-LIVE-DATA-HYDRATE.md`
- UX клик/Свойства: S45 (после S46)
