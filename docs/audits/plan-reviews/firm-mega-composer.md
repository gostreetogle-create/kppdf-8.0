# Мнение: Composer (Cursor agent)
Дата: 2026-08-08  
Роль: peer-review плана firm_clients_sales_docs_mega

## Вердикт одной строкой
**Go с правками** — фактическая база «есть vs дыра» в плане в целом совпадает с кодом; порядок волн разумен, но до lock нужно уточнить статус снабжения/ready (не всё stub), отсутствие D7 stub-КП, и зафиксировать PO-решения по ИНН/мульти-org.

## Что в плане верно (3–7 буллетов)

- **Organization schema богаче UI:** в `backend/src/modules/organization/organization.schema.ts` есть inn/kpp/ogrn, банк, signer, `photoIds`; в `CreateOrganizationDto` банк и signer есть, **`photoIds` в DTO нет**; FE `organization-form-dialog.component.ts` показывает только name/shortName/inn/kpp/type/signer — без банка и фото. Утверждение «FE форма тонкая» — верно.
- **Counterparty BE ≠ FE:** backend `counterparty.controller.ts` — полный CRUD + `POST /quick`; FE `counterparties.page.ts` — **только read-only таблица**, emptyMessage прямо говорит «полный CRUD — later»; при этом `pi-counterparty.service.ts` уже имеет create/update/remove (не подключены к странице).
- **Stub ИНН при quick-create:** `counterparty.service.ts` → `generateQuickInnStub()` с валидной контрольной суммой; `quickCreateParty` всегда создаёт CP с generated inn, не спрашивая пользователя. План верен.
- **INN API = ноль интеграций:** поиск `DaData|dadata|EGRUL|FNS` по репо — **0 matches**; единственная валидация — `@IsINN()` в `backend/src/common/validators/inn.validator.ts`. План верен.
- **Doc bindings — текст, не vault:** `registry.service.ts` перечисляет поля organization/counterparty (name, inn, bank…); в `document-template.service.ts` image-блоки рендерят `imageUrl`/upload шаблона, **нет binding на org.seal/logo**. План верен про «нет image-binding на печать/лого».
- **KP→Order convert живой:** `quotation.service.ts` `convertToOrder` — только из `accepted`, strip commerce, создаёт order + site; FE `proposals.page.ts` вызывает convert. План верен.
- **stub-КП от прямого заказа (D7) — дыра:** `order.service.ts` принимает опциональный `quotationId`, но **не создаёт обратное КП** при заказе без quotation. Канон D7 в `docs/audits/2026-08-08-sales-to-shop-flow-canon.md` — «нет в коде». План верен.

## Что поправить в плане до lock (обязательно)

1. **Снабжение не stub целиком.** В таблице «дыры» формулировка «ready/supply UX» размыта: `supply.page.ts` — **живой реестр** (TZ-SUPPLY-301), не NAV-stub. Дыра — auto-задачи из BOM/заказа (SUPPLY-302), procure-confirm D18, связь с ready-флагами — не «страницы нет».
2. **Design/ready — явно stub.** `design.page.ts` — stub «очередь доукомплектования»; ready на линии/модуле (D8) и soft material gate (D19) **не реализованы**. W5 должно называть конкретно: D7 stub-КП, D8 ready, D18 procure confirm, design queue — не «supply page from scratch».
3. **W1 «Org FullEditor kind C 1120» — целевое состояние, не факт.** Сейчас org-форма — kind B-ish dialog без 1120px и без секций как у `product-form-dialog.component.ts`. В lock/TZ указать: **новый FullEditor по канону** `docs/pages/ui-dialog-canon.md`, не «доработать существующий».
4. **Адреса уже частично есть через Site.** У Counterparty нет legal/actual в schema; адрес объекта — `Site` (`site.service.ts`, quick-create с `address`). Вопрос 2 плана не должен игнорировать Site — иначе дублируем «адрес клиента» в CP и Site.
5. **Multi-org в коде уже заложен.** `counterparty.schema.ts`: `organizationId` + sparse unique `{ organizationId, inn }`; list фильтрует по user.organizationId. Вопрос 3 — не «greenfield», а **политика prod**: одна demo-org vs несколько юрлиц с изоляцией lookup/INN.
6. **«Реквизиты PDF одной кнопкой» (W4)** — в репо нет отдельного endpoint/страницы; есть только build HTML/PDF через document-template + registry fields. Не обещать готовую кнопку без нового TZ (export template или dedicated doc type).
7. **Photos «на каталоге»** — точнее: `PiPhotoDropzone` на QuickCreate L product (`quick-create-dialog.component.ts`) и legacy upload в product FullEditor; **не** на org/counterparty. Уточнить в плане, чтобы TZ не искали dropzone «на полке каталога» в общем смысле.

## Ответы на открытые вопросы плана (1–7)

1. **Провайдер ИНН:** W1 — только checksum (уже есть). W2 — **DaData или аналог с платным ключом**, backend proxy + rate limit + audit log; бесплатные гос API — высокий риск SLA/ToS. **Нужен вердикт PO:** бюджет/ключ до старта W2; без ключа W2 = park, не «checksum pretending lookup».
2. **Адреса в schema:** P0 — **не добавлять** legal/actual в Org/CP; хватит inn/kpp/ogrn/bank + **Site.address** для объектов заказа. Legal address — W2+ только если lookup провайдер отдаёт и PO подтверждает хранение. **Нужен вердикт PO** для договоров/КП за пределами «объект на карте».
3. **Одна Organization или много:** код допускает N org records и tenant-scoped CP; seed — 1 demo org. Для ERP PO обычно **1 «наша фирма» на инстанс** + N counterparties; multi-org — только если реально несколько юрлиц в одном деплое. **Нужен вердикт PO**; от этого зависит W3 vault (per-org) и INN lookup scope.
4. **Кто меняет печать:** рекомендация — **`admin` only** (+ audit trail на upload/replace); manager read-only в документах. Согласовать с D15 capabilities позже.
5. **Фото клиентов сразу?** **Нет в W1–W3.** Сначала org vault (logo/seal/signature); CP `photoIds` в schema есть, UI — successor после W3. Паспорт/сканы — не блокер демо.
6. **Приоритет W5 vs W3:** для **ежедневной работы** менеджера W5 (заказ/цех/ready) критичнее; для **демо «не стыдно в PDF»** — W3→W4. Рекомендация: **W3 параллельно началу W5** (разные conflict keys), но не откладывать D7 stub-КП «пока печать». **Нужен вердикт PO** что стыднее на ближайшем показе.
7. **INN в quick-create заказа:** **да, в W2** — поле ИНН optional → lookup → prefill → HITL confirm → create/reuse CP; до W2 оставить stub с явным badge «ИНН временный, уточните в карточке». Не смешивать stub и lookup в одном релизе без UI-различия.

## Порядок волн W0–W6

**В целом согласен**, с одной перестановкой акцентов внутри W5 и уточнением параллелизма:

| Волна | План | Рекомендация reviewer |
|-------|------|------------------------|
| W0 | TZD-30 | Без изменений; не claim в firm-mega |
| W1 | Party UX | OK; явно «новый FullEditor», CP CRUD UI + reuse `pi-counterparty.service` |
| W2 | INN | OK после PO key; backend-only proxy first |
| W3 | Org vault | OK; TZ-ORG-DOC-ASSETS-301 из audit 2026-08-09 |
| W4 | Print/PDF | OK после W3; scoped «requisites doc» TZ, не весь doc-constructor |
| W5 | Sales gaps | **Поднять D7 stub-КП в начало W5**; не ждать W4; design stub + ready flags раньше vitrina мечты |
| W6 | Desktop MCP | OK last; depends W2–W4 |

Предложение: **W5a (D7 + order tree polish) может стартовать сразу после W1**, не блокируется vault — только не смешивать CONFLICT KEYS с TZD-30.

## Риски и Ban

- **Не обещать** «ИИ собрал юридически верное КП» — согласно audit org-assets vs TZD-30 и ban в плане.
- **INN lookup:** PII/комpliance, ключ в env (не FE), лимиты запросов, лог без утечки ключей; multi-org — lookup только в scope tenant org PO.
- **Деньги на API:** DaData — operational cost; заложить PO budget или feature-flag off.
- **Security:** upload seal/logo — MIME/size (как template background 5MB), RBAC admin; не хранить в public bucket без auth.
- **Не тащить** в W1–W4: Гantt drag product, полный SHIPPING, бухгалтерия — ban плана корректен.
- **Stub INN в prod-данных:** без W2 менеджеры накопят мусорные ИНН — миграция/merge CP потребует successor-TZ.

## DoD «можно нарезать TZ»

1. PO ответил на вопросы 1–7 (хотя бы default + «паркуем») — зафиксировано в lock-блоке плана.
2. Peer-reviews (≥2) сведены; расхождения по W5 vs W3 и multi-org закрыты.
3. Таблица «есть vs дыра» обновлена куратором с правками § «поправить» (supply/design/site/adresses).
4. Выбран INN-провайдер **или** явный park W2 с checksum-only и UI-предупреждением на stub.
5. Для каждой волны W1–W5 черновик 2–5 TZ с CONFLICT KEYS, без пересечения с `_active/` и TZD-30.

КОНЕЦ.
