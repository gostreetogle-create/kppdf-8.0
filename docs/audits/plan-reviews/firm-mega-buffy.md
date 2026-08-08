# Мнение: Buffy (Codebuff / Claude)
Дата: 2026-08-08
Роль: peer-review плана firm_clients_sales_docs_mega

## Вердикт одной строкой
**Go с правками** — направление здравое, волны логичны, но три вещи обязательно исправить до lock: (а) обновить «дыру» supply — это не stub, а живой реестр TZ-SUPPLY-301; (б) разрешить конфликт индексов ИНН на Counterparty (global unique + compound org-scoped); (в) зафиксировать, что W1 «FullEditor» Org — это новый диалог по канону kind C, а не доработка текущего kind-B диалога.

От трёх других ревью (composer/sol/terra) это мнение отличается акцентом на индексы/DB-contract, org-scope coverage по endpoint-ам, и конкретный разбор FE payload «тонкой» формы.

## Что в плане верно (3–7 буллетов)

- **Org schema богаче FE в 3 раза.** `backend/src/modules/organization/organization.schema.ts` содержит bank (4 поля), ogrn, ogrnip, directorName, legalType, passport, photoIds, contactPersonId, registrationDate — итого ≈20 полей. FE `organization-form-dialog.component.ts` пакует в payload только `{name, inn, type, shortName?, kpp?, signerName?, signerPosition?}` — **7 полей** из 20. План прав: «FE форма тонкая».

- **Counterparty backend CRUD — полный, фронт — read-only.** `backend/src/modules/counterparty/counterparty.controller.ts`: GET / (list scoped), GET /:id, POST /, PATCH /:id, DELETE /:id + POST /quick. `frontend/.../counterparties.page.ts` — TableComponent с тремя колонками (name/shortName/inn), emptyMessage: «API готов — полный CRUD и объекты в ORDERS-303». Сервис `pi-counterparty.service.ts` имеет create/update/remove, но страница их не вызывает. План верен: «Нет полного CRUD на /counterparties» — точнее «нет FE CRUD-интерфейса на странице».

- **INN = checksum only, ноль внешних API.** Поиск `DaData|dadata|EGRUL|FNS` по репо — 0 matches. `@IsINN()` в `backend/src/common/validators/inn.validator.ts` — чистая математика (10/12 цифр, контрольная сумма). `generateQuickInnStub()` в `counterparty.service.ts` — timestamp-based 10-значный номер с валидной checksum. План точен.

- **KP→Order convert живой, но только из accepted.** `quotation.service.ts:529 convertToOrder()` — guard: `status !== 'accepted'` → 422. Strip коммерческих цен (скидки/прайс сделки), создаёт order + site, двусторонняя связь `convertedOrderId`. План верен.

- **D7 stub-КП от прямого заказа — дыра.** `order.schema.ts`: `quotationId?: Types.ObjectId` (optional). `order.service.ts:73` принимает quotationId из DTO, но **не создаёт обратное КП** при его отсутствии. Канон в `docs/audits/2026-08-08-sales-to-shop-flow-canon.md` D7: «авто stub-КП "создано от заказа"» — не реализован. План прав.

- **Supply — живой реестр, не stub.** `frontend/.../supply/supply.page.ts` — TZ-SUPPLY-301: фильтр по статусам (draft/confirmed/ordered/received), ручное создание, explode BOM из заказа, переход по workflow (подтвердить→заказано→получено), ссылки на заказ через routerLink. Это **продуктовый экран**, не NAV-stub. План ошибается в таблице «дыры» формулировкой «ready/supply UX».

- **Design — stub.** `frontend/.../design/design.page.ts` — PiGroupWorkspace с надписью «скоро» и текстом «Очередь доукомплектования… появится в следующих волнах». План верен: design queue — дыра.

## Что поправить в плане до lock (обязательно)

1. **Ошибка факта: supply — не дыра UX, а живой экран.** Таблица «есть vs дыра» в плане говорит «ready/supply UX» как дыру. Supply page — полноценный TZ-SUPPLY-301 с 4 статусами, explode BOM, фильтром и inline-действиями. Дыра — **auto-задачи снабжения из BOM** (SUPPLY-302), procure-confirm D18, связь supply с ready-флагами заказа. Исправить формулировку.

2. **Конфликт индексов ИНН на Counterparty.** `counterparty.schema.ts`: поле `inn` помечено `unique: true` (глобальный unique index MongoDB) **и одновременно** `CounterpartySchema.index({ organizationId: 1, inn: 1 }, { unique: true, sparse: true })` (compound sparse). Глобальный индекс делает невозможным одного контрагента в разных tenant-org. Перед W1/W2 принять решение: дропнуть глобальный unique → только compound sparse, либо отказаться от multi-org INN-изоляции. Без этого W2 lookup не сможет корректно искать/создавать CP в multi-org сценарии.

3. **Organization endpoints глобальны, не scoped.** `organization.controller.ts` — ни `@RequireOrgScope()`, ни фильтрация по `user.organizationId`. Любой аутентифицированный пользователь видит/меняет/удаляет все организации. Для multi-org сценария (вопрос 3 плана) это security gap. В W1 заложить org-scope на CRUD Organization, иначе W3 vault assets не имеют tenant-изоляции.

4. **Counterparty GET/:id, update, delete — без org-scope.** `counterparty.controller.ts` list (GET /) фильтрует через `user.organizationId` в сервисе, но GET/:id, PATCH/:id, DELETE/:id принимают id без проверки принадлежности к tenant. До W1 закрыть IDOR на единичных операциях.

5. **W1 «Org FullEditor» — специфицировать.** План говорит «kind C 1120». Текущая форма — `organization-form-dialog.component.ts`: kind-B диалог (lg width), 7 полей из 20. Новый FullEditor должен быть: 1120px, секции (Реквизиты / Банк / Подписант / Документы), все поля schema + photoIds для будущего W3. Без явной спецификации W1 сделает «добавим пару полей в текущий диалог» и W3 некуда будет пристыковать vault.

6. **«Реквизиты PDF одной кнопкой» (W4) — разбить.** В репо нет endpoint/страницы «реквизиты PDF». Есть document-template build (HTML) + registry bindings. W4 должен быть минимум двумя TZ: (a) requisites template/doc-type с org bindings → HTML, (b) PDF export. Не обещать «одну кнопку» без контракта шаблона и рендерера.

7. **Order не несёт organizationId.** `order.schema.ts`: поля `quotationId`, `counterpartyId`, `siteId` — но не `organizationId`. При multi-org документы не смогут определить «чьи реквизиты». В W1 заложить: либо FK на Order, либо implicit через quotation→organization (если КП есть) + default org для прямых заказов.

## Ответы на открытые вопросы плана (1–7)

1. **Провайдер ИНН.** DaData через backend proxy — единственный практичный путь. Ключ в env/secrets, rate-limit + circuit breaker, audit-лог без PII. Бесплатные гос API (ФНС/ЕГРЮЛ) — нестабильный SLA, нет официального open API для автоматического lookup. Без ключа DaData — W2 = park с явным UI-предупреждением «ИНН не проверен». **Нужен вердикт PO:** бюджет на ключ DaData (≈15 000 ₽/год для базового тарифа), иначе W2 не взлетит.

2. **Адреса в schema.** Не добавлять legal/actual в Org/CP как строковые поля. Вместо этого: (а) `Site.address` уже есть для объектов заказа; (б) адрес организации — structured объект в самом Org (index/city/street/building), если нужен для печатных реквизитов; (в) адрес CP — не копировать, использовать Site. Иначе получим 3 разных формата адреса в 3 сущностях. **Нужен вердикт PO:** какие адреса реально печатаются в договорах/КП — юрадрес организации или достаточно банка+ИНН?

3. **Одна Organization или много.** Код допускает N org: quotation family (D21 канона) использует разные бланки. Но UI/W1/W3 должен начинаться с UX «одна моя фирма» (default/current org), multi-org переключение — опциональная фича. Если PO подтвердит одно юрлицо на инстанс — упрощаем W3 (один vault на инстанс), глобальный доступ к Org допустим. **Нужен вердикт PO:** сколько реально юрлиц сейчас в одном деплое?

4. **Кто меняет печать.** Только `admin`; отдельная capability `manage_org_assets` на будущее (D15 канона). Audit: кто/когда загрузил/заменил/удалил. Manager — read-only использование в документах. Версионирование: старые документы ссылаются на snapshot печати на момент генерации, замена не меняет уже выпущенные PDF. **Нужен вердикт PO:** есть ли сценарий «главбух меняет печать» без админа?

5. **Фото клиентов сразу?** Нет. W1–W3 — только org vault (logo/seal/signature/background). CP photoIds есть в schema, но upload UI — successor после W3. Паспорт/сканы клиентов — отдельная compliance/security волна с политикой хранения персональных данных. **Нужен вердикт PO:** какой клиентский файл реально нужен в демо?

6. **Приоритет W5 vs W3.** W5 (residual gaps: D7 stub-КП, design queue, KP vitrina polish) критичнее для ежедневной работы менеджера, чем печать на КП. Но supply и line-ready/material-gate уже живые — не переделывать. Рекомендация: **W5a (D7 + design queue) параллельно W3** с разными CONFLICT KEYS; vitrina КП — последней в W5. **Нужен вердикт PO:** что стыднее показать инвестору — заказ без обратного КП или КП без печати?

7. **ИНН в quick-create заказа.** Да, в W2: поле ИНН опциональное, кнопка «Заполнить по ИНН» → lookup → preview + HITL confirm → create/reuse CP. До W2 — оставить stub ИНН, но с badge «временный» и ссылкой на карточку CP для ручного уточнения. Нельзя молча заменять stub на lookup без ведома менеджера. **Нужен вердикт PO:** допустим ли заказ вообще без ИНН клиента (физлицо/срочный)?

## Порядок волн W0–W6

**Согласен с базовой структурой**, с уточнениями по W5 (уже реализованное вынести) и W1 (добавить org-scope + index contract):

| Волна | План | Рекомендация | Обоснование |
|-------|------|-------------|-------------|
| **W0** | TZD-30 | Без изменений; не смешивать | Уже идёт, отдельный claim |
| **W1** | Party UX | **Добавить**: org-scope на Org CRUD + Counterparty get/update/delete; INN index contract; FullEditor = kind C 1120px по канону `docs/pages/ui-dialog-canon.md` | Без scope multi-org и vault невозможны |
| **W2** | INN | OK после PO budget/key; backend proxy + cache + circuit breaker; `innVerificationStatus` поле в CP | Без ключа = park, не притворяться |
| **W3** | Org vault | OK; typed assets (logo/seal/signature/background) с owner/audit; НЕ общий photoIds[] | До W3 нужен asset contract |
| **W4** | Print/PDF | Разбить: (a) requisites template + org bindings → (b) PDF export; переиспользовать builder/upload | Не «одна кнопка» |
| **W5** | Sales gaps | **Исправить**: supply/line-ready/material-gate уже живые, убрать из W5. Оставить: D7 stub-КП, design queue, KP vitrina polish, module-ready D8, partial shipment UI | Не дублировать готовое |
| **W6** | Desktop MCP | OK last, поверх стабильных Web API | Не второй vault, не обходить ACL |

**Предложение по параллелизму:** W5a (D7 + design queue) можно стартовать после W1 (не зависит от vault/INN), если CONFLICT KEYS не пересекаются с W3/W4.

## Риски и Ban

- **Не обещать** «ИИ собрал юридически верное КП» — ban плана корректен, audit org-assets-vs-ai-text подтверждает.
- **INN stub ≠ настоящий ИНН.** Quick-create генерирует формально валидный номер из timestamp — нельзя молча апгрейдить его до реального. Нужно `innVerificationStatus` (unknown/verified/manual) и миграция существующих stub.
- **Индексы Counterparty.inn** — два противоречащих unique индекса сломают multi-org при первом же дубликате ИНН в разных tenant. Исправить до W1.
- **Security: unscoped get/update/delete** на Org и Counterparty — IDOR risk. Закрыть в W1 до FullEditor/vault.
- **Деньги на API:** DaData — operational cost (≈15k₽/год); ключ в env, не в FE; бюджет до старта W2.
- **Vault не равен photoIds[]:** печать/подпись — чувствительные assets с audit trail, version/snapshot и ACL. Не хранить как общий Photo без owner/role.
- **Не тащить** в W1–W4: Гант drag, полный SHIPPING, бухгалтерию, «AI собрал готовое КП на холсте» — ban плана корректен.
- **Не переписывать supply/line-ready:** W5 должна аудировать реальные gaps, а не заново реализовывать TZ-SUPPLY-301.

## DoD «можно нарезать TZ»

1. PO ответил на вопросы 1–7 (хотя бы default/park) — зафиксировано в lock-блоке плана.
2. Таблица «есть vs дыра» обновлена: supply вынесен из дыр (это живой TZ-SUPPLY-301), W5 уточнён до residual gaps (D7 stub-КП, design queue, vitrina, module-ready, partial shipment).
3. Принят DB contract: (а) Counterparty.inn — только compound sparse unique, глобальный unique дропнут; (б) Organization endpoints — scoped; (в) Counterparty get/update/delete — scoped; (г) Order.organizationId — решение (FK или implicit).
4. Выбран INN-провайдер **или** явный park W2 с `innVerificationStatus` и UI-предупреждением на stub.
5. Для W3/W4 зафиксирован asset contract: typed roles (logo/seal/signature/background), owner/ACL, MIME/size, audit, snapshot для выпущенных документов.

КОНЕЦ.
