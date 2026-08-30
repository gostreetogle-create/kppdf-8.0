# TZ-NX-COMPOSITION-DOMAIN-REVIEW — DONE (analysis-only)

ARCHIVE_MARKER  
outcome: DONE  
closed_at: 2026-08-29T18:10:00Z  
closed_by: cursor  
mode: analysis-only — **no product code, config, or legacy mutated**

> Source TZ `tasks/TZ-NX-COMPOSITION-DOMAIN-REVIEW.md` в репо не существовал.  
> Working copy: `tasks/_active/TZ-NX-COMPOSITION-DOMAIN-REVIEW.md`  
> Checklist: `docs/agent-checklists/TZ-NX-COMPOSITION-DOMAIN-REVIEW.md`

MCP `claude_code` Agent в этой сессии: `Available agents: none`. Review — независимый разбор **живой schema + guards**, не повтор vision-файла.

Легенда строк: **FACT** = прочитано в коде/каноне; **INFERENCE** = вывод Cursor; **DECISION NEEDED** = только PO (Да/Нет).

---

## Вердикт (INFERENCE)

Для MVP и nx-конструктора **три коллекции**: `Material`, `ProductModule`, `Product`.  
**Part / Kit / System как сущности не заводить.** Комплекс = то же `Product`, у которого в `composition[]` есть `lineType: product` (`isComplex` считается на read).  
Каталог = live refs + qty. Immutable snapshot — у коммерческих документов (КП freeze), не у дерева состава.

---

## 1. Терминология

| Говорят (UI RU) | Код / коллекция | Не путать | Метка |
|-----------------|-----------------|-----------|--------|
| Материал (сырьё) | `Material` + `materialKind: 'raw'` | остаток склада | FACT `material.schema.ts:6-8,37-39` |
| Деталь / метиз / покупное | тот же `Material` + `part` / `fastener` / `purchased` / `other` | отдельный `Part` | FACT enum; **нет** `part.schema.ts` |
| Модуль | `ProductModule` (`productmodules`) | Angular/Nest «module» | FACT `product-module.schema.ts:48-67` |
| Изделие | `Product`; UI «Изделие» | `Product.kind` good/service/work | FACT `product.schema.ts:17,26`; page.md |
| Комплекс | **не коллекция**; `Product.isComplex` derived | `Product.kind` | FACT `product.service.ts:94-97,107` |
| Kit | нет в каталоге | UI-kit, OrchestratorKit | FACT grep schema |
| System | нет в каталоге | `isSystem` seed-флаг | FACT Material/Product `isSystem` |
| BOM (экран) | дерево `composition[]` + `GET …/tree` | коллекция `boms` | FACT dual write-path, §7 |

**INFERENCE (лучшая терминология для nx):** в UI — Материал / Деталь (фильтр kind) / Модуль / Изделие / Комплекс (бейдж). В API — только три типа + `lineType`. Слово **Kit/System не использовать** в IA.

**DECISION NEEDED:** заводить ли когда-нибудь отдельную коллекцию `Part`? Рекомендация: **Нет** (D3 2026-08-04 + склад `StorageItem.materialId` без XOR на partId).

---

## 2. Вложенность

**FACT — guards (`composition-line.service.ts:46-77`, `product-module.service.ts:115,129`):**

| Родитель | Разрешено | Запрещено |
|----------|-----------|-----------|
| Product | module, material (`materialKind !== 'raw'`), product | raw material; self-cycle; depth>8 |
| ProductModule | module, material (любой kind, включая raw) | `lineType: product` |
| Material | лист (детей нет) | состав |

**FACT — vision D1–D4** (`docs/compose/plans/2026-08-04-catalog-composition-vision.md` §0.1, `docs/data-model.md:385-391`): D1 Product→Product да; D2 Product→raw нет; D3 Part=kind; D4 depth 8. Код **совпадает**.

**FACT — расхождение UI-канона:** `product-detail.page.md` матрица «Изделие → изделие **или** модуль» (материал в пикере «не убирать»). Код **разрешает** non-raw material на Product.

**INFERENCE:** для конструктора держать **код** (деталь/метиз/покупное на изделие можно; сырьё только в модуле). Page.md — формулировка оператора, не запрет API.

**DECISION NEEDED:** оставить Product→деталь как в API? Рекомендация: **Да**.

Запрещено вверх по дереву (INFERENCE из графа): Material не содержит ничего; Module не содержит Product; Complex не отдельный тип.

---

## 3. Materialized vs derived

| Поле | Где живёт | Класс | Метка |
|------|-----------|--------|--------|
| `composition[]` | Product, ProductModule | materialized write SoT | FACT schema |
| `quantity`, `sortOrder`, `unit?`, `overrideDimensions?`, `unitPriceOverride?`, `isPurchased?` | строка состава | materialized на ребре | FACT `composition-line.schema.ts` |
| `isComplex` | только API read | **derived** (`some lineType===product`) | FACT `product.service.ts:94` |
| `Product.costPrice` / `listPrice` / `basePrice` | карточка | materialized; cost-activate пишет costPrice | FACT + COST-305 канон |
| `unitPriceOverride` | ребро комплекса | materialized snapshot цены **в этом составе** | FACT; не пишет карточку ребёнка |
| cost-preview модуля | расчёт | derived | FACT module-detail: нет listPrice |
| `Category.fullPath` | Category | materialized path | FACT `category.schema.ts:21-23` |
| `Material.stockQty`, `Product.stockQty` | карточка | **не SoT** остатка | FACT CONTEXT + StorageItem |
| `StorageItem.quantity` | склад | SoT qty | FACT `storage-item.schema.ts:49-50` |
| `Product.kind` | good/service/work | materialized, **не** = комплекс | FACT |
| `Product.status` + `isActive` + `deletedAt` | три флага | materialized, семантика пересекается | FACT `product.service.ts:260` archive пишет все три |

**INFERENCE:** nx не должен persist'ить `isComplex`. Не показывать `stockQty` как остаток.

---

## 4. Live reference vs immutable snapshot

| Поверхность | Семантика | Метка |
|-------------|-----------|--------|
| Каталог `composition[].refId` | **live** shared refs (F1: не deep-clone) | FACT vision + schema |
| `GET /products/:id/tree`, `/modules/:id/tree` | live walk, maxDepth 8 | FACT `catalog-graph.service.ts:9,202` |
| Заказ / Гант / composition-tree на `/orders` | **live BOM каталога**, карандаш → карточка каталога | FACT `ui-composition-tree.md:21-24,61` |
| `OrderItem` | FK `productId` + inline `productName`/`productSku`/`unit`/`qty`/`price` | FACT `order.schema.ts:26-45` — **не** копия дерева |
| КП `QuotationItem` | FK + inline name/sku/photo; freeze → `versions[]` immutable | FACT `quotation.schema.ts:31-104,288-292` |
| `createInlineSnapshot` (CORE-301) | контракт snapshot-on-transition | FACT `snapshot.helper.ts` — **не** вплетён в catalog write |
| Duplicate product (CATALOG-371) | новый Product + копия embedded composition; фото/module = refs | FACT `products.page.md` |

**INFERENCE:** конструктор и реестры всегда live. Snapshot состава изделия **не** делать в MVP. КП не меняет каталог молча (`PO-CANON`). Specification-снимок заказа — gap vision-lite, не этот TZ.

**DECISION NEEDED:** нужен ли immutable snapshot дерева на заказе до стадии Specification? Рекомендация: **Нет (later)**.

---

## 5. Цвет / покрытие

| Уровень | Поле | Смысл | Метка |
|---------|------|--------|--------|
| Изделие | `Product.ralCode` | slug `ColorReference` | FACT `product.schema.ts:41`, `color-reference.schema.ts:12-16` |
| Справочник | `ColorReference` | RAL + hex + system «Не выбран» | FACT |
| Материал | `Material.colors: string[]` | допустимые цвета **заказа снабжения**, не RAL FK | FACT `material.schema.ts:74-80` |
| Строка снабжения | `SupplyRequest.color` | одно из `Material.colors` | FACT comment schema |
| Модуль | **нет** ral/color | — | FACT schema |
| Ребро состава | **нет** color override | — | FACT CompositionLine |
| UI-легенда ИЗД/МОД/МАТ | `catalogKindOklch` | не RAL | FACT `ui-composition-tree.md:42-43` |
| Покрытие (powder, цинк, грунт) | **поля нет** | — | FACT grep schema |

**INFERENCE:** цвет изделия = один RAL на карточке. Цвет материала = варианты закупки. Перекрас модуля в составе — **нет модели**. Покрытие ≠ цвет; в MVP не сущность.

**DECISION NEEDED:** заводить покрытие (отделка) отдельно от RAL? Рекомендация: **Нет в MVP** (примечание на изделии/модуле хватит).

---

## 6. Габариты и локальные размеры

| Сущность | Форма | Ед. | Метка |
|----------|--------|-----|--------|
| Material | `dimensions[]` `{type, value, isImmutable}`; types length/width/height/thickness/diameter/depth | мм (JSDoc) | FACT `material.schema.ts:10-24` |
| Product | объект `{length, width, height, unit?}` | unit свободный | FACT `product.schema.ts:7-12,39` |
| ProductModule | объект `{width, height, depth, unit?}` | **depth, не length** | FACT `product-module.schema.ts:6-10,54` |
| Ребро | `overrideDimensions {length, width, height, unit?}` | нет thickness/diameter | FACT `composition-line.schema.ts:4-16` |
| StorageItem | LWH объект | — | FACT |

**FACT enforcement:** `isImmutable` на composition material-line проверяет только `length|width|height` (`product-module.service.ts:188-192`). Толщина/диаметр в override **не выражаются** — остаются на карточке материала.

**INFERENCE:** три модели габаритов — долг, не блокер MVP. Правило цеха: **карточка** = сортамент/конверт; **ребро** = раскрой L×W×H если не immutable. Не унифицировать schema в nx-волне 1.

---

## 7. BOM / tree

**FACT — канонический write:** `POST/PATCH/DELETE …/composition` (Product и Module). Dual-read: непустой `composition[]` бьёт legacy `productModuleIds` / `materials[]` (`composition-line.service.ts:114-116`). Limit 1000 строк. Duplicate `(lineType, refId)` → upsert qty (`upsertDeduplicated`).

**FACT — tree:** `CatalogGraphService.getTree` → `{_id, name, kind, lineType?, quantity, unit?, photoUrl?, children[]}`. Kind узла: product | module | material.

**FACT — parallel `Bom` collection:** `{productId, version, isActive, components[].productComponentId → ProductModule}`. Отдельный versioned BOM. Не composition-API. ProductComponent schema **удалён** (коммент `bom.schema.ts:5-8`).

**FACT — `docs/data-model.md` отстаёт:** описывает `ProductComponent`, `Modules`, `ModuleMaterial` как отдельные сущности — **STALE** vs audit 2026-08-22.

**INFERENCE:** nx читает/пишет только `composition` + tree/where-used. Коллекцию `boms` в конструктор **не** тащить. Legacy arrays — dual-read until cutover, не второй UI write-path (`AGENT-TASK-MODES` composition trigger).

---

## 8. Quantity and unit

**FACT:**

- `CompositionLine.quantity` required, min `0.000001` — множитель на **этом ребре**.
- `unit?` на ребре опционален; на Material/Product `unit` required (Product default `'шт'`).
- Справочник `Unit.key` — slug, которым **должны** пользоваться свободные строки unit (`unit.schema.ts:8-10`); FK нет — строка.
- Module legacy `materials[].unit` default `'шт'`.
- Склад: XOR `StorageItem.productId` **или** `materialId` — модуль **не** складская позиция.
- Dedup: повтор той же (type, ref) **складывает** qty, не создаёт вторую строку.
- `WorkType` на модуле: `estimatedHours` + `sortOrder` — не qty состава.

**INFERENCE:** qty линии × qty предков = потребность. Единица линии, если пуста, = единица ребёнка. Смешение м / шт на одном материале — ошибка данных, не отдельный тип. Модуль не имеет собственного stock row.

---

## 9. Cycle detection

**FACT** `catalog-graph.service.ts:47-79,227-238`:

- self-ref той же kind+id → 400 RU.
- DFS потомков; `CYCLE_HIT` → 400 с именами.
- `parentDepth + 1 + maxChildDepth > 8` → **422**.
- Material depth = 0.
- Вызов на add/update composition Product и Module.
- Cost-rollup при цикле **не бросает**, а skip + `infos[]` (`cost-calculation.service.ts` comment) — другой контур.

**INFERENCE:** конструктор обязан опираться на тот же API (не клиентский только-граф). UI warn >5 из vision **не проверялся** в этом TZ (UI-only).

---

## 10. Deletion / archive / version

**FACT Product remove:** `deletedAt` + `isActive: false` + `status: 'archived'` (`product.service.ts:260`).

**FACT Module remove:** soft `deletedAt`; **409** если есть ссылка в `products.composition` / `productModuleIds` **или** в `boms.components` (`product-module.service.ts:156-161`).

**FACT Material:** `deletedAt` (schema); where-used не блокирует в этом review (не читали material.remove целиком).

**FACT docs lag:** `modules.page.md` таблица API всё ещё пишет «Hard delete» — **ложно** относительно service.

**FACT versioning:**

- Catalog Product/Module: **нет** `version` поля. Optimistic lock `__v` на Product PATCH (`products.page.md` expectedVersion).
- `Bom.version` unique с productId — parallel, не composition.
- КП: `catalogSourceVersion?` на строке + `versions[]` freeze.
- Duplicate product: `copiedFromProductId`, новый sku — копия, не версия.

**INFERENCE:** архив = soft-delete. Нельзя архивировать модуль, пока на него живые рёбра. Версионирование состава каталога **не** MVP (иначе сломается live Gantt). КП freeze ≠ версия изделия.

**DECISION NEEDED:** версионировать ли карточку изделия (v1/v2) в MVP? Рекомендация: **Нет**.

---

## 11. MVP — какие сущности обязательны

**Обязательны (уже в продукте, FACT routes + DOMAIN-MAP):**

1. `Material` (+ `materialKind`, dimensions, unit, article)
2. `ProductModule` (article, composition, workTypes)
3. `Product` (sku, composition, ralCode, цены)
4. Supporting: `Category` (type material|product|general), `Unit`, `ColorReference`, `WorkType`, `Photo`
5. Склад отдельно: `StorageItem` + movements — **не** часть конструктора состава

**Не обязательны как новые типы (INFERENCE):**

- `Part` collection
- `Complex` / `Kit` / `System` collection
- `Bom` как write-path конструктора
- `ProductPassport` (1:1 optional)
- coating entity
- snapshot дерева заказа

**Комплекс в MVP:** то же изделие с product-lines + бейдж `isComplex` + `unitPriceOverride`.

---

## Противоречия (не чинить в этом TZ)

| Что | Vs | Метка |
|-----|-----|--------|
| `product-detail.page.md` «изделие или модуль» | API пускает non-raw material | FACT |
| `modules.page.md` Hard delete | `deletedAt` updateOne | FACT |
| catalog-graph comment «Module без organizationId» | schema `organizationId?` + unique article | FACT `product-module.schema.ts:53,71` vs comment ~169 |
| `docs/data-model.md` ProductComponent / Modules | живой код | FACT audit 2026-08-22 |
| `Product.kind` vs комплекс | kind ≠ isComplex | FACT |
| Три lifecycle-флага Product | один archive-write | FACT |
| Cost cycle skip vs composition 400 | разные политики | FACT |

---

## Рекомендуемый lock для nx (INFERENCE — принять, если PO не возразит)

1. Три коллекции. UI-фильтры ≠ новые entity.
2. Вложенность как таблица §2 (код).
3. `isComplex` только derived.
4. Каталог live; snapshot только КП/коммерция.
5. Один write-path: composition API.
6. RAL на изделии; цвета материала — снабжение; покрытия нет.
7. Qty на ребре; unit строка из справочника Unit.
8. Циклы/глубина 8 — сервер.
9. Soft-delete; не удалять referenced module.
10. Слова Kit/System в IA каталога не использовать.

---

## DECISION NEEDED (PO, Да/Нет)

Рекомендация Cursor везде **Нет новых сущностей / оставить как в коде**, кроме пункта 1 если цех хочет иначе.

1. Product → деталь (non-raw Material) **разрешить** как сейчас в API? **Да / Нет**
2. Отдельные коллекции Part, Kit или System в nx-MVP? **Нет / Да (какая)**
3. Покрытие как поле/справочник в MVP? **Нет / Да**
4. Версии карточки изделия (не КП) в MVP? **Нет / Да**

Пункты 2–4 при «Нет» = lock §рекомендация. Пункт 1 при «Нет» = ужесточить guard (отдельный executor TZ, не этот файл).
