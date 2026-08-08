# Мнение: GPT-5.6 Terra
Дата: 2026-08-08
Роль: peer-review плана firm_clients_sales_docs_mega

## Вердикт одной строкой
Go с правками: направление и волны верны, но до lock надо исправить два факта (API Counterparty уже CRUD; D7 stub-КП ещё не код) и зафиксировать модель multi-org/адресов/asset ACL до обещаний PDF.

## Что в плане верно (3–7 буллетов)
- `Organization` уже хранит реквизиты, банк, подписанта и `photoIds`, но без типизированных ролей asset: `backend/src/modules/organization/organization.schema.ts`.
- Полная доменная модель `Counterparty` уже есть, включая банк, подписанта, телефон и `photoIds`; веб-экран пока действительно является только списком: `backend/src/modules/counterparty/counterparty.schema.ts`, `frontend/src/app/pages/counterparties/counterparties.page.ts`.
- Внешней интеграции DaData / ЕГРЮЛ / ФНС нет: есть только `@IsINN` с checksum и генератор валидного технического ИНН в quick-create: `backend/src/common/validators/inn.validator.ts`, `backend/src/modules/counterparty/counterparty.service.ts`.
- КП → заказ реально работает только для `accepted` КП и намеренно выбрасывает цены/скидки из заказа: `backend/src/modules/quotation/quotation.service.ts`.
- Builder уже поддерживает текстовые data bindings Organization/Counterparty и генерацию документа; image-binding из Organization vault отсутствует: `backend/src/modules/registry/registry.service.ts`, `backend/src/modules/document-template/document-template.service.ts`.
- Фото в каталоге имеют существующий upload/path-паттерн, а на Organization/Counterparty сейчас есть лишь массив ObjectId без контроллера, UI и семантики ролей: `backend/src/modules/organization/organization.schema.ts`, `backend/src/modules/counterparty/counterparty.schema.ts`.

## Что поправить в плане до lock (обязательно)
1. **Ошибка факта про Counterparty.** В строке «Нет полного CRUD на `/counterparties`» уточнить: backend CRUD уже есть (`GET/POST/PATCH/DELETE` в `backend/src/modules/counterparty/counterparty.controller.ts`); нет FullEditor/detail/actions в FE. Иначе W1 рискует повторить API и размыть TZ.
2. **D7 нельзя описывать как живое.** Прямой заказ создаётся, но авто stub-КП от заказа в коде отсутствует; текущий order quick-create создаёт реального заказчика + Site и synthetic checksum-valid INN. Закрепить D7 отдельным контрактом, миграцией/маркером `isStub` и правилами, кто и когда превращает stub в реального контрагента.
3. **Организации сейчас неоднородно scoped.** `Organization` глобальна и имеет globally unique `inn`, `Order` вообще не несёт `organizationId`, а `Counterparty` допускает org scope. До W3/W4 надо принять единую boundary-модель и проверить все источники документа; сейчас document builder делает special-case проверки legacy Order через связанные записи.
4. **Адрес нельзя добавлять «если решим» после W1.** Для order уже обязательна отдельная сущность `Site` с `address`, но legal/actual address для Organization/Counterparty в schema нет. Нужен один явный контракт: structured address/адреса и предназначение (юр./факт./объект), без копирования поля в три сущности.
5. **Vault должен быть не просто `photoIds`.** Перед W3 зафиксировать `assetRole` (logo/seal/signature/background), допустимые MIME/размер, one-or-many, replacement/audit и ACL. Не выводить произвольный пользовательский upload в HTML/PDF без server-side validation/controlled storage.
6. **W4 не обещать «PDF одной кнопкой» как отдельную готовую возможность.** Существующая build-цепочка рендерит HTML и текстовые bindings; план должен отдельно подтвердить PDF renderer, asset delivery и snapshot/reproducibility документа. Иначе «реквизиты PDF» скрывает существенную техническую волну.
7. **Развязать W5 по тонким вертикалям.** Canon уже ставит ORDERS-302/303 перед supply/ready; не помещать в одну W5 stub-КП, витрину КП, ready, procurement и shipping. Это разные данные/экраны и разные риски показа.

## Ответы на открытые вопросы плана (1–7)
1. **Провайдер ИНН:** начать с DaData только после подтверждения PO бюджета/ключа; backend adapter, rate-limit, timeout, observability и HITL, без ключа на фронте. Нужен вердикт PO.
2. **Адреса в schema:** да, но не плоскими строками везде: `Organization.legalAddress/actualAddress` и `Site.address` как объект заказчика; для Counterparty legal/actual — только если документный сценарий это требует. Нужен вердикт PO.
3. **Одна Organization или много:** проект уже допускает несколько в КП, поэтому проектировать multi-org с первого слоя; UI может по умолчанию показывать одну активную. Нужен вердикт PO о фактических юрлицах.
4. **Кто меняет печать:** только admin; replacement должен писать audit event, сохранять автора/время и не менять уже выпущенные документы. Нужен вердикт PO о backup-админе.
5. **Фото клиентов сразу?:** нет, W3 ограничить фирменным vault. Для клиента сейчас ценнее адрес/контакт/ИНН; «сканы» требуют отдельной политики персональных данных и прав доступа. Нужен вердикт PO.
6. **Приоритет W5 vs W3:** сначала ORDERS-302/303 и тонкий supply/ready skeleton, затем W3. Печать улучшает вид КП, но разрыв «заказчик+объект → заказ» ломает ежедневный поток. Витрину КП и shipping не включать в этот ранний слой. Нужен вердикт PO.
7. **ИНН в quick-create заказа:** не заменять безусловно. Оставить быстрый name/phone/address путь для физлица/срочного заказа; добавить явное действие «Найти по ИНН» с preview + подтверждением и запретом перезаписать вручную введённое молча. Нужен вердикт PO.

## Порядок волн W0–W6

| Волна | Рекомендация | Почему |
|---|---|---|
| W0 | оставить TZD-30 отдельно | Не пересекать текущий claim и asset vault. |
| W1 | оставить, но FE FullEditor поверх существующего Counterparty API | Сначала факт-контракт и usable parties; добавить адресное решение в lock. |
| W2 | после W1, opt-in adapter | Формы и ручной fallback уже должны существовать. |
| W3 | после multi-org + asset/ACL contract | Иначе typed vault закрепит небезопасную/неясную модель. |
| W4 | после W3, разбить HTML binding / controlled image / PDF export | Нельзя считать это одной «кнопкой». |
| W5 | поднять перед W3 только для ORDERS-302/303 + ready/supply skeleton; остальное позже | Исправляет рабочий путь, не превращается в монолит sales north. |
| W6 | после W2–W4 и стабильных write contracts | MCP не должен изобретать второй путь или обходить HITL/ACL. |

## Риски и Ban
- Не обещать юридически верный КП, автоматическое заполнение без человеческого подтверждения или актуальность данных провайдера.
- Не хранить API key ИНН на фронте, не логировать полные ответы провайдера/персональные данные и не давать MCP обходить те же ACL/HITL.
- Не считать `photoIds` vault: печать/подпись — чувствительные assets; права замены, audit и version/snapshot обязательны.
- Не обещать корректную multi-org печать, пока Organization/Counterparty/Order/document build не получили один подтверждённый tenancy-contract.
- Не закупать DaData/платный API и не делать network call из формы без лимитов, кеша и согласованного бюджета PO.
- Не включать в W5 полный Gantt, автоназначение, shipping или «AI собрал готовое КП».

## DoD «можно нарезать TZ»
- PO зафиксировал ответы 1–7, включая бюджет/ключ провайдера либо явный отказ от lookup в первой версии.
- Есть короткий written contract адресов, multi-org boundary и owner/role для Organization assets.
- План исправил факт: backend Counterparty CRUD существует; D7 stub-КП ещё не реализован и имеет отдельный scope.
- Для W3/W4 определены asset roles, ACL/audit, допустимые форматы и правило snapshot уже выпущенного документа.
- W5 разделена на независимые thin slices с зависимостями от ORDERS-302/303 и без обещаний Gantt/shipping.
