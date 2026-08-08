# Мнение: Opus 5 (Cursor, independent reviewer)
Дата: 2026-08-08
Роль: peer-review плана firm_clients_sales_docs_mega

## Вердикт одной строкой

**Go с правками** — карта тем и порядок волн правильные, но **W1 нельзя нарезать в текущей формулировке** («формы + CRUD UI»): под party-слоем три подтверждённых дефекта (tenant-stamp, IDOR, soft-delete = no-op) и глобальный `unique` на `inn`, который сломает W2 и мульти-org; их надо закрыть отдельной короткой волной **до** любого нового UI.

## Что в плане верно

- **Org schema богаче формы.** `backend/src/modules/organization/organization.schema.ts:18-80` — inn/kpp/ogrn, банк (31-41), signer (44-48), `photoIds` (79-80). `CreateOrganizationDto` (dto/create-organization.dto.ts:21-123) отдаёт всё **кроме `photoIds`**; FE `frontend/src/app/pages/organizations/organization-form-dialog.component.ts:178-190` рендерит 7 полей (name/shortName/inn/kpp/type/signerName/signerPosition). «Форма тонкая, `photoIds` не в DTO/UI» — **верно**.
- **Ноль INN-интеграций.** `backend/src/common/validators/inn.validator.ts` — только контрольная сумма ФНС (10/12 знаков). В `backend/src` нет `@nestjs/axios`/`HttpModule`/`HttpService` вообще, нет DaData/ЕГРЮЛ/api-fns. `findByInn` (counterparty.service.ts:109) — локальный `findOne`. **Верно.**
- **Stub ИНН на quick-create.** `counterparty.service.ts:12-19` `generateQuickInnStub()` (валидная контрольная сумма от `Date.now()`), 37-52 — CP создаётся с generated inn; FE `order-form-dialog.component.ts:442-446,591-596` не отправляет ИНН вовсе. **Верно.**
- **Bindings текстовые, image-binding нет.** `backend/src/modules/registry/registry.service.ts:34-37` — `type: 'text'|'number'|'currency'|'date'|'bool'`; 63-81 — 17 текстовых полей org, **без logo/seal/photoIds**. `template-block.schema.ts:29` `DataBindingFormat = 'text'|'date'|'currency'|'number'`; image-блок рендерится из `settings.imageUrl` ручного upload (`document-template.service.ts:936-944`), не из сущности. **Верно.**
- **КП→Заказ живой, D7 — дыра.** `quotation.service.ts:529-574` `convertToOrder`: только из `accepted`, strip commerce, ставит `quotationId` + `convertedOrderId`. `order.service.ts:60-92` — `quotationId` опционален и **обратное stub-КП не создаётся**. **Верно** (TZ-ORDERS-301 в `tasks/_archive/2026-08/`).
- **CP: backend CRUD есть, UI — только список.** `counterparty.controller.ts:26-76` — list/get/quick/create/patch/delete; `frontend/src/app/pages/counterparties/counterparties.page.ts:17-20,70-74` — read-only таблица на 3 колонки, `pi-counterparty.service.ts` create/update/remove **не подключены ни к одной странице**. **Верно.**

## Что поправить в плане до lock (обязательно)

1. **W0 закрыт, а не «в полёте» — фактическая ошибка.** TZD-30 уже DONE: `tasks/_archive/2026-08/TZD-30.done.md` (STATUS: DONE) + `.mimocode/locks/TZD-30-mcp-text-block-drafts.lock`. Строки плана «Параллель сейчас: агент TZD-30 идёт отдельно», «W0 … уже идёт» и ban «не смешивать с текущим TZD-30 claim» — устарели. **Реальная параллель сейчас другая:** untracked WIP `desktop/mcp-runtime/**` (backend.ts, http-server.ts, inbox-tools.ts, read-tools.ts, write-tools.ts, config.ts) — это **второй MCP runtime рядом с `desktop/mcp/**`**. Именно он конфликтует с W6, и в плане про него ничего нет. До lock: (а) переписать блок параллели, (б) решить, `desktop/mcp` или `desktop/mcp-runtime` — SoT для W6, иначе W6 будет писать инструменты в мёртвую ветку.

2. **`Counterparty.inn` — глобальный `unique`, это hard-blocker W2 и вопроса 3.** `counterparty.schema.ts:20-21` `@Prop({ required: true, unique: true, index: true })` **и** 96 `index({ organizationId: 1, inn: 1 }, { unique: true, sparse: true })` — два противоречащих контракта. Следствия, которые план обещает и не сможет выполнить: (а) два наших юрлица не могут иметь одного и того же реального заказчика; (б) при реальном lookup любой повторный ИНН → `E11000` вместо «нашёлся, переиспользуем»; (в) `required: true` не даёт вообще создать CP без ИНН — отсюда и родился stub. **W2 обязана начинаться с миграции индекса** (drop единичного unique на живой Mongo + дедуп существующих) — это отдельный TZ с бэкапом, а не «прикрутить провайдера».

3. **Tenant-дыры в party-слое: W1 их растиражирует.** `quickCreateParty` (counterparty.service.ts:46-52) **не ставит `organizationId`**, а `findAll` (69-75) показывает документы с `organizationId: {$exists: false}` **всем** организациям → каждый быстрый клиент менеджера становится общим. Хуже: `organizationId` — клиентское поле DTO (`create-counterparty.dto.ts:62`), сервер его не проштамповывает из JWT, `update` = `Object.assign(doc, dto)` (113-117) → CP можно **перенести в чужой tenant** запросом. И `findById`/`update`/`remove` вообще без org-фильтра → IDOR: manager орг. A правит/удаляет CP орг. B по id. План в графе «Counterparty · Есть» пишет «schema + quick-create» — надо переписать на «есть, но небезопасно»; иначе W1 «полный CRUD UI» просто откроет эти дыры пользователям.

4. **Soft-delete у Counterparty/Organization почти наверняка no-op.** `counterparty.service.ts:119-124` и `organization.service.ts:54-59` делают `updateOne($set: { deletedAt })`, но **`deletedAt` не объявлен** ни в `counterparty.schema.ts`, ни в `organization.schema.ts`. Проект про это уже знает: `setting.schema.ts:23-32` и `feature-flag.schema.ts:27-37` объявляют `deletedAt` именно «чтобы не спотыкаться о strict-mode», а `catalog-314.archive.spec.ts:32-37` проверяет `Schema.path('deletedAt')).toBeDefined()`. Mongoose 8 (`backend/package.json:41`) при `strict: true` **вырезает** неизвестные пути из update → DELETE вернёт 204, строка останется. Тот же паттерн у `order.service.ts:322`, `quotation.service.ts:579`, `contract.service.ts:162`, `cost-calculation.service.ts:258` — там `deletedAt` тоже не в схеме. Стоимость проверки — тест на 5 строк; стоимость пропуска — PO жмёт «Удалить» на показе, ничего не происходит. **Внести в план как дефект, а не как «later».**

5. **«Одна Organization или много» (вопрос 3) сформулирован не про то.** В коде `Organization` — не «наша фирма», а общий реестр юрлиц: нет флага `isOurCompany`, нет singleton/`current`, `GET /organizations` (controller.ts:25-41) отдаёт всё без tenant-скоупа (сам Organization не имеет `organizationId`), а «наша компания» существует лишь как slug роли `our-company` в `org-roles.seed.ts:9`. При этом `BuildDocumentDto` требует `organizationId` явным параметром. Практический вопрос для PO не «сколько юрлиц», а **«как система узнаёт, чьи реквизиты и печать ставить в документ»** — без ответа W4 не нарезается.

6. **«Реквизиты PDF одной кнопкой» (C/W4) — опасное обещание.** Отдельного endpoint/страницы нет; путь один — document-template build через registry-поля. А для «печати на бланке» нужен **новый тип binding**, то есть правка shared-контракта: `FieldDescriptor.type` (registry.service.ts:34-37), `DataBindingFormat` (template-block.schema.ts:29), рендер (document-template.service.ts:936-944) плюс `registry.e2e-spec.ts`, который сегодня проверяет допустимое множество типов. Это 2–3 TZ с contract-change, не «кнопка».

7. **Адреса (вопрос 2) — уже есть, но не там, где нужно.** Адрес живёт в `Site` (`site.schema.ts:19`, `address` required), quick-create создаёт CP+Site (counterparty.service.ts:53-57). Значит **на Counterparty юр. адрес добавлять не надо** — будет дубль. Но **у Organization** его нет вовсе, а без юр. адреса «Реквизиты PDF» — неполные реквизиты, то есть ровно тот стыд, ради которого делается W3/W4. Вопрос надо расщепить: Org — да, CP — нет.

8. **Формулировки дыр в W5 размыты и занижают/завышают готовность.** `supply.page.ts:37` — живой реестр (TZ-SUPPLY-301 DONE) + API `supply-task.controller.ts:26-96` с confirm/ordered/received; дыра — авто-задачи из BOM и жёсткий gate, не «страницы нет». Наоборот: `design.page.ts:6-28` и `shipping.page.ts:6-28` — **stub'ы** (при живом backend `/shipments`), ready есть только на линии заказа (`order.schema.ts:35-43`), на модуле (D8) — нет, Гант считает оценку из каталога и `readyForWork` не читает. W5 должна перечислять D7/D8/D18/D19 + design queue пунктами, иначе исполнитель напишет «витрину КП» вместо канона.

## Ответы на открытые вопросы плана (1–7)

1. **Провайдер ИНН.** Рекомендация: **DaData (или аналог с платным ключом), только backend-proxy**, ключ в env, кэш ответов в нашей БД, rate-limit, HITL-подтверждение человеком. Бесплатные/гос API — ToS и SLA-риск, на них нельзя ставить ежедневный сценарий менеджера. Но: **пока нет ответа по ключу/бюджету — W2 паркуется**, а не подменяется checksum'ом «под видом lookup». Первым шагом W2 всё равно идёт миграция индекса (см. п.2) — она полезна и без провайдера. **Нужен вердикт PO: платим или паркуем.**
2. **Адреса в schema.** `legalAddress` (+ опционально `actualAddress`) — **да, на Organization**, в W3, потому что без них реквизиты неполные. На **Counterparty — нет**: адрес объекта уже `Site`. Юр. адрес клиента добавлять только когда провайдер ИНН реально его отдаёт (W2+). **Нужен вердикт PO** только по формулировке для договоров.
3. **Одна Organization или много.** Рекомендация: **одна «наша фирма» на инстанс** — явный `isOurCompany`/settings-указатель + `GET /organizations/current`, и документы по умолчанию берут её (мульти-юрлицо — только если PO реально ведёт два ООО в одной базе). Заодно это снимает вопрос «чью печать ставить». **Нужен вердикт PO: одно юрлицо или два+.**
4. **Кто меняет печать.** **Только `admin`**, с audit-записью кто/когда заменил, валидацией MIME/размера (как у background шаблона) и без публичного URL без авторизации. Менеджер — только использует в документе. Вердикт PO нужен только если печать реально меняет не он.
5. **Клиентские фото.** **Не сейчас.** `photoIds` в `counterparty.schema.ts:74-75` есть, но UI-долг и так большой; паспорт/сканы — это ещё и хранение персональных данных. Сначала vault нашей фирмы (W3), фото клиентов — successor после W4. Вердикт PO не обязателен, дефолт «нет».
6. **W5 vs W3.** Рекомендация: **сначала короткая волна гигиены (п.2–4), потом W3+W4, потом W5** — с одним изъятием: **D7 (stub-КП от прямого заказа) вытащить вперёд**, это ~30 строк в `order.service.create` и целостность отчётности, глупо держать его в хвосте длинной волны. Логика: W3+W4 — 3–4 тонких TZ и закрывают именно то, что видно коллегам в PDF; W5 — длинная волна на несколько дней, её нельзя ставить перед показом. **Нужен вердикт PO: что ближайший показ — документы или цех.**
7. **ИНН на quick-create заказа.** **Да, в W2, но не «вместо»:** поле ИНН опциональное → lookup → prefill → человек подтверждает → создать **или переиспользовать** найденного CP. До W2 stub оставить, но пометить в UI («ИНН временный — уточните в карточке») и уметь отфильтровать stub'ы списком, иначе к моменту W2 в базе будет мусор без признака. Переиспользование по ИНН обязано быть **org-scoped** — сейчас `findByInn` глобальный (counterparty.service.ts:109-111), то есть prefill покажет чужого клиента.

## Порядок волн W0–W6

Согласен по составу, предлагаю **вставить W0.5 и разрешить два параллельных ручья**.

| Волна | Что | Изменение против плана | Зависимости |
|-------|-----|------------------------|-------------|
| ~~W0~~ | TZD-30 тексты MCP | **Убрать: уже DONE** (archive + lock) | — |
| **W0.5 Party hygiene** (новая) | tenant-stamp + org-scope на CP (create/quick/findById/update/remove), `deletedAt` в Org+CP схемы (+ проверить order/quotation/contract), drop глобального unique `inn` + миграция/дедуп | **Новая, обязательна до W1** | нет |
| **W1 Party UX** | Org FullEditor (kind C 1120, **новый** по канону диалогов) = schema; CP FullEditor + list CRUD на уже существующий `pi-counterparty.service` | Формулировку «FullEditor» пометить как целевую, не «доработать» | W0.5 |
| **W2 INN** | Провайдер lookup → prefill create/edit CP (+опц. Org), HITL, org-scoped reuse | Индексная миграция ушла в W0.5; сама волна = park без ключа PO | W0.5, W1 |
| **W3 Org vault + legalAddress** | typed assets logo/seal/signature/background, dropzone, ACL admin, `legalAddress` | Добавить legalAddress сюда | W1 |
| **W4 Print** | contract-change: image-binding в registry/DataBinding/render + e2e; «реквизиты» как отдельный тип документа | Явно как contract-change, не «кнопка» | W3 |
| **W5 Sales north gaps** | **D7 первым** (или в W0.5), затем D8 ready на модуле, D18 procure confirm, D19 material gate, design queue, витрина КП последней | D7 вперёд; убрать «supply с нуля» | канон sales-to-shop |
| **W6 Desktop** | MCP: org/CP propose + photo upload, INN-assist | **Сначала решить `desktop/mcp` vs `desktop/mcp-runtime`** | W2–W4 + приземление untracked WIP |

Параллель безопасна: **W0.5→W1→W3→W4** (party/vault/doc) и **D7+W5** (sales/shop) не пересекаются по conflict keys, кроме `order.service.ts` — его отдать одному ручью.

## Риски и Ban

- **Ban на обещания:** «ИИ собрал юридически верное КП»; «реквизиты одной кнопкой» (нужен contract-change); «ИНН подтягивается» до ответа PO по ключу и бюджету; «удаление клиента работает» до фикса `deletedAt`.
- **Security / multi-org** (главный риск этого плана): без W0.5 каждый новый экран усиливает утечку — org-less quick-create виден всем, `organizationId` приходит от клиента (mass-assignment), `findById/update/remove` без скоупа (IDOR). Отдельно: `Organization` не имеет tenant-поля вовсе, `GET /organizations` отдаёт всех.
- **Деньги на API:** DaData — операционный расход на каждый lookup; нужен feature-flag off по умолчанию, кэш в БД и лимит, иначе счёт растёт от опечаток менеджера. Ключ — только в backend env, никогда во FE.
- **Данные:** stub-ИНН без признака = будущая ручная дедупликация; drop глобального unique-индекса на живой базе = отдельный TZ с бэкапом и планом отката.
- **Загрузка печати/лого:** MIME/размер, RBAC admin, не публичный путь без авторизации; сегодня фото лежат на диске (`./uploads`) и раздаются статикой (`main.ts:103-105`) — печать так раздавать нельзя.
- **Процессный:** untracked `desktop/mcp-runtime/**` не приземлён в `main` — ровно тот антипаттерн из PO-DIARY («shared UI только локально»); W6 нельзя нарезать поверх незакоммиченного WIP.

## DoD «можно нарезать TZ»

1. PO ответил (или явно припарковал) вопросы **1, 3, 6** — от них зависит состав волн; 2/4/5/7 можно взять по дефолтам из этого файла.
2. Куратор переписал в плане блок параллели: **TZD-30 = DONE**, реальная параллель — `desktop/mcp-runtime` WIP; выбран SoT для W6.
3. В плане появилась волна **W0.5 (party hygiene)** с четырьмя пунктами: tenant-stamp/org-scope, `deletedAt` в схемы, миграция unique `inn`, признак stub-ИНН. Без неё W1 не нарезается.
4. Таблица «есть vs дыра» приведена к коду: supply — живой, design/shipping — stub, ready только на линии заказа, `Organization` без tenant-поля и без «наша фирма».
5. Для каждой волны — 2–5 тонких TZ с CONFLICT KEYS; `order.service.ts` закреплён за одним ручьём; ни один key не пересекается с `desktop/mcp-runtime/**` и `materials/**`.

КОНЕЦ.
