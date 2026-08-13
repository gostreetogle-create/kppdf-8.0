# TZ-SALES-370: Настройки вида строки КП

РОЛЬ АГЕНТА: Senior Angular/Nest Product Engineer

ЗАВИСИМОСТИ: TZ-SALES-359…365 DONE

LAYER: 3

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create-table-editor.component.ts ; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts ; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts ; frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts ; backend/src/modules/quotation/quotation.schema.ts ; backend/src/modules/quotation/dto/create-quotation.dto.ts ; backend/src/modules/quotation/quotation.service.ts ; backend/src/modules/quotation/quotation.service.spec.ts ; backend/src/modules/generated-document/quotation-output.service.ts ; backend/src/modules/generated-document/quotation-output.service.spec.ts ; backend/src/modules/table-template/table-template.service.ts ; backend/src/modules/table-template/table-template.service.spec.ts ; docs/pages/proposals-create.page.md

## ИСХОДНОЕ СОСТОЯНИЕ

Проверено: `proposal-create-table-editor.component.ts`; `ProposalDraftLine`; `QuotationItem`; `QuotationItemDto`; `quotation-output.service.ts`; `table-template.service.ts`; `docs/audits/2026-08-12-kp-table-editor-unified-canon.md`.

1. Редактор уже имеет единственный write-path строк, inline данные, column menu, DnD/↑↓ и правый жёлоб `карточка каталога / удалить`.
2. Второй референс PO показывает полезный паттерн: отдельная строка раскрывается вниз, а её вторичные настройки получают нормальную ширину.
3. PO запрещает прятать коммерчески опасные значения: количество, цена, сумма, скидка и `Опц.` должны быть видны всегда. Название, описание и единица также остаются inline.
4. Ширина относится к колонке целиком и остаётся в caret-меню шапки. В row drawer её переносить нельзя.
5. Сейчас у строки нет persisted presentation model. Простая декоративная панель без влияния на сохранённое КП/A4 запрещена.

## РЕШЕНИЕ

В правом жёлобе каждой строки появляется явная кнопка-chevron `Настройки строки`. Она раскрывает под этой строкой одну detail-row на всю ширину таблицы. Одновременно открыта максимум одна строка.

Drawer редактирует только визуальный вид **этой строки на бланке**, не коммерческие данные:

1. `Высота строки`: `Авто | Компактная | Крупная`.
2. `Выделение`: `Обычная | Акцент`.
3. `Разделитель сверху`: да/нет.
4. `С новой страницы`: да/нет.
5. `Показывать описание на бланке`: да/нет; сам текст остаётся inline.
6. При наличии фото: `Фото`: `Как в таблице | Вписать | Обрезать`.

Любая non-default настройка даёт постоянный компактный индикатор на chevron/в строке, чтобы закрытая панель не скрывала факт особого оформления. Скидка и `Опц.` остаются видны независимо от drawer.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Добавить типизированный snapshot оформления строки

1. FE/BE модель `rowPresentation`:
   - `density?: 'auto' | 'compact' | 'large'`;
   - `emphasis?: 'normal' | 'accent'`;
   - `separatorBefore?: boolean`;
   - `pageBreakBefore?: boolean`;
   - `showDescription?: boolean`;
   - `photoFit?: 'inherit' | 'contain' | 'cover'`.
2. Backward defaults:
   - auto, normal, false, false, `showDescription=true`, inherit.
3. DTO whitelist/enum validation; неизвестные значения → 400, не silent cast.
4. Сохранение, hydrate, duplicate/edit quotation и output payload не теряют настройки.
5. Не создавать отдельную collection и не писать shared `TableTemplate`: это snapshot строки конкретного КП.

### ШАГ 2. Добавить chevron и раскрывающуюся detail-row

1. В правом жёлобе перед `Карточка каталога`/`Удалить` добавить кнопку с `ChevronDown/ChevronUp`.
2. Кнопки жёлоба привести к одному плотному, но уверенно кликабельному размеру; `pi-focus-ring`, RU title/aria.
3. После основной `<tr>` рендерить связанную detail `<tr>` с `colspan` на всю фактическую ширину таблицы.
4. Одновременно открыт один index; повторный клик закрывает; смена/удаление строки корректно закрывает или перепривязывает drawer.
5. Read-only: drawer можно открыть для просмотра, controls disabled; никаких мутаций.
6. Keyboard: Enter/Space toggle, focus остаётся предсказуемым; `aria-expanded` и `aria-controls`.

### ШАГ 3. Собрать компактное меню только про оформление

1. Секции:
   - `Вид строки`: высота, акцент, разделитель;
   - `Печать`: новая страница, показывать описание;
   - `Фото`: режим, только если у строки есть photoUrl/фото-ячейка.
2. Использовать короткие segmented/radio controls и checkboxes, не большие формы.
3. Не помещать внутрь:
   - количество, единицу, цену, сумму, скидку, `Опц.`;
   - название/описание как текстовые редакторы;
   - удаление, изменение порядка, карточку каталога;
   - настройки колонок/ширину, глобальные `Рамка` и `Шапка`;
   - дублирование строки.
4. Non-default indicator:
   - виден при закрытом drawer;
   - tooltip перечисляет активные настройки;
   - default row не получает визуальный шум.

### ШАГ 4. Применить настройки в живой таблице и A4/PDF

1. Живая строка сразу отражает density/emphasis/separator.
2. Build A4 использует тот же snapshot:
   - density управляет padding/min-height;
   - accent — сдержанное печатное выделение, читаемое light/print, без декоративной заливки;
   - separatorBefore — усиленная верхняя hairline;
   - pageBreakBefore — print-safe break перед строкой, кроме первой строки таблицы;
   - showDescription=false скрывает только отображение, не удаляет текст;
   - photoFit override применяется только этой строке; inherit сохраняет текущую глобальную настройку.
3. HTML обязательно escape-safe; rowPresentation не позволяет передавать raw CSS/class/HTML.
4. Браузерный print и серверный PDF используют один build path и визуально совпадают.

### ШАГ 5. Проверить UX и регрессии

1. Focused tests:
   - open/close/one-at-a-time;
   - correct row update after reorder/remove;
   - defaults/backward compatibility;
   - each control persists and hydrates after F5;
   - discount/optional/price remain visible while drawer closed/open;
   - indicator only for non-default;
   - A4 build and PDF payload receive all settings;
   - read-only and keyboard.
2. Browser smoke на реальном редакторе: 4 строки, раскрыть 2-ю, настроить, закрыть, убедиться по индикатору и A4, F5, print/PDF.
3. Light/dark/узкая ширина: drawer не ломает fixed table layout и не создаёт второй горизонтальный скролл.

## ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ

ИЗМЕНЯТЬ: только conflict keys и их прямые focused specs/DTO, необходимые для вертикального persistence→build.

НЕ ИЗМЕНЯТЬ:

- скидку, цену, сумму, qty, `Опц.` и их расчёт;
- глобальные toolbar `Колонки / Рамка / Шапка / Ещё`;
- column header caret/width model;
- shared TableTemplate;
- iframe A4 как редактор;
- Desktop/MCP, auth/device-enrollment;
- порядок рейлов и lifecycle КП;
- deploy/wipe.

## КРИТЕРИИ ПРИЁМКИ

1. У каждой строки есть понятный chevron; раскрытие появляется непосредственно под выбранной строкой.
2. Одновременно открыта максимум одна detail-row.
3. Drawer содержит только шесть согласованных row-presentation настроек; коммерческие данные всегда видимы в основной строке.
4. Закрытая строка с non-default оформлением имеет постоянный индикатор.
5. Настройки сохраняются в QuotationItem, переживают F5 и попадают в browser print/server PDF.
6. Старые КП без `rowPresentation` выглядят как до TZ.
7. Width остаётся column-level; shared template не мутируется.
8. Read-only/keyboard/aria/light/dark работают.
9. Gates:
   - `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
   - `cd frontend && pnpm exec jest --testPathPattern=proposal-create.page --no-coverage`
   - `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
   - `cd backend && pnpm test -- quotation.service --runInBand`
   - `cd backend && pnpm test -- table-template.service --runInBand`
   - `cd backend && pnpm test -- quotation-output.service --runInBand`
   - `pnpm architecture:check`
   - `git diff --check`
10. Browser/DOM evidence приложен в checklist; перед archive нужен Cursor/PO PASS.

## known_limitation

Верхний toolbar намеренно не переделывается в этом TZ. После того как PO потрогает row drawer, отдельным тонким проходом решить, что реально лишнее сверху.

## ФИНАЛИЗАЦИЯ

Root task: следовать `GEMINI.md`, checklist → gates → review → archive/lock/progress/docs → commit+push. Не деплоить без отдельной команды PO.
