# Audit — DocStudio: «Документ изменён в другом месте» постоянно

date: 2026-09-13  
PO: диалог вылезает постоянно при работе в редакторе (не обязательно вторая вкладка).

## Что это

Optimistic concurrency: почти каждая запись несёт `expectedRevision`. Сервер при mismatch → **409**. FE почти на любой `!r.ok` зовёт `conflict()` с текстом про «другую вкладку» — даже когда это **своя** гонка или вообще не 409.

## Факты по коду (после ADD-PAGE-WRITE-SERIAL)

| Путь | В `catalogWriteChain`? | На fail |
|------|------------------------|---------|
| addPage / orientation / background / numbering | да | `conflict()` |
| on-load hydrate `putDataSet` | да | toast (не dialog) |
| `saveLayouts` / `schedule()` (drag 400ms) | **нет** | `conflict()` |
| `createTextLayer` / image create | **нет** | `conflict()` |
| `rehydrateLiveRowsAfterColumnChange` `putDataSet` | **нет** | silent return |
| `patchTableSettings` → `template-blocks` PATCH | N/A (не bump doc revision) | всё равно `conflict()` |

`SilentResult.error` = `HttpErrorResponse` → можно отличить `status === 409`.

## Почему «постоянно»

Типичный цикл: открыл документ (hydrate крутит revision) **или** тронул колонки/qty (rehydrate off-chain) **параллельно** с drag/layout debounce или «+ текст» → 409 → диалог «другая вкладка». Оператор думает, что сломалось всё.

## Follow-up

`tasks/_ready/TZ-NX-DOCSTUDIO-REVISION-RACE-UX.md`
