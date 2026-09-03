# TZ-NX-DOCSTUDIO-S40-FLEX-DATA-BINDINGS: гибкая подстановка данных сайта

**РОЛЬ АГЕНТА:** Executor (backend registry + frontend picker/panel wiring)  
**LAYER:** 3–4  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §2; `docs/architecture/document-studio-data-anchors.md`; `docs/architecture/nx-doc-studio-operator-bar.md`  
**ЗАВИСИМОСТИ:** S27–S31 (витрина + preview), S39  
**CONFLICT KEYS:** `backend/.../registry.service.ts`; `registry.service.spec.ts`; `frontend-nx/.../studio-data-field-picker-dialog.component.ts`; `studio-text-properties.component.ts` (если token insert); optional tiny note in data-panel  
**IMPLICIT CONFLICT:** `nx build kppdf-web`

### Preflight Check Output
- **Context read:** `registry.service.ts` DATA_SOURCES; `buildSubstitutionBag` / studio-output contextKeys; picker CONTACT_SOURCE_ORDER; data-panel selects; operator-bar
- **Key Constraints:** один write-path context; не изобретать Invoice UI (PARK); tokens must match bag keys
- **Planned Deliverable:** order в registry; payer/supplier → `{{anchor.*}}`; picker не врёт пустыми источниками
- **Validation Path:** registry specs + build + Preview с order/payer tokens

## Domain preflight

PO: в **любом** документе подставлять данные с сайта (связки).  
Канон: Counterparty≠Organization; КП=`Quotation`; строки каталога = multi via витрина, не путать с singleton `{{product.name}}`.

## ИСХОДНОЕ (дыры гибкости)

1. `DATA_SOURCES` есть: organization, counterparty, quotation, **invoice**, product, material, work-type — **нет `order`**, хотя `orderId` в context и bag.order гидратится.  
2. Picker секции «Плательщик/Поставщик» подставляют **тот же** `counterparty` source → токен `{{counterparty.*}}`, а не `{{anchor.payer.*}}` / `{{anchor.supplier.*}}` (bag уже кладёт anchor.payer).  
3. В picker торчат product/material/work-type/invoice **без** UI выбора ID в «Данные» → токены пустые на Preview (ложная гибкость).  
4. `contractId` гидратится в output, **нет** NX list/select в Данные (модуль contracts UI PARK).

## ЧТО ДЕЛАТЬ

### 1. Registry — `order` source

Добавить в `DATA_SOURCES` descriptor `order` (номер, дата, статус, суммы/поля из schema lean — 6–10 полезных полей, не dump всего). Spec: getDataSources содержит `order`.

### 2. Picker — честные якоря

1. Для секций payer/supplier: при insert токен / selection.source = `anchor.payer` / `anchor.supplier` (или явный format `{{anchor.payer.name}}` как рендерер уже ждёт).  
2. Не переиспользовать key `counterparty` для этих секций.  
3. Spec/unit на token() для payer ≠ counterparty.

### 3. Picker — не обещать мёртвое

Источники **без** binder в «Данные» сейчас: `invoice`, `product`, `material`, `work-type` — либо:
- **A (предпочтительно):** показать в picker disabled + hint «Нужна привязка сущности (в очереди / через витрину для строк)»;  
- **B:** скрыть из studio picker (оставить в API registry для других клиентов).

Выбрать **A**. Для `product`/`material` hint: «Строки таблицы — витрина в Данные; одиночный токен — позже».

### 4. Docs (коротко в этом TZ или defer S36)

Таблица в operator-bar / page.md §2: что выбирается в Данные → какие `{{tokens}}` / table sources живые.

## НЕ ИЗМЕНЯТЬ

- Invoice NX UI, Contracts NX UI (PARK)  
- Family KP schema  
- Legacy frontend  

## КРИТЕРИИ ПРИЁМКИ

1. Поле ERP → источник «Заказ» → `{{order.number}}` (или эквивалент) резолвится в Preview при выбранном заказе.  
2. Плательщик в picker → токен anchor.payer; при выбранном payer в Данные Preview ≠ клиент, если разные.  
3. Disabled invoice/product не вставляют «успешный» пустой токен без hint.  
4. `cd backend && pnpm test -- registry.service` (или focused) PASS; `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S40-FLEX-DATA-BINDINGS.done.md`
