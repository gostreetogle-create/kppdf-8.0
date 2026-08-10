═══════════════════════════════════════════════════════════════
TZ-SALES-346: Create КП — многостраничный бланк, перенос строк и размер фото
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
Аудит: docs/audits/2026-08-09-kp-builder-completeness-audit.md §2.5

РОЛЬ АГЕНТА: fullstack
ЗАВИСИМОСТИ: 341 DONE (sheetLayout хранится с КП) · 344 DONE (условия на листе)
LAYER: 3
CONFLICT KEYS: backend/src/modules/document-template/document-template.service.ts; backend/src/modules/table-template/table-template.service.ts; backend/src/modules/quotation/quotation.schema.ts; frontend/src/app/pages/commercial/proposals/proposal-create-template-center.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; docs/pages/proposals-create.page.md

Проверено: превью — один A4 `iframe` 794×1123 с `overflow: hidden`
(`proposal-create-template-center.component.ts:142`), то есть всё, что не влезло, **молча
обрезается**; 323 специально убирал скроллы, значит второй лист сейчас не показать.
Рендер `renderHtml()` собирает одну страницу; переносов таблицы по страницам нет.
Аналог решает это ровно двумя рычагами: «строк на 1-й странице» и «строк на следующих».

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Backend: страницы вместо обрезки**
   - `Quotation.sheetLayout`: `rowsFirstPage` (default 0 = авто), `rowsNextPage` (0 = авто),
     `photoScalePercent` (10…400, default 100), `photoCropYPercent` (0…100, default 0),
     `showPhotoColumn` (bool).
   - `renderHtml()` режет line-items на страницы по этим числам (0 = поместить сколько влезет),
     повторяет шапку таблицы на каждой странице, фон шаблона печатается на каждой странице.
   - Итоги/подвал и условия — только на последней странице.
   - Нумерация страниц уважает существующий флаг `DocumentTemplate.pageNumbering`.

2. **Frontend: превью показывает все листы**
   - Центр — вертикальная лента A4-страниц с воздухом между ними, каждая масштабируется
     как сейчас (contain, без горизонтального скролла); лист по-прежнему read-only.
   - Счётчик «Страница 1 из N» в верхней строке студии.

3. **Параметры → секция «Вид листа»**
   - Строк на 1-й странице · Строк на следующих · Размер фото % · Обрезка фото % ·
     Колонка фото (вкл/выкл, синхронно с панелью «Таблица», не второй источник правды).
   - Изменение — тот же debounce-rebuild; значения сохраняются с КП.

4. **Фото в ячейке**
   - `photoScalePercent` масштабирует картинку в ячейке, `photoCropYPercent` сдвигает кадр
     по вертикали (object-position), ячейка не расползается за границы страницы.

5. Tests: BE — 30 строк при `rowsFirstPage=4/rowsNextPage=6` дают ожидаемое число страниц,
   шапка повторяется, подвал один; FE — лента показывает N листов без клипа.

ИЗМЕНЯТЬ: рендер страниц, `sheetLayout`, центр превью, секцию «Вид листа».
НЕ ИЗМЕНЯТЬ: канон 323 «нет скролла внутри одного листа», геометрию рейлов 317,
общий `TableTemplate`, вёрстку блоков шаблона.

known_limitation: авто-подбор (0) считается приблизительно по высоте строки; тонкая
подгонка «в притык» остаётся ручными числами.

КРИТЕРИИ ПРИЁМКИ:
1. КП на 25 позиций показывает несколько листов и печатается в PDF целиком, без обрезки.
2. Числа переноса реально двигают строки между страницами.
3. Размер и обрезка фото меняют картинку в ячейке, не ломая таблицу.
4. Один лист по-прежнему без внутренних скроллов.
5. Gates: BE tsc + `pnpm test -- document`; FE tsc + `pnpm test -- proposal-create`;
   Prettier/ESLint/diff-check PASS; browser self-verify PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-346.done.md` + lock + checklist Executor report.
