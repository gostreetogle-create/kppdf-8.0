# Мнение: Sonnet (Cursor agent, Claude Sonnet 5)
Дата: 2026-08-08
Роль: peer-review плана firm_clients_sales_docs_mega

## Вердикт одной строкой
**Go с правками** — таблица «есть vs дыра» в плане подтверждается кодом почти дословно; но до lock нужно закрыть один системный риск, который план не называет явно: **tenant-изоляция вокруг Organization/Counterparty дырявая уже сейчас**, и W3 (vault на печать/лого) нельзя открывать, пока это не решено хотя бы политикой.

## Что в плане верно (3–7 буллетов)

- **Organization schema богаче формы.** `backend/src/modules/organization/organization.schema.ts:79` — `photoIds: Types.ObjectId[]` есть в схеме; `create-organization.dto.ts` этого поля **не содержит** вообще (нет строки `photoIds` в DTO); FE `organization-form-dialog.component.ts:178-190` — форма только name/shortName/inn/kpp/type/signerName/signerPosition, без банка и фото. План прав: «FE форма тонкая; photoIds не в DTO/UI».
- **Counterparty: BE полный, FE — только список.** `counterparty.controller.ts` имеет `POST /quick`, `POST`, `PATCH :id`, `DELETE :id`. FE `counterparties.page.ts:54` прямым текстом: «API готов — полный CRUD и объекты (площадки) в ORDERS-303» и рендерит только read-only таблицу (3 колонки). `pi-counterparty.service.ts` уже содержит `create/update/remove`, но никто их со страницы не вызывает. План прав.
- **Stub ИНН при quick-create — подтверждено буквально.** `counterparty.service.ts:12-19` `generateQuickInnStub()` строит валидный по чек-сумме ИНН из timestamp; `quickCreateParty` (:37-58) всегда создаёт Counterparty с этим сгенерированным ИНН, никогда не спрашивая реальный. Никакого внешнего lookup там нет.
- **INN-провайдеров в коде ноль.** Поиск `DaData|dadata|EGRUL|FNS|nalog.ru|checko|kontur` по всему репо не даёт ни одного продуктового совпадения (только упоминания в доках/тестах названия валидатора). Единственная проверка — чек-сумма в `backend/src/common/validators/inn.validator.ts`. План прав дословно: «Ноль DaData/EGRUL/FNS-интеграций».
- **Doc bindings = текстовые поля, не картинки печати/лого.** `registry.service.ts:66-97` перечисляет только текстовые поля (inn, bankName, bankBik, signerName…). `document-template.service.ts` рендерит `image`-блоки через generic `imageUrl` в `settings` блока (:914-944) — это upload картинки **в конкретный блок шаблона**, а не привязка к `organization.seal`/`organization.logo` по ролям. Плюс `Photo` схема (`photos/photo.schema.ts`) вообще не имеет поля `role` (logo/seal/signature/background) — типизированных ролей физически нет ни на Organization, ни на Photo. План прав: «нет image-binding на печать/лого».
- **КП→Заказ конвертация — живая и с гардом статуса.** `quotation.service.ts:529-560` `convertToOrder` бросает исключение если статус ≠ `accepted`, копирует позиции как snapshot (комментарий "COPY: FK is immutable"), создаёт `Order` с `quotationId`. FE `proposals.page.ts` дергает конверт. План прав, что convert живой.
- **D7 (обратный stub-КП при прямом заказе) — реально отсутствует.** `order.service.ts:70-83` в `create()` `quotationId` — просто опциональное поле (`dto.quotationId ? ... : undefined`); нигде в файле нет создания quotation, если его не передали. Поиск `stub|D7|createStub` по `order.service.ts` — 0 совпадений. Канон-документ (`2026-08-08-sales-to-shop-flow-canon.md` §D7) фиксирует это как решённое архитектурой, но не реализованное — план верно относит это к дырам.

## Что поправить в плане до lock (обязательно)

1. **Главное: tenant-изоляция «Organization» как объекта не описана и дырявее, чем предполагает Q3.** Миграция `backend/src/database/migrations/2026-07-31-TZ-238-user-organizationId.ts` доказывает, что `user.organizationId` — это **_id реального документа Organization** (`orgs[0].id`), т.е. каждая фирма-арендатор = одна запись Organization, и от неё уже скоупятся `Counterparty`, `DocumentTemplate`, `Category`, `Worker`, `text-block-category` и др. Но сам модуль `organization.controller.ts`/`organization.service.ts` **не фильтрует ничего по user.organizationId** — `list()`, `findOne()`, `update()`, `remove()` работают по всей коллекции без проверки владения. Любой `manager`/`admin` одного тенанта технически может открыть/поменять/удалить **чужую** фирму (банк, ИНН, печать) по id, если он его узнает (например, подобрав/увидев в другом контексте). План должен явно зафиксировать это как **security-дыру для W3** (нельзя вешать печать/лого-vault на объект, у которого нет tenant-guard), а не как нейтральный «есть schema».
2. **Тот же паттерн у Counterparty на уровне записи.** `findAll()` в `counterparty.service.ts:61-100` фильтрует по `user.organizationId`, но `findById/update/remove` (:102-121) — **без фильтра по organizationId вообще**. `GET/PATCH/DELETE /counterparties/:id` не проверяют владение. План (и W1 Counterparty FullEditor) не должен просто «доделать FE CRUD» поверх этого API — нужен TZ на org-guard в BE **до или вместе с** W1, иначе thin FullEditor физически позволит редактировать чужого клиента по прямой ссылке/URL.
3. **«Ready/supply UX» в W5 — расплывчато**, как уже отметил composer: `supply.page.ts` — не NAV-stub, а рабочий реестр (TZ-SUPPLY-301); `design.page.ts` прямо содержит комментарий `TZ-NAV-301 — stub: очередь доукомплектования`. В план/будущие TZ стоит внести разницу явно: design = честный заглушечный экран, supply = живой, но без авто-задач из BOM/ready-флагов.
4. **«Org FullEditor kind C 1120» в W1 — целевое состояние, не факт репо.** Текущий `organization-form-dialog.component.ts` — компактный диалог (`width: 'lg'`), не полноразмерный canon-editor 1120px как у product/каталога. Формулировка волны должна звучать «построить новый FullEditor по canon», не «доработать существующий диалог».
5. **Фото — не только «не на org/CP», а вообще без ролей в схеме Photo.** Плюс к тому, что уже верно подмечено в таблице дыр: даже если `photoIds` добавить в DTO/UI сегодня, `Photo` (`photos/photo.schema.ts`) не различает «это лого» vs «это скан паспорта» — нужен либо `role` на `Photo`, либо отдельная типизированная структура на Organization (как и предполагает W3), это должно быть явным пунктом W3 acceptance, а не подразумеваемым.
6. **«Реквизиты PDF одной кнопкой» (W4)** в коде не существует даже как заготовка — нет `requisites`/`bank-details` эндпоинта или отдельного doc-type; единственный путь — общий `document-template` рендер. Формулировка W4 должна явно требовать **новый TZ на dedicated doc-type/шаблон «Реквизиты»**, не намекать, что это «включить кнопку».
7. **Multi-org лукап ИНН (Q1) зависит от исправления п.1–2.** Если Organization/Counterparty не имеют жёсткого org-guard на чтение/запись по id, то интеграция с платным провайдером (DaData) в W2 рискует делать lookup «в контексте не того тенанта» — это нужно явно завязать в acceptance W2 («lookup сохраняет CP только в organizationId текущего user»).

## Ответы на открытые вопросы плана (1–7)

1. **Провайдер ИНН:** согласен с наблюдением composer — DaData/аналог с платным ключом, backend-only proxy (ключ не во FE), rate-limit, audit-лог запроса (без утечки ключа в лог). До ключа/бюджета — W2 = park, checksum остаётся единственной защитой. **Нужен вердикт PO** по бюджету и по тому, готовы ли мы хранить PII (ФИО директора и т.п.) из внешнего API.
2. **Адреса в schema:** не добавлять `legalAddress/actualAddress` в Organization/Counterparty на P0 — у нас уже есть `Site.address` (`site.schema.ts:19`) для объекта поставки, и это разумно разделять «юр. адрес фирмы» от «адрес объекта». Если ИНН-провайдер начнёт отдавать юр.адрес в W2 — тогда одно новое optional-поле на Organization/Counterparty, не раньше. **Нужен вердикт PO**, нужен ли юр.адрес в печатных документах на первый релиз (часто да, для договора/накладной).
3. **Одна Organization или много:** код уже трактует **Organization = единица тенантности** (см. миграция TZ-238) — это не «поле для галочки», а архитектурное решение, которое уже работает для Counterparty/DocumentTemplate/Category/Worker. Если PO хочет **несколько юрлиц в одном деплое** — придётся сначала закрыть п.1 моего списка правок (org-guard на самом Organization CRUD), иначе фирма A увидит/сможет менять фирму Б. Если **всегда одна фирма на инстанс** — тогда org-guard на Organization можно упростить (просто запретить create второй Organization не-system-админом), но у Counterparty/etc. проверка `findById/update/remove` по organizationId всё равно нужна отдельно от этого вопроса. **Нужен вердикт PO**, но с пометкой: это не только продуктовый, а security-вопрос.
4. **Кто меняет печать:** согласен с composer — `admin`-only + audit trail (в проекте уже есть `@AuditAction` декоратор на других контроллерах, паттерн переиспользуем). Manager — read-only.
5. **Фото клиентов сразу:** нет, не в W1–W3. У Counterparty `photoIds` в schema уже есть (`counterparty.schema.ts:74`), но UI/ролей нет нигде; сначала закрыть Organization vault (людям стыднее показать КП без печати, чем без фото клиента), паспорт/сканы — successor.
6. **Приоритет W5 vs W3:** для ежедневной работы менеджера W5 (дыры в потоке: D7 stub-КП, ready на линии) критичнее по частоте использования; для демо «не стыдно показать» — W3 (печать/лого в PDF) заметнее с первого взгляда постороннему человеку. Рекомендация как у composer: **начинать W5a (D7 + order tree polish) параллельно с W1**, не дожидаясь vault — они не пересекаются по CONFLICT KEYS. **Нужен вердикт PO**, что важнее на ближайшем показе.
7. **ИНН в quick-create заказа:** да, в W2 заменить сгенерированный stub на настоящий lookup+HITL-подтверждение — но конкретно потому, что `generateQuickInnStub()` сейчас пишет валидный-по-чексумме, но **фиктивный** ИНН прямо в БД без всякой пометки «временный» на самой записи Counterparty (нет поля типа `innIsStub: true`). Пока W2 не готов — предлагаю **промежуточный тонкий TZ**: добавить флаг/бейдж «ИНН временный» на записи, созданные через `/quick`, чтобы стаб не выглядел как настоящие данные клиента в отчётах/КП.

## Порядок волн W0–W6

Согласен с порядком плана и с перестановкой composer (поднять D7 в начало W5). Дополнение — явно завязать security-guard (Organization/Counterparty by-id scoping) как pre-req для W3, не как отдельную «когда-нибудь»:

| Волна | План | Моя правка |
|-------|------|------------|
| W0 | TZD-30 | Без изменений |
| W1 | Party UX | Согласен; явно «новый FullEditor», не доработка диалога |
| **W1.5 (новая)** | — | **Org-guard**: `findById/update/remove` для Organization и Counterparty начинают проверять `user.organizationId`; иначе W1 CRUD-UI просто открывает дыру шире |
| W2 | INN | OK после PO-ключа и после W1.5 (lookup должен писать в правильный tenant) |
| W3 | Org vault | OK, но **после** W1.5 — иначе печать/лого фирмы А может залить/увидеть фирма Б |
| W4 | Print/PDF | OK после W3; отдельный scoped doc-type «Реквизиты» |
| W5 | Sales gaps | D7 в начале, design/ready — явно отдельные пункты, не «supply UX» одним словом |
| W6 | Desktop MCP | OK последним |

## Риски и Ban

- **Cross-tenant запись/чтение по id** (Organization, Counterparty) — сейчас реальная дыра в коде, не гипотеза. Не обещать W3 (vault на печать) без закрытия этого пункта хотя бы политикой/TZ.
- **Не обещать** «ИИ собрал юридически верное КП» — уже в бане плана, подтверждаю.
- **INN lookup:** ключ провайдера строго в backend env, никогда во FE; лимиты запросов и лог без утечки ключа/ПДн; multi-org — lookup обязан писать результат в organizationId текущего пользователя (см. Q1/Q3).
- **Деньги на API:** DaData/аналог — operational cost на каждый запрос; нужен либо PO-бюджет, либо feature-flag off с явным UI «lookup недоступен, введите вручную».
- **Stub ИНН в прод-данных:** без явного бейджа на записи `generateQuickInnStub` накопит «мусорные» ИНН, которые визуально неотличимы от настоящих — расчистка потребует successor-TZ на merge/dedup Counterparty.
- **Не тащить** в W1–W4: полный Гант-drag, SHIPPING, бухгалтерия — ban плана корректен, подтверждаю.

## DoD «можно нарезать TZ»

1. PO ответил на вопросы 1–7 (см. выше), включая явный ответ на «одна фирма или много» с учётом того, что это уже архитектурная граница тенантности в коде.
2. **Org-guard TZ (W1.5)** для Organization/Counterparty либо запланирован первым, либо PO явно принял риск («у нас реально один инстанс на клиента, cross-tenant не актуален прямо сейчас») — это должно быть письменно зафиксировано в lock-блоке, а не молча пропущено.
3. Peer-reviews (≥2, включая этот) сведены куратором; расхождений по фактам кода не осталось (я не нашёл ни одного места, где план противоречит коду — только недосказанности).
4. Выбран INN-провайдер **или** явный park W2 с checksum-only и UI-бейджем на stub-записях.
5. Для каждой волны W1–W5 черновик 2–5 TZ с CONFLICT KEYS, без пересечения с `_active/`, TZD-30 и без переписывания chunks, которые уже правит W1.5 (org-guard) — если она попадёт в очередь.

КОНЕЦ.
