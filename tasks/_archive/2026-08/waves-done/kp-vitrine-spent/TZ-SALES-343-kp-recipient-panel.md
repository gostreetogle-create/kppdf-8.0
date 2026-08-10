═══════════════════════════════════════════════════════════════
TZ-SALES-343: Create КП — панель «Получатель» и реквизиты клиента на бланке
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
Аудит: docs/audits/2026-08-09-kp-builder-completeness-audit.md §2.2

РОЛЬ АГЕНТА: fullstack
ЗАВИСИМОСТИ: 334 DONE (клиент = все контрагенты + поиск)
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create-recipient.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create-recipient.component.spec.ts; frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts; backend/src/modules/quotation/quotation.schema.ts; backend/src/modules/quotation/dto/create-quotation.dto.ts; backend/src/modules/document-template/document-template.service.ts; backend/src/modules/registry/registry.service.ts; docs/pages/proposals-create.page.md

Проверено: `BuildDocumentRequest` поддерживает `counterpartyId`
(`pi-document-templates.service.ts:100`), но студия его **не отправляет**
(`proposal-create.page.ts:458–464`), и автосохранение его не пишет (`605–626`) —
поэтому реквизиты клиента на бланке пустые. Канон имён: покупатель = **`Counterparty`**,
не `Organization` (`docs/TZ-AUTHORING.md` §1.1). Адрес живёт на **`Site`**
(`site.schema.ts:18–19`), контактное лицо — `Counterparty.contactPersonId` → `Person`.
`registry.service.ts:187–207` отдаёт контрагента без адреса.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Новая панель левого рейла «Получатель»**
   - Иконка после «Товары», overlay как остальные (взаимоисключающая, лист не сжимается).
   - Поиск по всем контрагентам (переиспользовать пикер из 334, не второй write-path).
   - Показ карточки выбранного: название, ИНН/КПП, банк, директор — read-only, с кнопкой
     «Открыть карточку клиента».
   - Контактное лицо: выбор из `Person` этого контрагента (строка «Кому: Иванову И. И.»).
   - Объект/адрес поставки: выбор `Site` контрагента.
   - «Создать клиента» — существующий quick-create, без ухода из студии; после создания
     клиент сразу подставлен.

2. **Backend: связи на КП**
   - `Quotation.contactPersonId?` (ref Person) и `Quotation.siteId?` (ref Site); индексы не
     уникальные (1 клиент → N КП).
   - DTO create/update + populate в `GET /quotations/:id`.

3. **Бланк получает реквизиты**
   - Студия передаёт `counterpartyId` (и id контакта/объекта) в `build()`; автосохранение
     пишет `counterpartyId` в КП.
   - `registry` + рендер: добавить адрес объекта и ФИО/должность контактного лица к
     доступным полям клиента — существующие биндинги шаблона не ломать.

4. **Короткая строка в «Параметры → Стороны»**
   - Кто получатель + «Изменить», открывающее ту же панель (одно место правки, не второй UI).

5. Tests: выбор клиента уходит в `build` и в PATCH; после F5 получатель на месте;
   рендер подставляет ИНН клиента в блок с биндингом контрагента.

ИЗМЕНЯТЬ: новую панель, build payload, автосохранение, `Quotation` (2 ссылки), registry-поля.
НЕ ИЗМЕНЯТЬ: `Counterparty` схему (адрес остаётся на `Site`), пикер клиентов из 334
(переиспользовать), шелл 317, версии/статусы.

known_limitation: несколько контактных лиц/адресов в одном КП — не делаем;
семейные КП на несколько наших фирм остаются как есть (313).

КРИТЕРИИ ПРИЁМКИ:
1. В студии выбирается клиент, контактное лицо и объект; после F5 всё на месте.
2. На бланке печатаются реквизиты выбранного клиента (ИНН/КПП/банк) и «Кому».
3. «Создать клиента» не выкидывает из студии и сразу подставляет нового контрагента.
4. Gates: BE tsc + `pnpm test -- quotation`; FE tsc + `pnpm test -- proposal-create`;
   Prettier/ESLint/diff-check PASS; browser self-verify PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-343.done.md` + lock + checklist Executor report.
