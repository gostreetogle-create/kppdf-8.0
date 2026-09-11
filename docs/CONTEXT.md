# CONTEXT — общий язык домена

> Тонкий глоссарий для агентов. **Не** новый source of truth.
> Планка и вкус: `docs/PO-CANON.md`. Куда смотреть: `docs/PROJECT-MEMORY.md`.
> Полный канон имён при TZ: `docs/TZ-AUTHORING.md` §1.1.
> Живая схема побеждает этот файл.

Говори коротко этими словами. Не пиши «клиент = Organization».

## Сущности

| Говорят | В коде | Не путать с |
|---------|--------|-------------|
| Клиент / покупатель / контрагент сделки | **`Counterparty`** (`counterpartyId`) | `Organization` |
| Наша фирма / юрлицо / исполнитель заказа | **`Organization`** (`organizationId`) | Counterparty |
| КП | UI: **«КП»**; сущность: **`Quotation`** (историческое `proposalId` в коде) | отдельный `Proposal` / `CommercialProposal` |
| Заказ | **`Order`** | договор как «то же самое» |
| Договор | **`Contract`** | КП |
| Люди / сотрудники цеха | **`Worker`** | `User` (логин) |
| Пользователь системы | **`User`** + роли | карточка Worker |
| Остаток на складе | **`StorageItem`** | `Material.stockQty` / `Product.stockQty` (deprecated, не SoT) |
| Занос инвентаризации / opening balance | `StockMovement` **`in`** (или `adjust`) — никогда голый `create` количества | второй write-path в обход ledger |
| Деталь (каталог / витрина студии) | обычно **`Material`** (или composition-узел); на **Ганте не уровень** | путать с Module / отдельной сущностью Part |
| Категория (реестр «Категории», `/registries`) | **`Category`** (`type: material\|product\|module\|general`), reuse `/api/categories` | `materialKind` (part/fastener/purchased — техвид материала, отдельный контур, не замена категории); `TextBlockCategory` (категории текстов, отдельная коллекция, TZ-NX-REG-TEXT-BLOCK-CATEGORIES) |

1 клиент → N КП / N заказов. Unique обычно на **номере** документа, не на FK клиента.

## Поток

Продажи/КП → заказ → снабжение/производство → склад/отгрузка.

Стол менеджера = `/desk`. Комбайн: ряд = изделие (`OrderItem`). Desktop = HITL-импорт, сайт = SoT. Чат Desktop = GGUF на ПК **или** OpenAI-совместимый API (TokenRouter и др.); не Ollama. Через API не отправлять ПДн клиентов.

## Когда обновлять

Новый устойчивый термин после grilling / TZ → одна строка сюда **и** в `TZ-AUTHORING.md` §1.1, если это канон имён. Не раздувать >80 строк.
