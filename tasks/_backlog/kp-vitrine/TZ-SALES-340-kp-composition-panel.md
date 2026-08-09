═══════════════════════════════════════════════════════════════
TZ-SALES-340: Create КП — панель «Состав КП» (строки, кол-во, цена, порядок)
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
Аудит: docs/audits/2026-08-09-kp-builder-completeness-audit.md §2.3

РОЛЬ АГЕНТА: fullstack
ЗАВИСИМОСТИ: 339 DONE (autosave) · 335 DONE (колонки кол-во/цена на листе)
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; frontend/src/app/pages/commercial/proposals/proposal-create-composition.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create-composition.component.spec.ts; frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts; docs/pages/proposals-create.page.md

Проверено: `proposal-product-rail.component.ts:382–390` — Add всегда `quantity: 1`,
`unitPrice = listPrice ?? 0`; `proposal-create.page.ts:907–912` кладёт строку в `draftLines`
и **нигде её не показывает**; `quotation.schema.ts:4–35` уже имеет `quantity`, `unit`,
`unitPrice`, `sortOrder`, `total` на `QuotationItem`; автосохранение маппит `draftLines`
в `items[]` (`proposal-create.page.ts:609–618`).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Новая панель правого рейла «Состав»**
   - Иконка перед «Параметры» (`data-test="kp-create-toggle-composition"`), overlay как 332,
     взаимоисключающая с Параметрами/Таблицей; лист A4 не сжимается.
   - Пустое состояние: «Добавьте изделия из панели Товары» + кнопка, открывающая витрину.

2. **Строка состава** (`app-proposal-create-composition`)
   - Мини-фото (если есть) · название · «Арт: SKU · База: N ₽» мелким.
   - Кол-во: `−` / поле / `+` (дробное разрешено, минимум 0.001, шаг 1 у кнопок).
   - Цена за единицу: числовое поле (округление до копеек), по умолчанию `listPrice`.
   - Ед. изм.: короткое поле (из карточки, правится).
   - Сумма строки — read-only справа.
   - Действия: дублировать · удалить (иконки-кнопки `PiButton`, RU tooltip).
   - Порядок: `↑` / `↓`, пишет `sortOrder`.

3. **Связь с листом и сохранением**
   - Любое изменение → тот же debounce-rebuild `build()` (не новый канал) и автосохранение
     `items[]` с `sortOrder`, `unit`, `unitPrice`, `quantity`, `total = quantity × unitPrice`.
   - Итог панели = сумма строк с учётом наценки — тем же расчётом, что подвал листа (331).
   - После F5 состав восстанавливается из `Quotation.items` в том же порядке.

4. **Витрина**
   - Add продолжает работать; если изделие уже в составе — увеличить `quantity` существующей
     строки, а не плодить дубль (дублировать можно только явной кнопкой).

5. Tests: изменение qty меняет `previewLines` и сумму; удаление убирает строку из payload;
   ↑/↓ меняет `sortOrder`; повторный Add увеличивает кол-во.

ИЗМЕНЯТЬ: правый рейл студии, `draftLines` модель, автосохранение items.
НЕ ИЗМЕНЯТЬ: шелл 317 (геометрия rails|center), `TableTemplate` (общий пресет),
`Product.listPrice` в каталоге, схему `QuotationItem` (новые поля — 342), PDF/печать (345).

known_limitation: своя строка без каталога, описание позиции, скидка строки и «не входит
в стоимость» — TZ-SALES-342. Группы/разделы позиций и раскрытие состава изделия — отдельная
TZ после проб PO.

КРИТЕРИИ ПРИЁМКИ:
1. В студии видно все добавленные позиции; можно поменять кол-во и цену, удалить,
   дублировать и переставить строку — лист A4 меняется вслед.
2. Итог в панели совпадает с «Итого» на бланке.
3. F5 возвращает тот же состав и порядок.
4. Повторное «Добавить» того же изделия увеличивает количество.
5. Gates: `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`;
   `cd frontend && pnpm test -- proposal-create`; `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`;
   Prettier/ESLint/diff-check PASS; browser self-verify PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-340.done.md` + lock + checklist Executor report.
