# Аудит 2026-09-06 — Google «Снабжение» → NX (вместо таблиц)

date: 2026-09-06  
author: Cursor (Mode A)  
evidence: PO Google Sheets screenshot «Снабжение»; `SupplyRequest` / `SupplyTask` schemas; WAVE-NX-SUPPLY S0–S2 DONE; Desktop `import-targets.ts`  
goal: уйти с Google Sheets в NX с единым контуром каталог ↔ снабжение ↔ склад

### Preflight Check Output
- **Context read:** PO screenshot; `supply-request.schema.ts`; explore supply NX/BE/Desktop; `WAVE-NX-SUPPLY.md`; `DOMAIN-MAP` Supply; `desktop/src/core/import-targets.ts`
- **Key Constraints:** Mode A; не второй write-path склада; поставщик = `Organization` (supplier), не Counterparty; клиент Sheets «Заказчик» ≠ Counterparty
- **Planned Deliverable:** этот аудит + `WAVE-NX-SUPPLY-OPS` (очередь после текущих Freebuff волн)
- **Validation Path:** AC по WAVE; Desktop Excel после invoice-полей

---

## 1. Для PO (просто)

Сейчас в Google — **журнал закупок**: строка = «что купить / у кого / статус / счёт».  
В NX уже есть **две сущности** (не надо изобретать третью «таблицу снабжения с нуля»):

| Зачем | В коде | Что видит оператор сейчас |
|-------|--------|---------------------------|
| Свободная заявка (как строка Sheets, можно без заказа) | **SupplyRequest** | Реестр `/registries/…/supply-requests` — форма **урезана** (часто title+qty) |
| Задача по заказу производства | **SupplyTask** | `/supply` «Закупки» — живой список после WAVE S1–S2 |

**«Получено» в NX сегодня только меняет статус** — на склад **не кладёт**. Это главный разрыв с твоим ожиданием.  
Списание со склада при «взяли в изделие» — уже контур склада/композиции (движения), не Google.

**Desktop Excel:** цель `supplyRequest` **есть** (можно лить заявки), но нет колонок счёта/доставки как в Sheets; «все реестры NX» через Excel **не** подключены — только выбранные targets (материалы, виды работ, supplyRequest, …).

---

## 2. Поля Google → наш NX

| Google | Есть в SupplyRequest (BE) | NX UI сегодня | Заметка |
|--------|---------------------------|---------------|---------|
| Дата | `createdAt` / `supplierOrderDate` | слабо | Дата заявки vs дата заказа у поставщика |
| Категория | `categoryId` → Category | слабо | Страница `/categories`, не отдельный registry key |
| Наименование | `title` или Material.name | частично | Без material — title; с material — каталог |
| Ед.изм. | `unit` | слабо | Лучше units registry / Material.unit |
| Кол-во | `qty` | да | |
| Подал заявку | `requestedBy` (текст) | слабо | Позже → Worker/User HITL |
| Артикул | `article` snapshot | слабо | |
| Цвет | `color` | слабо | |
| Поставщик | `supplierId` → Organization | слабо | Не Counterparty |
| Ссылка | `productUrl` | слабо | |
| Заказчик (Производство / проект) | `orderId`? или notes | gap | В Sheets это часто **участок/проект**, не покупатель. Нужно решение: Order / текст / оба |
| Примечание | `notes` | слабо | Телефоны лучше Contact |
| Статус Получено/Оплачено | `status` (+ gap Оплачено) | Task lifecycle на `/supply` | **Оплачено** отдельного enum нет |
| Приоритет | `priority` urgent/normal/low | слабо | |
| Наша компания | `companyId` → Organization | слабо | |
| Доставка | только `notes` | gap | Нужен `deliveryNote` / статус доставки |
| Счета | **нет** | gap | `invoiceNo` (+ дата) |
| Фото | нет на заявке | gap | Через Material photos или photoIds на request |
| Телефон/контакт поставщика | `supplierContactId` | слабо | OrganizationContact |

**Вывод:** модель данных на бэкенде **уже близка к Sheets** для заявки. Дыры: **счёт**, **доставка**, **оплачено**, **фото на строке**, **богатый NX UI**, **received→склад**, **создание Material при новинке**.

---

## 3. Целевой сценарий NX (канон)

```
Снабжение (nav)
  ├─ «Заявки»     = журнал как Google (SupplyRequest) — создать/история
  └─ «По заказам» = SupplyTask (уже /supply) — дефицит из заказа/kit

Создать заявку → выбрать/создать Material (+ Organization supplier)
  → статусы … → «Получено» → StockMovement IN → StorageItem
  → дальше расход через склад/изделие (существующий движок)
```

Крошки: `Снабжение / Заявки` · `Снабжение / По заказам` · из заказа deep-link уже есть (`?orderId=`).

Не делаем: второй склад; PurchaseOrder/Tender из legacy без команды PO; Excel-кнопки внутри `/registries`.

---

## 4. Desktop / все ли таблицы

| Target Desktop Excel | NX |
|----------------------|-----|
| material, workType, worker, … | да (WAVE Excel align DONE для пилота) |
| **supplyRequest** | target есть; **не** полный Sheets-паритет (нет invoice) |
| supplyTask | target есть |
| «Все реестры NX» | **нет** — только whitelist в `import-targets.ts` |

После полей счёта — TZ Excel-align для supplyRequest (массовый импорт твоего Google).

---

## 5. WAVE-NX-SUPPLY-OPS (следующая волна снабжения)

| # | SIZE | ID | Суть |
|---|------|-----|------|
| 1 | L | TZ-NX-SUPPLY-S3-REQUEST-JOURNAL | NX журнал заявок + полная форма (поля schema + supplier picker) + крошки/разделы |
| 2 | S | TZ-SUPPLY-BE-INVOICE-DELIVERY | `invoiceNo`, `deliveryNote` (+ опц. paid) |
| 3 | L | TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK | received → StockMovement IN / остаток |
| 4 | L | TZ-NX-SUPPLY-S5-MATERIAL-UPSERT | новое имя → создать/привязать Material (HITL дедуп) |
| 5 | S | TZ-DESKTOP-SUPPLY-EXCEL-SHEETS | Excel Form Studio колонки под Sheets + export |
| 6 | S | TZ-NX-SUPPLY-S6-CHROME | история/фильтры/связь Order↔Request↔Task |

Порядок: S3 → BE fields → receive→stock (+ warehouse default) → material upsert+copy → Excel A → Excel B → chrome.

Черновик WAVE: `docs/agent-checklists/WAVE-NX-SUPPLY-OPS.md`  
Старт исполнения — **после** текущей очереди Freebuff (Chrome/DocStudio S46). PO decisions §6 locked.

---

## 6. Решения PO (зафиксировано 2026-09-06)

| # | Решение |
|---|---------|
| 1 «Получено» | Не молча: сотрудник (роль уточним позже: менеджер/кладовщик) **подтверждает** приёмку. Склад: предпочтительно **склад по умолчанию** (флаг на Warehouse) + можно сменить; допустим вариант «сначала выберите склад». |
| 2 «Оплачено» | **Отдельный флаг/статус**, ставит менеджер. Файл/номер счёта — **опционально**. |
| 3 «Заказчик» | **Выпадающий список Order**; если не нашли — **свободный текст** (orderId XOR orderLabel). |
| 4 Новый Material | Кто имеет доступ к снабжению (capability/роль). Typeahead → создать если нет; **обязательно «Копировать материал»** и править свойства. |
| Аудит автора | На заявке обязательно **кто создал** (`createdBy` User) + когда (timestamps уже есть). КП/документы — позже по необходимости. |

---

## 7. Gemini peer + правки каноном

Источник: [`docs/peer/gemini-supply-sheets-review.md`](../peer/gemini-supply-sheets-review.md).

| Gemini | Решение WAVE |
|--------|----------------|
| qty план/факт | Да — confirm приёмки с `receivedQty` |
| Авто IN опасно | Confirm + роль (см. §6) |
| Полки | Не делаем |
| Typeahead Material | Да + copy |
| Модерация только закупщик | **Нет** — любой с доступом к снабжению (PO) |

---

## 8. Массовый Excel из Google (проблема PO) — как делать грамотно

Ты прав: одна «плоская» заливка ломается о связи Material / Organization / Order.

**Не делаем в день 1:** магический один клик «весь Google → все таблицы» без проверки.

**Делаем (реалистично, на нашем Desktop Form Studio):**

### Путь A — по словарям, потом заявки (проще, уже почти есть)

1. Desktop: импорт/выравнивание **материалов**, **поставщиков** (Organization), при необходимости **складов**.  
2. Скачать **форму с данными** (export-with-data) — эталон имён/артикулов.  
3. Импорт **supplyRequest**: в колонках писать **артикул / имя поставщика / номер заказа** как в эталоне; валидатор Desktop: совпало → FK, не совпало → красная строка (создать / пропустить / править).  
4. HITL «Записать» только зелёные.

### Путь B — один xlsx, несколько листов + выпадающие списки (удобнее тебе, сложнее инженерия)

Шаблон из Desktop:

| Лист | Содержимое |
|------|------------|
| `Заявки` | строки снабжения (то, что заполняешь) |
| `Материалы` | выгрузка текущих Material (артикул, имя) — **только справочник** |
| `Поставщики` | Organization supplier |
| `Заказы` | number / id заказов |

На листе `Заявки` колонки «Материал / Поставщик / Заказ» = **data validation** из соответствующих листов (Excel умеет; Desktop может **сгенерировать** такой workbook).  
Ты выбираешь из списка → совпадение с NX гарантировано. Новые материалы — отдельный лист `Материалы_новые` или строки без match → create после confirm.

**Рекомендация для WAVE:** сначала A (быстрее закрыть Google), параллельно заложить B как `TZ-DESKTOP-SUPPLY-EXCEL-PACK` (multi-sheet + validation). Не вручную вешать списки в Excel каждый раз — генератор шаблона.

Дубли: режет валидатор (артикул+имя) + typeahead в UI; не «надежда что руками одинаково напишешь».

---

## 9. Следующий шаг Cursor

Executable TZ S3–S6 + Excel A/B в `tasks/_backlog/nx-supply/` → Freebuff stream после DocStudio.  
Роли receive/paid — capability в S4/S3, точные permission keys при реализации.