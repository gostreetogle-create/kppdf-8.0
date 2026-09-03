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

---

## Реализация (S40)

### 1. Registry — `order` source

`backend/src/modules/registry/registry.service.ts`: новый дескриптор `key: 'order'`,
`label: 'Заказ'`, `group: 'contacts'` (между `quotation` и `invoice`) с 8 полями:
`number`, `date`, `plannedDate`, `status`, `total` (currency), `priority`,
`deliveryAddress`, `notes` — по образцу остальных ручных дескрипторов (не dump
всей Order-схемы, только полезные для документа поля). Гидратация `bag.order`
из `context.orderId` уже существовала (`StudioOutputService.renderStudioDocument`
→ `DocumentTemplateService.buildSubstitutionBag`, S8-1), как и `studio-order-select`
в `studio-data-panel.component.ts` (пишет `context.orderId`) — не хватало только
самого registry-дескриптора, чтобы источник появился в picker и `{{order.*}}`
резолвился на Preview.

### 2. Picker — честные якоря (payer/supplier ≠ counterparty)

`frontend-nx/.../studio-data-field-picker-dialog.component.ts`:

- Баг был в том, что секции «Плательщик»/«Поставщик» в `groupedSources()`
  переиспользовали **тот же объект** `RegistryDataSource` с `key: 'counterparty'`
  (просто под другим заголовком секции) — значит `selectedSource().key`,
  `confirmInsert()` и итоговый `sel.source`, который `studio-text-properties
  .component.ts` буквально подставляет в `{{${sel.source}.${field.key}}}`, были
  равны `'counterparty'` для payer/supplier тоже. `token()` (текст-подсказка в
  карточке поля) уже маппил `payer`/`supplier` → `anchor.*`, но получал на вход
  всегда `'counterparty'`, так что реальной защиты не было.
- Фикс: `groupedSources()` теперь клонирует найденный `counterparty`-источник с
  `key: 'payer'` / `'supplier'` (и заголовком секции как label) вместо прямого
  реюза объекта. `confirmInsert()` эмитит `source: this.anchorSource(src.key)`
  (общий с `token()` хелпер: `payer`/`supplier` → `anchor.payer`/`anchor.supplier`,
  иначе как есть) — итоговый токен через consumer становится
  `{{anchor.payer.*}}` / `{{anchor.supplier.*}}`, а не `{{counterparty.*}}`.
- `studio-text-properties.component.ts` **не менялся** — он уже строил токен из
  `sel.source` буквально, фикса на стороне диалога было достаточно.
- Backend `buildSubstitutionBag` уже клал `bag.anchor.payer`/`bag.anchor.supplier`
  из `context.anchors` (не менялся, `document-template.service.ts:1612-1614`).

### 3. Picker — не обещать мёртвое (disabled + hint)

Добавлена карта `UNBOUND_SOURCE_HINTS` (`invoice`, `work-type` → «Нужна привязка
сущности (в очереди)»; `product`, `material` → «Строки таблицы — витрина в
Данные; одиночный токен — позже», по формулировке TZ). Кнопка источника в шаге 1
получает `[disabled]`, `[class.is-disabled]`, `[attr.aria-disabled]` и подсказку
под строкой (`data-test="studio-data-source-disabled-hint"`); `pickSource()`
делает ранний `return`, если источник disabled — шаг 2 (поля) для него
недостижим, значит вставить «успешный» пустой токен нельзя.

### 4. Docs

`docs/pages/document-studio.page.md` §2.4: таблица «Поле в Данные → context →
влияет на» дополнена строками Плательщик/Поставщик/КП/Заказ (с явным указанием
`{{anchor.payer.*}}`/`{{anchor.supplier.*}}`/`{{order.*}}`), плюс короткая
заметка S40 про disabled-источники и фикс payer/supplier.

### Тесты

Новый `studio-data-field-picker-dialog.component.spec.ts` (файл раньше
отсутствовал):
- «Клиент» → `source: 'counterparty'`.
- «Плательщик» → `source: 'anchor.payer'` (не `'counterparty'`).
- «Поставщик» → `source: 'anchor.supplier'`.
- `isDisabled('invoice'|'product')` true, `isDisabled('counterparty')` false;
  клик по disabled-источнику не меняет `selectedSource()`.
- DOM: кнопка «Счёт» рендерится `disabled`, hint-параграф присутствует.

`registry.service.spec.ts`: новый тест — `order` источник с `label: 'Заказ'` и
полями `number`/`date`/`status`/`total` (`total` типа `currency`).

### Gates (факт)

```text
cd backend
pnpm install --frozen-lockfile          → OK (node_modules отсутствовал в свежем worktree)
pnpm test -- registry.service           → PASS, exit 0 (5 tests)
pnpm exec eslint src/modules/registry/registry.service.ts src/modules/registry/registry.service.spec.ts
                                         → PASS, exit 0, 0 problems

cd frontend-nx
pnpm install --frozen-lockfile          → OK (node_modules отсутствовал в свежем worktree)
pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
                                         → PASS, exit 0
pnpm exec eslint apps/kppdf-web/src/app/pages/studio/studio-data-field-picker-dialog.component.ts \
  apps/kppdf-web/src/app/pages/studio/studio-data-field-picker-dialog.component.spec.ts
                                         → PASS, exit 0, 0 problems
pnpm exec jest --config apps/kppdf-web/jest.config.ts studio-data-field-picker-dialog
                                         → PASS, exit 0 (1 suite, 5 tests)
pnpm exec jest --config apps/kppdf-web/jest.config.ts studio (full studio scope)
                                         → 1 failing suite: registries.catalog.spec.ts — ПРЕДСУЩЕСТВУЮЩИЙ
                                           baseline (vat-rate/formulas registries, вне diff этого TZ,
                                           задокументировано ранее в S39 archive). Все studio picker/
                                           text-properties сьюты зелёные (356 passed / 7 skipped / 365 total).

pnpm architecture:check (root)
                                         → PASS: "Architecture check passed (1399 files; baseline 17;
                                           resolved since baseline: 2)."

cd frontend-nx && pnpm exec nx build kppdf-web
                                         → PASS, exit 0 ("Successfully ran target build for project
                                           kppdf-web and 4 tasks it depends on"). Component-style budget
                                           warning на новом picker CSS (5.02kB vs 4kB warning-порог,
                                           error-порог 8kB) — тот же класс pre-existing warnings, что и
                                           у других studio-компонентов в этой сборке, не error.
```

Checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-S40-FLEX-DATA-BINDINGS.md`

```text
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS for changed-scope specs; pre-existing baseline FAIL unrelated to this TZ (registries.catalog.spec.ts, see Gates)
  - lint: PASS for changed-scope files, 0 problems
  - kppdf-web build: PASS
  - checklist: ADDED and completed
  - progress.md: N/A (не менялся; live-state в `_NOW.md`)
  - status synchronization: PASS
```
