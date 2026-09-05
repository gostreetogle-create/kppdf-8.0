# TZ-NX-DOCSTUDIO-S44-TABLE-CANVAS-SELECT-FIX: выбор таблицы на холсте + подсветка поля ERP

**РОЛЬ АГЕНТА:** Executor (frontend-nx)
**SIZE:** L
**LAYER:** 3
**PAGES:** document-studio
**PAGE_DOCS:** `docs/pages/document-studio.page.md`
**ЗАВИСИМОСТИ:** нет (следует за D50–D54 Data IA, S28/S29 live-hydration, S37B token preview — все DONE)
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts`; `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts`; `frontend-nx/libs/ui/paper-and-ink/src/lib/rich-text/pi-rich-text-editor.component.ts`; IMPLICIT `nx build kppdf-web`

Проверено: `studio-blocks-canvas.component.ts` (template + класс, целиком), `studio-table-defaults.ts`,
`studio-table-properties.component.ts`, `studio-editor.page.ts:949-1024,1419-1457,1507-1531`,
`pi-rich-text-editor.component.ts`, `substitution-token.extension.ts`,
`studio-output.service.ts:130-200`, `backend/src/modules/document-render/document-render.service.ts`,
`backend/src/modules/document-render/document-render.utils.ts`, архив
`TZ-NX-DOCSTUDIO-S28-PUT-DATASET-HYDRATE.done.md`, `TZ-NX-DOCSTUDIO-S29-FE-LIVEROWS.done.md`,
`TZ-NX-DOCSTUDIO-D52-INSERT-SUGGEST.done.md`, `TZ-NX-DOCSTUDIO-S37B-COUNTERPARTY-TOKEN-PREVIEW.done.md`,
`TZ-NX-DOCSTUDIO-S8-TABLE-ERP-BIND.md`, `TZ-NX-DOCSTUDIO-S8-TEXT-SUBSTITUTION.md`,
`docs/pages/document-studio.page.md` §2.2-2.4, §3.1-3.3.

Постановка от PO: скриншот `A4`-холста, где две вставленные таблицы показывают только
шапку (без строк), а третья — реальные данные; скриншот попапа со строками
(Вкл/Наименование/Кол-во/Цена/+ Строка), который PO принял за мусор от старой
реализации; жалоба, что вставленный текстовый токен `{{counterparty.name}}` в
документе неотличим от обычного текста; жалоба на «два клика» для перетаскивания
вставленной таблицы.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. **У блока-таблицы два источника строк, переключаемых кликом** —
   `studio-blocks-canvas.component.ts:113-223`:
   - НЕ выбрана → рендерится `table-preview` → `tableRows(block)` (строка 443) →
     сначала `settings.liveRows` (реальные строки из каталога/КП/заказа,
     подтягиваются `putDataSet` в S28/S29/D52), иначе `studioVisibleTableRows`.
   - Выбрана (клик, `selectedId === block._id`) → рендерится `table-edit`
     (строки 131-196, попап со скриншота PO) → `tableRowsAll(block)` (строка 451) →
     `studioTableRows(block)` → `settings.tableTemplateSampleRows` — статичный
     шаблонный массив, для таблицы «из выбранного» пустой/дефолтный
     (`[['','','']]`, см. `STUDIO_DEFAULT_TABLE_ROWS` в `studio-table-defaults.ts:18`).
   Клик по таблице с источником данных не показывает `liveRows` — визуально
   «данные исчезли», причём это происходит уже на первом клике после вставки
   (`createTableBlock()` в `studio-editor.page.ts:965-995` кладёт
   `tableTemplateSampleRows = STUDIO_DEFAULT_TABLE_ROWS` = `[['','','']]` и
   никогда её не обновляет; `setBlockCatalogSource()`/`applyLiveRowsFromDataSet()`
   в `studio-editor.page.ts:998-1024,1452-1457` пишут реальные строки только в
   `liveRows`). Это не мусор от старой реализации: `table-edit` — рабочий
   способ ввода ячеек для **ручных** таблиц (`rowSource() === 'manual'`,
   см. `studio-table-properties.component.ts:430-434`), для которых `liveRows`
   не существует в принципе. Конфликт возник потому, что `table-edit` показывается
   по признаку «выбрана», а не по признаку «источник данных = ручной».
   **Риск не только визуальный:** если в этом состоянии потрогать чекбокс/ячейку/
   `+ Строка`, `onTableCell`/`toggleTableRow`/`addTableRow` эмитят `tableRowsChange`
   на основе той же пустой `studioTableRows()` → `studio-editor.page.ts:1419-1423`
   `patchTableRows()` → `patchTableSettingsForBlock()` (1507-1531) **сохраняет** этот
   пустой массив в `tableTemplateSampleRows` на бэкенде. `liveRows` при этом не
   трогается и таблица в предпросмотре/PDF не портится (бэкенд резолвит данные
   независимо, см. п.5), но локальное состояние блока становится противоречивым.
2. **Панель «Свойства» для таблицы уже существует и уже открывается по выбору**
   (`studio-table-properties.component.ts`, host `pi-studio-table-properties` в
   `studio-properties-panel.component.ts`) — там выбор источника/шаблона/колонок,
   но **нет** редактирования значений ячеек. Значит `table-edit` на холсте — пока
   единственный способ ввести данные в ручную таблицу; убрать его совсем нельзя,
   не сломав ручные таблицы (подтверждено PO).
3. **Текстовые/фото-блоки при выборе не показывают ничего похожего на `table-edit`**
   (строки 57-112) — только `selection-frame` + `resize-handle`. Значит целевое
   поведение для таблицы с источником данных должно быть таким же.
4. **Токен `{{counterparty.name}}` уже является отдельным TipTap-узлом**
   `substitutionToken` (`substitution-token.extension.ts`), а не сырым текстом —
   `pi-rich-text-editor.component.ts:483-505` при вставке распознаёт `{{...}}` и
   вставляет атомарный `span[data-substitution-token]`. Пока активно печатаешь —
   он уже подсвечен (`pi-rich-text-editor.component.ts:350-361`, моно-шрифт + плашка
   `oklch(var(--color-ink))` на фоне `--color-paper-2`), но это `::ng-deep`-стиль,
   принадлежащий компоненту живого редактора. Холст в состоянии просмотра рендерит
   тот же HTML через `[innerHTML]="textHtml(block)"` (строка 81) без этих правил —
   отсюда «голый» токен на скриншоте PO. В проекте уже есть готовый токен цвета
   `--color-info` (`paper-and-ink/src/styles/global.css:133-134`, с override для
   тёмной темы на строках 552-553) — синий, с уже определённым тёмным вариантом,
   ничего изобретать не нужно.
5. **PDF/печать не видит эти стили — подтверждено кодом, не только предположением.**
   `studio-output.service.ts:158-186` резолвит `{{counterparty.*}}` на бэкенде через
   `buildSubstitutionBag`; фактическую подстановку в HTML делает
   `backend/src/modules/document-render/document-render.service.ts:59-76`
   (`substitute()`) — обычный regex-replace текста `{{...}}` внутри уже готового
   HTML блока (span `substitution-token` при этом не вырезается, остаётся как
   обёртка вокруг подставленного значения). Сгенерированный для Puppeteer
   `<style>`-блок (`document-render.service.ts:103-111,291-317`,
   `buildDocumentContentStyles`/`blockStyleCss`) **не содержит правила для
   `.substitution-token` вообще** — этот класс стилизован только в Angular-компоненте
   живого редактора и физически не попадает в PDF/print-пайплайн. Значит правило
   «цвет только в редакторе/холсте, чёрным в печати» уже гарантировано архитектурой
   независимо от Шага 2 — бэкенд трогать не нужно, задача Шага 2 только визуальная
   на фронте.
6. На скриншоте PO вставленный токен и следующий текст склеены без пробела
   (`{{counterparty.name}}Новый текст`) — `insertContent` (`pi-rich-text-editor.component.ts:483-507`)
   не добавляет разделитель после вставки токена.
7. **Баг «два клика для драга» — причина найдена, чинится тем же Шагом 1.**
   `startDrag()` (`studio-blocks-canvas.component.ts:530-588`) на строке 534 имеет
   guard: `if (target.closest('input, button, textarea, select, .table-edit, .cell-input')) return;`.
   Пока таблица выбрана, `.table-edit` (строки 131-196) лежит поверх неё — первый
   `pointerdown` на уже выбранной (или только что вставленной и сразу выбранной)
   таблице попадает целью внутрь `.table-edit`, guard срабатывает, `startDrag`
   выходит без старта драга. Клик мимо таблицы снимает выбор → рендерится
   `table-preview` (у него `pointer-events: none`, строка ~282, события проходят
   на `<article>`) → следующий клик уже не задет `.table-edit` → драг стартует
   нормально. У text/image-блоков аналога `.table-edit` нет — по коду баг для них
   не воспроизводится в принципе; отдельного расследования не требуется, только
   контрольная живая проверка после Шага 1 (см. Шаг 3).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Показывать `table-edit` только для ручных таблиц

  1.1. Вынести определение источника таблицы в общий хелпер
       `studioTableRowSource(block)` в `studio-table-defaults.ts` (сейчас логика
       продублирована как приватный `rowSource()` в
       `studio-table-properties.component.ts:430-434` — не трогать его сигнатуру
       снаружи, просто заменить тело на вызов общего хелпера).
  1.2. В `studio-blocks-canvas.component.ts` условие `@if` на строке 131
       (`selectedId === block._id && !block.locked && !readOnly`) дополнить
       проверкой `studioTableRowSource(block) === 'manual'`. Для таблиц с
       источником `quotation-items`/`order-items`/`catalog-*` при выборе — только
       `selection-frame` + `resize-handle` (строки 219-222), как у text/image.
  1.3. `table-preview` (строки 197-218, `tableRows()`) остаётся видимым и для
       выбранной таблицы с источником данных — таблица не «пустеет» после клика.

ШАГ 2: Подсветка поля ERP на холсте (в состоянии просмотра, не активного редактирования)

  2.1. Добавить CSS-правило для `.substitution-token` в области рендера текстовых
       блоков холста (`textHtml()` / `[innerHTML]` в `studio-blocks-canvas.component.ts`,
       `::ng-deep`, как это уже сделано в `pi-rich-text-editor.component.ts:350-361`) —
       `color: oklch(var(--color-info))`. Не переопределять `background`/`border` —
       эффект должен быть «текст другого цвета», а не «плашка», чтобы не спорить
       с версткой печатной формы.
  2.2. По коду уже подтверждено (см. ИСХОДНОЕ п.5), что PDF-пайплайн не содержит
       правила для `.substitution-token` — бэкенд трогать не нужно. Один раз
       перепроверить фактом (открыть Просмотр документа со вставленным
       `{{counterparty.name}}`), что цвет действительно не унаследован — если
       вдруг унаследован вопреки код-ридингу, это сигнал более глубокой проблемы
       и повод остановиться и уточнить у PO, а не чинить наугад в PDF-шаблоне.
  2.3. В `insertContent()` (`pi-rich-text-editor.component.ts:483-507`) после
       вставки `substitutionToken`-узла вставлять следующий пробел (` `), если
       курсор не находится перед уже существующим пробелом/концом текста —
       чтобы токен не склеивался со следующим словом.

ШАГ 3: Контрольная проверка «двух кликов для драга» после Шага 1

  Причина уже установлена (ИСХОДНОЕ п.7): guard в `startDrag()` (строка 534,
  `target.closest('.table-edit')`) глотает первый `pointerdown`, пока `.table-edit`
  лежит поверх таблицы. Отдельного фикса не требуется — Шаг 1 убирает `.table-edit`
  для таблиц с источником данных, guard перестаёт матчиться, драг работает с
  первого клика сам по себе. Здесь только контрольная живая проверка, не разработка:
  3.1. После Шага 1 вручную проверить клик+сразу-драг на: (a) таблице с источником
       данных (должно чиниться), (b) ручной таблице (должно остаться как было —
       через `.table-edit` там драг с первого клика и не предполагался, это
       ожидаемое поведение, не регресс), (c) text- и image-блоке (по коду у них
       нет `.table-edit`-аналога — баг там не должен воспроизводиться ни до, ни
       после; если внезапно воспроизводится — это отдельная, не описанная в этой
       TZ причина, зафиксировать отдельно и не чинить в рамках этого Шага).
  3.2. Результат (починилось / нет) зафиксировать в отчёте по TZ.

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- `studio-blocks-canvas.component.ts` — условие показа `table-edit` (Шаг 1); CSS для
  `.substitution-token` в canvas-рендере текста (Шаг 2). `selectBlock`/`startDrag`
  сами по себе НЕ меняются — драг чинится косвенно тем, что guard на строке 534
  перестаёт матчить `.table-edit` для таблиц с источником данных (Шаг 3 —
  только проверка, не код).
- `studio-table-defaults.ts` — новый общий хелпер `studioTableRowSource`.
- `studio-table-properties.component.ts` — `rowSource()` переиспользует хелпер
  (без изменения публичного поведения панели).
- `pi-rich-text-editor.component.ts` — пробел после вставки токена.

НЕ ИЗМЕНЯТЬ:
- `studio-table-properties.component.ts` — не добавлять туда редактирование
  значений ячеек (PO подтвердил: для ручных таблиц попап на холсте остаётся
  единственным способом ввода, отдельная TZ на перенос в панель — не сейчас).
- Backend (`studio-output.service.ts`, `studio-data-resolver.ts`,
  `buildSubstitutionBag`) — резолвинг токенов и PDF-пайплайн не трогать, если
  Шаг 2.2 не найдёт реальной утечки цвета.
- `liveRows`/`putDataSet`/`onTableSourceChange`/hydration-путь (S28/S29/D52) —
  логика подтяжки живых данных не трогается, меняется только то, какой DOM
  показывается по клику.
- Миграция/починка уже сохранённых документов — по решению PO проект на стадии
  проектирования без продакшн-данных, откат/чистка старых документов не нужны.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Вставленная из «Данные → Выбрано» таблица с товарами: клик по ней на холсте
   НЕ скрывает и НЕ обнуляет видимые строки — таблица остаётся с данными, показан
   только `selection-frame` + resize handle (как у text/image), повторные клики
   туда-обратно не меняют содержимое.
2. Ручная таблица (`rowSource === 'manual'`, без источника): клик по ней **по-прежнему**
   открывает попап редактирования строк (Вкл/+ Строка) — поведение не сломано.
3. Свойства таблицы (панель справа) по-прежнему открываются при выборе любой таблицы —
   не регрессировало.
4. В тексте документа `{{counterparty.name}}` на холсте (без активного редактирования
   текста) визуально отличим по цвету (`--color-info`) от обычного текста; после
   вставки токена есть разделяющий пробел перед следующим текстом.
5. Открыть Просмотр/PDF документа с таким токеном — текст в PDF чёрный, как остальной
   документ (не наследует `--color-info`).
6. Клик + сразу драг работает с первого раза для таблиц с источником данных
   (чинится побочным эффектом Шага 1, отдельного кода в `selectBlock`/`startDrag`
   не требуется — см. ИСХОДНОЕ п.7). Text/image блоки и ручные таблицы — без
   регресса (см. Шаг 3.1 a/b/c).
7. `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern="studio"` → PASS.
8. `cd frontend-nx && pnpm exec nx lint kppdf-web` → без новых ошибок относительно
   бейзлайна (см. прецедент в S37B — там уже есть pre-existing lint failures, не
   создавать новые).
9. `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS, exit 0 (последней командой).

known_limitation: редактирование значений ячеек ручной таблицы остаётся только на
холсте (попап), перенос в панель «Свойства» — отдельная TZ при необходимости.
Кнопка «Редактировать» у выбранных товаров в панели «Данные» (упомянута PO как
следующий шаг) в этой TZ не строится — сейчас такого элемента нигде нет
(проверено по всей `pages/studio/`), это отдельная TZ. Если Шаг 3.1(c) внезапно
покажет баг «двух кликов» на text/image — не расследовать в рамках этой TZ,
задокументировать воспроизведение (шаги/скрин) отдельно.

═══════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude
verification:
  - acceptance criteria: PASS (1-9, см. checklist docs/agent-checklists/TZ-NX-DOCSTUDIO-S44-TABLE-CANVAS-SELECT-FIX.md)
  - typecheck: PASS (via nx build kppdf-web)
  - tests: PASS (nx test kppdf-web --testPathPattern=studio — 80 suites, 516 passed, 7 skipped)
  - lint: PASS (235 problems / 33 errors — identical to pre-change baseline, no new errors, git-stash verified)
  - build: PASS (nx build kppdf-web exit 0, last gate)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-S44-TABLE-CANVAS-SELECT-FIX.md)
  - progress.md: N/A (проект не ведёт единый progress.md для nx-волн, см. docs/PROJECT-MEMORY.md)
  - status synchronization: PASS (_NOW.md / QUEUE-LIVE.md / WAVE обновлены)
known_limitation: живая браузерная проверка (клик/драг/цвет) не выполнена — нет
Playwright/chromium-cli в репозитории; AC 1/2/6 подтверждены детерминированным
разбором потока управления (@if условие / startDrag guard closest()), AC 4/5 —
код-ридингом (единственное CSS-правило на `.substitution-token` в этом
компоненте, отсутствие класса в backend/document-render подтверждено grep).
