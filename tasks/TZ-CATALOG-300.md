═══════════════════════════════════════════════════════════════
TZ-CATALOG-300: Каталог — единый master (состав, поля, волны)
═══════════════════════════════════════════════════════════════

> **СТАТУС:** CANON после peer-ревью GPT (2026-08-04).  
> **Код НЕ писать** до явного «стартуем» от PO.  
> Единственный файл кластера CATALOG в `tasks/`.  
> Замечания peer впитаны в §2–§4 и §7; отдельный review-файл не храним.

РОЛЬ АГЕНТА: Buffalo-Architect (Mode A) → после «стартуем» — child-TZ (§7).

ЗАВИСИМОСТИ: нет  
ЗАВИСИМОСТИ-ОТ: child-TZ 301+ ждут DONE этого master (docs AC)

LAYER: 1 (docs / спека). Product-код — вне scope этого файла.

PAGES: /materials ; /materials/:id ; /modules ; /modules/:id ; /products ; /products/:id  
PAGE_DOCS: materials.page.md ; modules.page.md ; products.page.md
  (+ material-detail / module-detail / product-detail — UI-волна)

CONFLICT KEYS (этот docs-TZ):
  tasks/TZ-CATALOG-300.md ;
  docs/data-model.md ;
  docs/PO-DIARY.md ;
  tasks/README.md ;
  tasks/_backlog/catalog/README.md

Проверено (audit):
  backend/src/modules/material/material.schema.ts ;
  backend/src/modules/product-module/product-module.schema.ts ;
  backend/src/modules/product/product.schema.ts ;
  tasks/Данные/6104 test Tigran с картинками.xlsx ;
  docs/PO-DIARY.md ; docs/TZ-AUTHORING.md ;
  peer review GPT 2026-08-04 (впитан, файл удалён)

═══════════════════════════════════════════════════════════════
0. ЗАЧЕМ
═══════════════════════════════════════════════════════════════

Цех (~10 чел.) ведёт каталог: сырьё, детали, модули, изделия и комплексы.
Нужна одна модель состава с qty, без циклов, depth≤8, единый UI.
Excel `6104 test Tigran…` — **пример структуры**, не обязательно одно изделие.

═══════════════════════════════════════════════════════════════
1. ГЛОССАРИЙ (UI ↔ код)
═══════════════════════════════════════════════════════════════

| Говорят (UI) | Смысл | Код Phase 1 |
|--------------|--------|-------------|
| Материал (сырьё) | Лист, труба, дерево, краска… | `Material` + `materialKind=raw` |
| Деталь / Метиз / Покупное | Каталожные не-сырьевые | `Material` + `materialKind=part\|fastener\|purchased` (UI = фильтр) |
| Модуль | Сборочный узел | `ProductModule` |
| Изделие | Продаваемая единица | `Product` (UI «Изделие»; API `/products`) |
| Комплекс | Набор изделий | Тот же `Product`, если в composition есть ≥1 `lineType=product` (вычисляемый `isComplex`; **отдельного поля kind=complex нет**) |

**НЕ** вводить коллекцию `Part` и **НЕ** коллекцию `Complex` в Phase 1.

═══════════════════════════════════════════════════════════════
2. LOCKED РЕШЕНИЯ (D1–D4 + F1–F4)
═══════════════════════════════════════════════════════════════

### Domain (PO) — peer AGREED

| ID | Решение | Вердикт |
|----|---------|---------|
| **D1** | Product → Product | **ДА**. На связи: `quantity` + опц. `unitPriceOverride`. Не копия дерева. |
| **D2** | Product → raw Material | **ЗАПРЕТ**. Сырьё только через модуль. На изделие: module, material(≠raw), product. |
| **D3** | Детали/метизы/покупные | **Внутри Material** через `materialKind`. |
| **D4** | Глубина | **Hard max child depth = 8** (см. §3.1). Циклы запрещены. UI warn после 5. |

### Техника

| ID | Решение | Вердикт |
|----|---------|---------|
| **F1** | Состав | **refs + qty** в embedded `composition[]` на родителе. Sharing модулей сохраняется. |
| **F2** | Фото из Excel | **Future desktop / Wave 4.** Не входит в web Phase 1. Web Phase 1: ручные multi-photo + mainPhoto на Product/Module/Material. |
| **F3** | Cycle / depth | Backend guard обязателен на **смешанном** пути Product/Module. Цикл → 400/409. Depth > 8 → 400/422. |
| **F4** | Где TZ | Этот master в `tasks/`. Child-TZ после «стартуем». |

### Поля Material

- `materialKind`: `raw | part | fastener | purchased | other`
  - legacy без kind → миграция ставит **`other`** (показ ок, UI помечает «нужна классификация»)
  - `other` в составе Product: как non-raw (разрешён), но требует классификации
  - `raw` → **только** Module
  - `part|fastener|purchased|other` → Module и Product
- `assortment`, `standardRef` (два поля), `materialGrade` (не `grade`)
- Масса везде: **`weightKg`** (кг; как у Product)
- Excel «Обозначение» → `article` (не unique). **`sku` не трогать.**

═══════════════════════════════════════════════════════════════
3. ПРАВИЛА СОСТАВА И ГЛУБИНЫ
═══════════════════════════════════════════════════════════════

```text
Комплекс/Изделие ──qty(+unitPriceOverride?)──► Изделие
Изделие ──qty──► Модуль
Изделие ──qty──► Material (≠ raw)
Модуль ──qty──► Модуль
Модуль ──qty──► Material (любой kind)
Material ──► (лист)
```

### 3.1 Depth (канон)

```text
Корень Product или Module, с которого считаем путь = depth 0.
Непосредственный ребёнок = depth 1.
…
Максимально разрешённый дочерний уровень = depth 8.
Попытка depth ≥ 9 → 400/422.
```

Ограничение на **полный смешанный путь**, не только module→module:

```text
Product → Product → Module → Module → Material   ← длины пути считаются
```

UI: 0–5 обычно; >5 warn; 8 ok + lazy; 9+ reject backend.

### 3.2 Циклы

Запрещены любые циклы, в т.ч. через Product→Product:

```text
Комплекс A → Изделие B
Изделие B → Комплекс A     ← ЗАПРЕТ
```

Self-reference запрещён. Guard учитывает **и** `composition[]`, **и** legacy
`productModuleIds[]` / `materials[]` в переходный период (нельзя обойти через legacy).

### 3.3 Комплекс и «наследование»

- `isComplex` = есть ≥1 строка `lineType=product` (вычисляемо, не отдельное хранимое поле Phase 1).
- Родитель хранит **свои** имя, sku, фото, описание, коммерческие поля.
- Не копировать RAL/габариты/фото детей в комплекс.
- Габариты/масса/цвет комплекса **не** авто-агрегируются Phase 1.
- UI может показать summary состава; детали — по клику на карточку ребёнка.
- Snapshot состава — при Order/Production (Wave 3), не в Phase 1 catalog write.

### 3.4 Цена комплекса

- `unitPriceOverride` (≥0, RUB) — только на `lineType=product`.
- Не мутирует `listPrice` / цены дочернего Product.
- `Product` комплекса имеет собственную ручную цену (как сейчас у Product).
- Cost rollup / auto `compositionTotal` — **не** Phase 1.

═══════════════════════════════════════════════════════════════
4. МОДЕЛЬ ДАННЫХ (Phase 1)
═══════════════════════════════════════════════════════════════

### 4.1 CompositionLine

```ts
{
  _id: ObjectId,            // обязателен (edit/audit)
  lineType: 'module' | 'material' | 'product', // product только на Product
  refId: ObjectId,
  quantity: number,         // > 0; дробные разрешены (Phase 1)
  sortOrder: number,
  unit?: string,            // опционально; не ломает складской unit Material
  unitPriceOverride?: number, // только product-line; ≥ 0; RUB
  overrideDimensions?: { length?: number; width?: number; height?: number; unit?: string },
  isPurchased?: boolean,    // context на линии модуля; ≠ materialKind
  sourcePosition?: string,  // из Excel «Позиция» (import wave)
  sourceCode?: string,      // из Excel «Обозначение» при импорте
  notes?: string,
}
```

Правила Phase 1:

- `ProductModule.composition`: только `module | material`
- `Product.composition`: `module | material(≠raw) | product`
- Уникальность в одном родителе: пара `(lineType, refId)` — **без дублей**;
  повторный add → увеличить `quantity` **или** 409 с понятным текстом
  (выбрать в 302; предпочтение: увеличить quantity).
- Лимит: ≤ **1000** строк на родителя.
- Состав меняется **только** через composition endpoints (не произвольный PATCH всего Product/Module).
- Optimistic lock (version / `updatedAt` check) на этих endpoints.
- После миграции: `composition[]` = **единственный write source**;
  legacy `productModuleIds[]` / `materials[]` = read-fallback, запись в них запрещена;
  удаление legacy — successor-TZ.
- Дерево: lazy, `maxDepth` + `limit`; не deep populate всего графа.

### 4.2 Tree API (после guards)

- `GET /modules/:id/tree?maxDepth=8`
- `GET /products/:id/tree?maxDepth=8`
- default/max = 8; >8 → 400

### 4.3 Excel → поля (для Wave 4; зафиксировать сейчас)

| Excel | Целевое |
|-------|---------|
| Позиция | `sourcePosition` (+ иерархия parent) |
| Обозначение | `article` / `sourceCode` — **не** sku |
| Д/Ш/Т | dimensions length/width/thickness |
| Масса | **`weightKg`** (канон; как у Product; кг) |
| Сортамент, ГОСТ | `assortment` + `standardRef` |
| Материал (марка) | `materialGrade` |
| Вид изделия | Module / materialKind |
| К-во | `quantity` |

═══════════════════════════════════════════════════════════════
5. ИСХОДНОЕ СОСТОЯНИЕ (код сегодня)
═══════════════════════════════════════════════════════════════

1. Material: нет materialKind / assortment / standardRef / materialGrade.
2. ProductModule: `materials[]`, нет child-modules / composition.
3. Product: `productModuleIds[]` без qty; нет product→product.
4. Cycle/depth guards — нет.
5. Фото: materials/products — photoIds; modules — ProductModulePhoto (унификация UI-волна).
6. Bom — snapshot, Phase 1 read-only; SoT после миграции = composition.
7. Cost-calculation по `materials[]` — dual-read после миграции; полный перенос — successor.

═══════════════════════════════════════════════════════════════
6. ЧТО ДЕЛАТЬ В ЭТОМ TZ (docs)
═══════════════════════════════════════════════════════════════

ШАГ 1: Этот файл — SoT (peer-правки уже внутри).

ШАГ 2: После подтверждения PO — блок в `docs/data-model.md` «CATALOG Phase 1».

ШАГ 3: `docs/PO-DIARY.md` §5 — D1–D4 / F1–F4 (F2 = desktop future).

ШАГ 4: `tasks/README.md` — Active = TZ-CATALOG-300.

НЕ ДЕЛАТЬ: backend/frontend код, Excel web-import, параллельный старт всех child-TZ.

═══════════════════════════════════════════════════════════════
7. ВОЛНЫ ПОСЛЕ «стартуем» (последовательно)
═══════════════════════════════════════════════════════════════

### Wave 1 — backend (строго по порядку)

| ID | Содержание | Layer |
|----|------------|-------|
| **301** | Material: materialKind (+ legacy→other), assortment, standardRef, materialGrade, **weightKg**, migration | 4 |
| **302** | Composition contract Module+Product: schema, DTO, composition endpoints, rules §4.1, D2 | 4 |
| **303** | Graph guards: cycle + depth≤8 на смешанном пути; учёт legacy; unit+e2e | 4 |
| **304** | Legacy migration productModuleIds/materials → composition; dry-run; idempotent; dual-read; запрет write в legacy | 4 |
| **305** | Product→Product: unitPriceOverride, picker/API, isComplex derived | 4 |

Conflict zone общий — **не** параллелить 301–305 без изоляции веток.

### Wave 2 — web UI

Tree API consumer, CompositionEditor product/module, единые карточки,
ручные фото/docs, «где используется», stock links (read).

### Wave 3 — snapshot

Immutable specification snapshot Product/Complex → Order/Production.

### Wave 4 — desktop Excel

Multi-root, mapping wizard, preview, row errors, **image extract**, dry-run,
confirm, idempotent apply. (Бывший F2 photo-from-xlsx — здесь.)

Вне scope: People/КП/Gantt; BOM write; unlimited nesting; dual-write legacy+composition.

Conflict map Wave 1:

- 301: material.schema/dto/service/controller ; migrations ; materials e2e
- 302–305: product(+module) schema/service/controller ; migrations ;
  products-attach-modules e2e ; product-modules e2e ; cost-calculation e2e

═══════════════════════════════════════════════════════════════
8. ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ (этот docs-TZ)
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: этот файл; после OK PO — data-model.md, PO-DIARY, tasks/README.

НЕ ИЗМЕНЯТЬ: backend/src/**, frontend/src/**, Bom write, People/КП/Gantt.

═══════════════════════════════════════════════════════════════
9. КРИТЕРИИ ПРИЁМКИ (docs master)
═══════════════════════════════════════════════════════════════

1. D1–D4 + F1–F4 согласованы; F2 = desktop future; depth определён §3.1.
2. CompositionLine: _id, quantity>0, unique (lineType,refId), unitPriceOverride, ≤1000.
3. isComplex derived; наследование без копирования полей.
4. materialKind legacy default = other.
5. Волны 301→305 последовательны; Excel web не в Phase 1.
6. В `tasks/` один CATALOG-файл — этот.
7. Код продукта не тронут.

Verification:
  - Найти §3.1 depth и §4.1 CompositionLine.
  - `git status` — нет правок backend/src frontend/src от этого TZ.

═══════════════════════════════════════════════════════════════
10. KNOWN LIMITATIONS
═══════════════════════════════════════════════════════════════

- Эвристика Excel Деталь→raw|part — Wave 4.
- Масса = **`weightKg`** (зафиксировано; 301 не выбирает альтернативу).
- Optimistic lock механизм (version vs updatedAt) — выбрать в 302.
- Cost rollup / Bom sync / Order snapshot — Wave 3+.
- UI warn>5 — Wave 2; backend hard 8 — 303.

═══════════════════════════════════════════════════════════════
11. ЧЕГО НЕ ДЕЛАТЬ (peer + PO)
═══════════════════════════════════════════════════════════════

- Не начинать код до «стартуем».
- Не web-Excel-import в Phase 1.
- Не считать xlsx одним продуктом автоматически.
- Не создавать Complex / Part коллекции.
- Не копировать свойства детей в комплекс.
- Не unlimited nesting; не cycle-check только на FE.
- Не dual-write legacy + composition после миграции.
- Не параллелить весь Wave 1 backend.

═══════════════════════════════════════════════════════════════
12. ПРОМПТ ИСПОЛНИТЕЛЮ (после «стартуем»)
═══════════════════════════════════════════════════════════════

> Прочитай GEMINI.md, docs/TZ-AUTHORING.md, **этот** TZ-CATALOG-300.md.
> Закрой docs-AC master. Жди выданных child-TZ 301+ по §7 (не выдумывать).
