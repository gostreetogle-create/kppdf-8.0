═══════════════════════════════════════════════════════════════
TZ-SALES-344: Create КП — панель «Условия» (текст, заготовки, переменные)
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create ; /doc-constructor/texts
PAGE_DOCS: proposals-create.page.md ; texts.page.md
Аудит: docs/audits/2026-08-09-kp-builder-completeness-audit.md §2.5

РОЛЬ АГЕНТА: fullstack
ЗАВИСИМОСТИ: 341 DONE (сроки/предоплата как источники переменных)
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create-terms.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create-terms.component.spec.ts; backend/src/modules/quotation/quotation.schema.ts; backend/src/modules/quotation/dto/create-quotation.dto.ts; backend/src/modules/document-template/document-template.service.ts; backend/src/modules/document-template/dto/build-document.dto.ts; docs/pages/proposals-create.page.md

Проверено: условия сейчас можно написать только в конструкторе шаблона
(`TemplateBlock` type `text`), то есть один текст на все КП; в студии блока нет.
Библиотека текстов уже существует: `TextBlock` + категории (`docs/pages/texts.page.md`,
TZD-30 MCP-черновики). Токены полей есть у конструктора
(`data-field-picker-dialog.component.ts:423,462`), в студии не доступны.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Backend: условия принадлежат КП**
   - `Quotation.terms: { text: string; sortOrder: number }[]` (default пусто).
   - DTO create/update; при создании КП — подставить условия по умолчанию из выбранного
     шаблона/типа документа, если они там заданы (иначе пусто, без выдумок).

2. **Панель правого рейла «Условия»**
   - Список строк: перетаскивания не надо — `↑`/`↓`, «Удалить», «Добавить условие…».
   - Строка — многострочное поле (низкое, растёт по содержимому; канон «ёмкость поля»).
   - Кнопка «Взять из библиотеки» → пикер `TextBlock` по категориям (Add & continue:
     выбрал → добавилось → пикер остался открыт).
   - Подсказка доступных переменных списком, вставка кликом в позицию курсора:
     `{{client_name}}` · `{{kp_number}}` · `{{total_price}}` · `{{date}}` · `{{valid_until}}` ·
     `{{prepayment_percent}}` · `{{production_days}}` · `{{delivery_days}}`.

3. **Подстановка при рендере**
   - `build()` получает `terms` и печатает их в блок бланка с ролью «условия»
     (или под таблицей позиций, если такого блока нет).
   - Переменные раскрываются на сервере из данных КП/клиента/организации; неизвестный токен
     остаётся текстом как есть (не падать, не печатать `undefined`).

4. **Не плодить второй редактор текстов**
   - Правка формулировки «на будущее» — в Документы → Тексты; в студии правится только
     экземпляр условий этого КП.

5. Tests: BE — рендер подставляет номер/сумму/дату и не ломается на неизвестном токене;
   FE — добавление из библиотеки, порядок, persist после F5.

ИЗМЕНЯТЬ: `Quotation.terms`, build payload/рендер, новую панель, пикер текстов (переиспользовать).
НЕ ИЗМЕНЯТЬ: `TextBlock` схему, конструктор шаблонов, свободный текст «на лету» в палитре
(осознанный отказ PO, PO-DIARY §3), шелл 317.

known_limitation: форматирование внутри условия (жирный/списки) — later;
сейчас это простой текст с переносами.

КРИТЕРИИ ПРИЁМКИ:
1. В студии можно добавить, переставить и удалить строки условий; после F5 они на месте.
2. Условия видны на листе A4 и в PDF.
3. Заготовка из Документы → Тексты вставляется без ухода из студии.
4. `{{kp_number}}` и `{{total_price}}` печатаются реальными значениями.
5. Gates: BE tsc + `pnpm test -- document`; FE tsc + `pnpm test -- proposal-create`;
   Prettier/ESLint/diff-check PASS; browser self-verify PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-344.done.md` + lock + checklist Executor report.
