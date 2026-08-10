═══════════════════════════════════════════════════════════════
TZ-SALES-342: Create КП — своя строка (услуга/доставка/монтаж) и поля позиции
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
Аудит: docs/audits/2026-08-09-kp-builder-completeness-audit.md §2.3

РОЛЬ АГЕНТА: fullstack
ЗАВИСИМОСТИ: 340 DONE (панель Состав)
LAYER: 3
CONFLICT KEYS: backend/src/modules/quotation/quotation.schema.ts; backend/src/modules/quotation/quotation.service.ts; backend/src/modules/quotation/dto/create-quotation.dto.ts; backend/src/modules/document-template/document-template.service.ts; backend/src/modules/document-template/dto/build-document.dto.ts; frontend/src/app/pages/commercial/proposals/proposal-create-composition.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; docs/pages/proposals-create.page.md

Проверено: `quotation.schema.ts:4–35` — у `QuotationItem` `productId` **required** (ref Product),
нет `description`, нет скидки строки, нет признака «опция». Значит доставку, монтаж, шеф-надзор
и «позиция по запросу» сейчас в КП вписать нечем — менеджер вынужден заводить фиктивное изделие
в каталоге (мусор в полке, канон «каталог = полка», PO-DIARY §3).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Backend: строка КП становится двух видов**
   - `lineKind: 'catalog' | 'custom'` (default `catalog`).
   - `productId` — обязателен только при `catalog`; при `custom` обязателен `productName`.
   - Новые поля строки: `description?` (текст под названием), `discountPercent` (0…100,
     default 0), `isOptional` (default false).
   - `total` строки = `quantity × unitPrice × (1 − discountPercent/100)`; строки с
     `isOptional` **не входят** в `total` документа.
   - Миграции не нужны: старые строки читаются как `catalog` без скидки.

2. **Панель «Состав»: две кнопки добавления**
   - «Добавить из каталога» (открывает витрину) и **«Своя строка»** — сразу пустая строка
     с полями: название, описание, ед. изм., кол-во, цена.
   - У каждой строки: скидка % (узкое поле) и галочка «Не входит в стоимость».
   - Опциональные строки визуально отличаются в панели и подписаны на листе.

3. **Лист и подвал**
   - `previewLines` расширяются `description`, `discountPercent`, `isOptional`.
   - В ячейку наименования описание печатается второй строкой (мелким), если колонка
     описания на бланке не заведена отдельно.
   - Подвал: «Итого» без опциональных; при их наличии — отдельная строка
     «Дополнительно (не входит в стоимость)».

4. Tests: BE — `custom` без `productId` создаётся, `catalog` без него отвергается 400;
   `isOptional` не влияет на `total`; скидка строки уменьшает сумму.
   FE — своя строка попадает на лист и переживает F5.

ИЗМЕНЯТЬ: `QuotationItem`, расчёт итога, previewLines, панель Состав.
НЕ ИЗМЕНЯТЬ: каталог (не создавать фиктивные изделия), колонку «Скидка» на бланке как
общую скидку документа (это фон, 331), шелл 317.

known_limitation: группы/разделы позиций («Оборудование» / «Работы») и раскрытие состава
изделия подпунктами — отдельная TZ после проб PO; модули и материалы как источник строк — 348.

КРИТЕРИИ ПРИЁМКИ:
1. В КП добавляется «Доставка» / «Монтаж» без создания карточки в каталоге.
2. У строки правится описание, ед. изм. и скидка; сумма пересчитывается.
3. «Не входит в стоимость» видно на листе и не попадает в «Итого».
4. Старые сохранённые КП открываются без ошибок.
5. Gates: BE tsc + `pnpm test -- quotation`; FE tsc + `pnpm test -- proposal-create`;
   Prettier/ESLint/diff-check PASS; browser self-verify PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-342.done.md` + lock + checklist Executor report.
