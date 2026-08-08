# Мнение: GPT-5.6 Sol
Дата: 2026-08-08
Роль: peer-review плана firm_clients_sales_docs_mega

## Вердикт одной строкой
**Go с правками** — направление верное, но до lock надо обновить фактическую базу W5, определить tenant/ACL-контракт и перестать выдавать checksum-stub за реальный ИНН.

## Что в плане верно (3–7 буллетов)
- `Organization` — сторона нашей фирмы/бланка, а `Counterparty` — клиент: это закреплено в `docs/TZ-AUTHORING.md` и FK `organizationId`/`counterpartyId` в `backend/src/modules/quotation/quotation.schema.ts`.
- У `Organization` действительно уже есть ИНН, банк, подписант и `photoIds`, но `photoIds` отсутствует в create/update DTO: `backend/src/modules/organization/organization.schema.ts`, `backend/src/modules/organization/dto/create-organization.dto.ts`.
- У `Counterparty` есть полный backend CRUD и богатая schema, а `/counterparties` во frontend пока только read-only список: `backend/src/modules/counterparty/counterparty.controller.ts`, `frontend/src/app/pages/counterparties/counterparties.page.ts`.
- Внешнего INN lookup в product code нет: используется только `@IsINN`; quick-create генерирует формально валидный checksum-stub в `backend/src/modules/counterparty/counterparty.service.ts`.
- КП→Заказ реализован: конвертируется только `accepted` КП, переносит FK/snapshot без коммерческих цен и фиксирует двустороннюю связь — `backend/src/modules/quotation/quotation.service.ts`.
- Текстовые bindings Organization/Counterparty уже есть; image block и upload тоже есть, но нет typed binding «роль asset фирмы → картинка»: `backend/src/modules/registry/registry.service.ts`, `backend/src/modules/template-block/template-block.schema.ts`, `backend/src/modules/document-template/document-template.service.ts`.
- Фото-инфраструктура существует (`POST /photos/upload`, image upload в template block), но `Photo` не знает владельца/организацию/роль; поэтому это ещё не безопасный org vault: `backend/src/modules/photos/*`, `frontend/src/app/pages/doc-constructor/builder/*`.

## Что поправить в плане до lock (обязательно)
1. **Ошибка факта в W5.** Line-ready уже есть в BE+UI, `materialsSource` уже есть, снабжение уже умеет explode BOM и статусы draft→confirmed→ordered→received. См. `backend/src/modules/order/*`, `frontend/src/app/pages/orders/order-detail.page.ts`, `backend/src/modules/supply/*`, `frontend/src/app/pages/supply/supply.page.ts`. W5 надо переименовать в residual gap audit. Доказанные остатки: auto stub-КП для прямого заказа, module-ready, связь ready→Гант, очередь проектировщика и shipping/частичная отгрузка.
2. **Опасный INN-stub не описан как миграционная проблема.** Сейчас quick-create создаёт похожий на настоящий 10-значный ИНН из timestamp. Нельзя затем молча «заменить stub lookup-ом»: нужны nullable/unknown ИНН, `innVerificationStatus` (unknown/verified) и миграция существующих stub-записей.
3. **Multi-org/tenant-контракт не закрыт.** Код поддерживает N `Organization` и family КП по разным бланкам, но Organization API глобальный, а Counterparty scoping неполный. До UI-волн решить: current/default org, видимость, уникальность и право переключения.
4. **Security gap до W1/W3.** `Counterparty` list частично scoped, но get/update/delete — без org scope; create DTO принимает от клиента `organizationId` и `isSystem`. Organization и Photos CRUD также глобальны, manager может менять/удалять. Сначала ownership/authorization, потом FullEditor/vault.
5. **Уникальность ИНН противоречива для multi-org.** У `Counterparty.inn` стоит global `unique: true` и одновременно compound unique `{ organizationId, inn }`; глобальный индекс обнуляет смысл tenant-индекса. Контракт и миграция индексов должны войти в lock.
6. **Vault обещан слишком широко.** Нужны typed asset entity (`logo|seal|signature|background`), org ownership, MIME/size, active version, audit и safe replace/delete. Один `photoIds[]` и общий `/photos` этого не дают.
7. **«Реквизиты PDF одной кнопкой» не имеет контракта.** До обещания определить: какой шаблон/renderer используется, какие обязательные поля, как выбирается Organization, где хранится generated document и как проверяется кириллица/печать.
8. **Смешаны два вида image flow.** Уже есть template-local image/background upload; W3/W4 должны переиспользовать storage/rendering, но добавить entity-backed typed source, а не строить второй загрузчик и не хранить голые URL как бизнес-связь.
9. **Нет provider failure contract.** W2 обязан предусмотреть timeout/rate limit/cache, ручной ввод, подтверждение человеком, provenance и поведение без ключа; иначе форма клиента зависит от внешнего API.
10. **Order без цен соблюдается не на всех путях.** КП→Заказ strip-commerce работает, но прямой order form всё ещё передаёт `unitPrice`, а schema хранит цену/total. До lock решить единый канон и убрать асимметрию write-path, иначе «Заказ без цен сделки» — неверное обещание.
11. **В bindings есть скрытый tech-debt.** Registry публикует source `work-type`, а build bag использует `workType`; такой field binding не резолвится. W4 должен начинаться с contract test всех источников, а не только добавления картинок.

## Ответы на открытые вопросы плана (1–7)
1. **Провайдер ИНН:** для первого рабочего lookup рекомендую DaData через backend proxy, с ключом только в env, cache/rate limit и ручным fallback. Не обещать бесплатный гос-API без подтверждённых SLA/ToS. Нужен вердикт PO по бюджету и ключу; без него W2 park, checksum остаётся только валидатором, не lookup.
2. **Адреса в schema:** добавить в Org и CP как минимум `legalAddress` и `postalAddress` (на старых данных optional); `Site.address` оставить адресом объекта заказа, не подменять им юрадрес. Структурировать КЛАДР/FIAS только если это реально даёт выбранный provider. Нужен вердикт PO по печатным реквизитам.
3. **Одна Organization или много:** сохранять N организаций: quotation family уже использует Organization как разные бланки. Для UX нужен `default/current organization`; если в проде сейчас одно юрлицо, второе не показывать как сложный switch. Нужен вердикт PO, есть ли несколько реальных юрлиц сейчас.
4. **Кто меняет печать:** только `admin` либо отдельная capability `manage_org_assets`; manager — использовать в документах, но не заменять. Upload/replace/delete обязательно в audit trail. Нужен вердикт PO, нужна ли делегация конкретному сотруднику.
5. **Фото клиентов сразу?:** нет. Сначала org logo/seal/signature. Паспорт/сканы клиентов — отдельная security/retention волна; обычные вложения клиента — successor после подтверждённого сценария. Нужен вердикт PO, какой конкретно клиентский файл нужен в работе.
6. **Приоритет W5 vs W3:** residual W5 выше W3, потому что целостность прямой Заказ↔КП и рабочий поток важнее печати на показе. Но из W5 удалить уже сделанные ready/supply пункты. Нужен вердикт PO только по витрине КП: она может остаться позже.
7. **INN в quick-create заказа:** да, как optional поле с кнопкой lookup/confirm в W2; неизвестный ИНН не должен блокировать быстрый заказ. Нельзя генерировать fake-valid ИНН: хранить unknown/null и дозаполнять позже. Нужен вердикт PO, допустим ли клиент без ИНН до уточнения.

## Порядок волн W0–W6
Не согласен с текущей нумерацией как с последовательностью: W5 содержит уже реализованные пункты. Предлагаю порядок `W0 → W1 → W2 → W5R → W3 → W4 → W6`.

| Волна | Решение | Условие/поправка |
|---|---|---|
| W0 | оставить параллельно | TZD-30 не смешивать по conflict keys |
| W1 | первая после lock | Party domain + FullEditor, но вместе с tenant ownership/ACL и INN nullability/index contract |
| W2 | затем | provider spike/contract → lookup CP/Org → optional lookup в order quick-create |
| W5R | поднять перед vault | residual gaps: direct Order→stub-КП, единый no-commerce write-path, module-ready/design/Gantt/shipping; line-ready и supply не переизобретать |
| W3 | после security contract | typed org assets, owner scope, admin/capability, audit/versioning |
| W4 | после W3 | requisites PDF + typed image bindings, используя существующий builder/upload |
| W6 | последней | MCP propose/HITL поверх стабилизированных web API; не прямые записи и не второй vault |

## Риски и Ban
- Нельзя обещать «ИНН подтянется бесплатно и всегда»: внешний API имеет ключ, лимиты, стоимость, SLA и лицензионные условия.
- Нельзя посылать provider-ключ из browser и нельзя писать полный provider payload/персональные данные в обычные логи.
- Нельзя считать checksum доказательством существования юрлица и нельзя маскировать unknown ИНН под настоящий номер.
- Нельзя выпускать multi-org UI поверх текущих unscoped get/update/delete и global photo list/delete.
- Нельзя хранить печать/подпись как общий `Photo` без owner/role/audit; удаление active asset должно быть защищено.
- Нельзя обещать юридическую корректность PDF/КП от ИИ или provider lookup; человек подтверждает реквизиты.
- Нельзя повторно делать line-ready/supply «по плану» без code preflight; это создаст второй write-path.
- Деньги на API и storage/backup/retention должны иметь явного владельца и лимит до W2/W3.

## DoD «можно нарезать TZ»
- Зафиксирован domain lock: Organization/Counterparty/Site, cardinality N org, default org, адреса и nullable/verified INN.
- Есть security matrix для Org/CP/Asset: tenant scope на list/get/create/update/delete, admin/capability для печати, audit и запрет mass-assignment.
- Выбран INN provider либо W2 явно parked; записаны budget/key owner, fallback, timeout/cache/rate-limit и HITL.
- W5 пересверен с main и сокращён до доказанных gaps с тестовыми сценариями: stub-КП, no-commerce parity, module-ready/design/Gantt/shipping; без повторной реализации line-ready/supply.
- У W3/W4 определены asset lifecycle и binding contract, а каждый будущий TZ имеет conflict keys, migration/rollback и измеримые API/UI/test acceptance criteria.
