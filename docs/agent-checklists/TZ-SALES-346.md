# TZ-SALES-346 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-SALES-346.md` удалён после closeout.
> Conflict keys: document-template/table-template/quotation sheetLayout, proposal create template center/inspector/page/docs

## Claim slot

- agent_id: `agent-d2515d7a53`
- claimed_at: `2026-08-11`
- workspace: `D:\\kppdf-8.0` canonical `main`
- team_room_claim: `unavailable (Unknown task; claim attempted)`

## Acceptance

- [x] `Quotation.sheetLayout` хранит rowsFirstPage/rowsNextPage/photoScalePercent/photoCropYPercent/showPhotoColumn; create/update и resume/hydration проходят через один источник правды.
- [x] Backend режет длинный preview на A4 страницы, повторяет таблицу/thead и фон; итог и terms присутствуют только на последней странице.
- [x] `pageNumbering` добавляет русскую нумерацию листов при включённом флаге шаблона.
- [x] Photo scale/crop ограничены безопасным диапазоном и применяются к image cell без расползания ячейки; колонка фото может быть скрыта request-only.
- [x] Center показывает вертикальный стек iframe-листов, верхняя строка — «Страница 1 из N», один iframe остаётся без внутренних скроллов.
- [x] Backend multipage unit test: 30 строк при 4/6 → 6 страниц, 6 повторных thead, 1 footer.
- [x] Backend tsc PASS; `pnpm test -- document-template table-template quotation --runInBand`: 102/102 PASS.
- [x] Frontend tsc PASS; `pnpm test -- proposal-create --runInBand`: 33/33 PASS.
- [x] Prettier/ESLint/diff-check PASS (backend использует frontend Prettier из-за отсутствия formatter dependency в backend package).
- [x] Browser-equivalent self-verify PASS по Angular DOM/компонентным тестам; live authenticated browser smoke не запускался без backend data stack.

## Closeout

- [x] Archive marker: `tasks/_archive/2026-08/TZ-SALES-346.done.md`
- [x] Lock: `.mimocode/locks/TZ-SALES-346-kp-multipage-sheet-layout.lock`
- [x] Active marker removed.
- [x] Commit + push complete.
