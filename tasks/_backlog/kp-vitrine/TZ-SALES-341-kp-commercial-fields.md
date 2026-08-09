═══════════════════════════════════════════════════════════════
TZ-SALES-341: Create КП — коммерческие поля документа (номер, сроки, НДС, скидка, итог)
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
Аудит: docs/audits/2026-08-09-kp-builder-completeness-audit.md §2.1, §2.4

РОЛЬ АГЕНТА: fullstack
ЗАВИСИМОСТИ: 340 DONE (панель Состав + единый расчёт итога)
LAYER: 3
CONFLICT KEYS: backend/src/modules/quotation/quotation.schema.ts; backend/src/modules/quotation/quotation.service.ts; backend/src/modules/quotation/dto/create-quotation.dto.ts; backend/src/modules/quotation/dto/update-quotation.dto.ts; backend/src/modules/document-template/dto/build-document.dto.ts; backend/src/modules/document-template/document-template.service.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts; frontend/src/app/shared/services/pi-proposals.service.ts; docs/pages/proposals-create.page.md

Проверено: `quotation.schema.ts` уже имеет `number` (unique), `title`, `date`, `validUntil`,
`notes`, `discountType/discountPercent/discountAmount`, `total`; **нет** `vatPercent`,
`prepaymentPercent`, `productionDays`, `deliveryDays`. НДС сейчас живёт только в запросе
`dealTotals.vatPercent` (`build-document.dto.ts:59–64`) и теряется после F5.
Инспектор держит внутренние сигналы без `@Input` от родителя
(`proposal-create-inspector.component.ts:299–302`) — org/НДС не гидратируются при возврате.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Backend: доливка полей `Quotation`**
   - `vatPercent` (number, default 20, 0…100) · `prepaymentPercent` (0…100)
   - `productionDays` (int ≥ 0) · `deliveryDays` (int ≥ 0)
   - DTO create/update + валидация; `total` пересчитывается сервером из `items` с учётом
     `orgMarkupPercent` и скидки; НДС остаётся **включённым в цену** (канон 331).
   - `number` можно передать явно; при конфликте — 409 с RU-сообщением, автономер не ломать.

2. **Frontend: «Параметры» превращаются в секции** (канон аудита §3)
   - **Документ:** Номер · Название · Дата · Срок действия (дней → считает `validUntil`)
   - **Стороны:** Наша фирма · строка получателя (заполнит 343)
   - **Деньги:** Наценка % · Скидка (переключатель % / ₽ + значение) · НДС % ·
     «Сбросить наценку и скидку» · **Итого с НДС N%** крупной строкой (не «Оценка»)
   - **Сроки:** Предоплата % · Срок изготовления (дней) · Срок поставки (дней)
   - Номер и Название дублируются в верхней строке студии как inline-подписи документа.

3. **Гидратация инспектора**
   - Родитель передаёт начальные значения `@Input` (org, наценка, НДС, скидка, сроки);
     после F5 и после «Редактировать» из списка панель показывает сохранённые значения,
     а не дефолты.

4. **Сохранение и бланк**
   - Все поля идут в автосохранение `PATCH /quotations/:id`.
   - `build()` получает `dealTotals` = { vatPercent, discount, prepaymentPercent,
     productionDays, deliveryDays } — подвал печатает «Итого / в т.ч. НДС», а срок и
     предоплата доступны как значения для блоков бланка/условий (344).

5. Tests: BE — persist + пересчёт `total` со скидкой % и ₽; валидация границ.
   FE — F5 возвращает НДС/скидку/сроки; «Сбросить» обнуляет наценку и скидку.

ИЗМЕНЯТЬ: схему/DTO Quotation, инспектор, верхнюю строку студии, build payload.
НЕ ИЗМЕНЯТЬ: колонку «Скидка» на бланке (скидка — фоном, канон kp-table-config);
`Product`/каталог; шелл 317; версии/статус (347); PDF (345).

known_limitation: валюта — только ₽; «Тип документа» в студии остаётся выбором бланка,
отдельный селектор DocType — после проб PO.

КРИТЕРИИ ПРИЁМКИ:
1. Номер, название, дата и срок действия видны и правятся; после F5 сохраняются.
2. НДС переживает перезагрузку и совпадает с подвалом листа.
3. Скидка % и ₽ уменьшают «Итого» и в панели, и на бланке; «Сбросить» возвращает 0/0.
4. Предоплата и сроки сохраняются в КП и доступны бланку.
5. Gates: BE `pnpm exec tsc -p tsconfig.build.json --noEmit` + `pnpm test -- quotation`;
   FE `pnpm exec tsc -p tsconfig.app.json --noEmit` + `pnpm test -- proposal-create`;
   Prettier/ESLint/diff-check PASS; browser self-verify PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-341.done.md` + lock + checklist Executor report.
