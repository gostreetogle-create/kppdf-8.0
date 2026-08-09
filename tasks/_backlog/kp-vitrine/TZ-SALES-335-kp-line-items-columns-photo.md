═══════════════════════════════════════════════════════════════
TZ-SALES-335: Create КП — Кол-во/Цена/Сумма + фото на line-items
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
Аудит: docs/audits/2026-08-09-kp-usable-gap-map.md

РОЛЬ АГЕНТА: fullstack
ЗАВИСИМОСТИ: 332 DONE (table target); 325 bind
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts; frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts; backend/src/modules/document-template/document-template.service.ts; backend/src/modules/document-template/dto/build-document.dto.ts; backend/src/modules/table-template/table-template.service.ts; docs/pages/proposals-create.page.md

Проверено: previewLineValue мапит qty/price/sum/sku/name/index — **не** photo; table «003»/продукты часто без quantity key → на листе qty некуда писать; PO думает «кнопка Скрыта/Видна сломана».

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Долить коммерческие колонки на выбранную line-items table (экземпляр Create)**
   - Когда выбран tableTarget: если нет keys `quantity` (или alias) **или** `unitPrice`/`sum` — merge в `kpTableLayout` канон-колонки из KP preset (№?, productName если нет, quantity, unit, unitPrice, sum), **не** PATCH shared TableTemplate.
   - Кнопка в панели Таблица: «Добавить поля КП (кол-во/цена)» — явное действие + авто при первом add товара, если не хватает keys.
   - После merge — rebuild; на A4 появляются Кол-во / Цена / Сумма.

2. **Qty edit в Create**
   - В панели Товары или компактный список draftLines: изменить quantity → rebuild previewLines.
   - Не только «1» навсегда.

3. **Фото в колонке Рисунок**
   - Расширить previewLines: `photoUrl?: string` (list/thumb URL продукта при Add).
   - BE `previewLineValue`: keys `photo`, `image`, `рисунок`, `photoUrl` → `<img>` или URL в cell (table-template preview formatCell image/text).
   - Если колонки нет — не invent; только заполнять существующую.

4. Tests: merge adds quantity column to layout payload; photoUrl appears in td when column key рисунок.

НЕ: PATCH TableTemplate; print; Save schema (333); deploy.

known_limitation: красивый crop фото — later; достаточно thumb в ячейке.

AC:
1. На target-table после «Добавить поля КП» или auto-merge видны Кол-во и Сумма с цифрами из draft.
2. Меняешь qty → сумма на листе меняется.
3. Колонка Рисунок показывает thumb если есть у изделия.
4. Gates FE/BE зоны. Visual PO PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-335.done.md`.
