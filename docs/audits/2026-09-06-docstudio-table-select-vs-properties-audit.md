# Аудит 2026-09-06 — клик по таблице DocStudio + «данные плохо грузятся»

### Preflight Check Output
- **Context read:** PO screenshot+dictation; `studio-blocks-canvas.component.ts` table-edit; `studio-editor.page.ts` onSelect/openLayerProperties/refreshLiveDataSetsOnLoad; `TZ-NX-DOCSTUDIO-S45` (переписан); S44
- **Key Constraints:** Mode A; жёсткий PO override — edit строк только в Свойствах
- **Planned Deliverable:** S45 + S46 TZ; prompt после WAVE Chrome IA
- **Validation Path:** AC в TZ

## Для PO (просто)

Сейчас при клике по **ручной** таблице программа **подменяет** красивую таблицу-документ на «редактор строк» прямо на листе (галочки, поля, + Строка). Поэтому лист «цепляется» и мешает двигать/тянуть за угол.

Ты прав: **клик = выделить и двигать**; добавлять/править строки — **справа в Свойствах**, где уже крутятся колонки и источник.

«Данные плохо грузятся» — отдельно: при открытии документа строки из каталога/КП часто **не успевают/молча не подтягиваются**, поэтому на листе остаются одни заголовки. Это чиним во второй короткой задаче (S46).

Также PO 2026-09-06: после вставки из «Выбрано» строки есть, после **drag** пропадают навсегда — root cause `saveLayouts` → `blocks.set` без preserve `liveRows` (см. `docs/audits/2026-09-06-docstudio-live-data-hydrate-audit.md`, TZ S46 **перед** этим UX).

## Facts

| Факт | Где |
|------|-----|
| Inline `.table-edit` при select + manual | `studio-blocks-canvas` ~132–197 |
| Select не открывает Свойства | `onSelect` ~932 vs `openLayerProperties` ~944 |
| В Свойствах нет редактора строк | `studio-table-properties` — шаблон/колонки/source |
| GET не гидратит liveRows | comment + `refreshLiveDataSetsOnLoad` ~1483 |
| **Drag стирает liveRows** | `saveLayouts` ~2223–2226 `blocks.set(API)` |

## Очередь

1. Дождаться WAVE-DOCSTUDIO-CHROME-IA (C1–C4) — тот же `kppdf-web`.
2. Freebuff: S45 → S46 (`tasks/PROMPT-FREEBUFF-DOCSTUDIO-S45-S46.md`).
