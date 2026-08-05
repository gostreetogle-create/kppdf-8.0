# Design: Table kit (семейство таблиц Paper & Ink)

> **Статус:** docs SoT — TZ-UI-TABLE-301 (Cursor closeout 2026-08-04).  
> **Код в этой TZ:** **запрещён** (`frontend/src/**` не трогать).  
> **Живой фундамент:** `frontend/src/app/shared/ui/pi-table.component.ts` (+ `pi-table-templates.service.ts`).  
> **Соседний SoT:** Group Chip Workspace §4 —  
> `docs/superpowers/specs/2026-08-04-group-chip-workspace-design.md`.

---

## 0. Зачем

Списки в CRM уже почти на `app-pi-table`, но:

- часть реестров всё ещё на ручном `<table class="w-full text-sm">`;
- дерево категорий — отдельный CDK markup, не kit;
- expand/selection уже есть в primitive, но **варианты** не названы и не канонизированы;
- PO хочет: **один визуал**, разные способности; правка chrome в kit → везде.

Нужен явный **table kit**: Flat / Expandable / Tree (+ Selectable позже).

---

## 1. Семейство variants

| Variant | Способности | Типичные экраны |
|---------|-------------|-----------------|
| **Flat** | sort, row actions, pagination, loading/empty, sticky cols, cell templates | materials, units, colors, orders, … |
| **Expandable row** | Flat + подстрока (`expandedRow` TemplateRef), active-row predicate (`expandedRowWhen`), keyboard/a11y contract | products (состав модулей); modules/work-types при необходимости |
| **Tree** | вложенность, expand/collapse; **drag-reorder = capability flag** | categories (сейчас CDK custom) |
| **Selectable** *(backlog)* | `selectionMode: single \| multi` + bulk bar | склад / массовые операции — **когда PO попросит** |
| **Dense** *(backlog)* | уменьшенный py/gap, тот же chrome | плотные складские гриды — по запросу |

### Уже в коде `app-pi-table` (as-is API)

- Flat: columns, sort, rowActions, page/total/pageSize, loading, empty, sticky, cellTemplates.
- Expandable: `expandedRow` + `expandedRowWhen` + `expandedRowLabel` inputs (потребитель: **products**).
- Selectable: `selectionMode` API есть, **0 потребителей** на страницах → не продвигать UI до склада.
- Tree: **нет** в kit — только custom `categories.page`.

---

## 2. Visual sameness rules

Один язык для всех variants:

| # | Правило |
|---|---------|
| 1 | Hairline borders, `bg-paper`, `text-sm`, `tabular-nums` для чисел — токены Paper & Ink. |
| 2 | Header row: muted label, sortable click → asc/desc/null; без Material/Prime. |
| 3 | Row hover / selected / expanded — одни и те же token-классы kit (не page-local hex). |
| 4 | Empty / loading skeleton — через kit (`emptyMessage` / skeleton), не самодельные `<tr>`. |
| 5 | Row actions — слот kit (`rowActions`), визуал `pi-row-actions` / те же иконки. |
| 6 | Focus: `pi-focus-ring` на интерактивах внутри ячеек. |
| 7 | Tree variant **выглядит** как та же таблица/список (отступы уровней), не «другой виджет». |
| 8 | Dense — только spacing scale; цвета/бордеры/типографика не меняются. |

**Запрещено:** page-specific table chrome (свои thead стили, свои hover), `mat-table` / `cdk-tree` как замена kit, raw `<table>` для реестров после миграции.

---

## 3. «Правка kit → везде»

```
┌─────────────────────────────────────────┐
│  app-pi-table (kit chrome)              │
│  sort · borders · skeleton · selection  │
│  expand slot · sticky · a11y            │
└─────────────────────────────────────────┘
          ▲ страница передаёт только:
          │  variant (+ capability flags)
          │  columns / templates
          │  data + pagination binding
```

- **Kit** владеет визуалом и поведением chrome.
- **Страница** выбирает variant + capabilities + колонки + data.
- Group Chip Workspace **body** = одна из table variants (слои не пересекаются: chips/tools ≠ table chrome). См. §5.

---

## 4. as-is → to-be (аудит READ ONLY, 2026-08-04)

### 4.1 Уже на `app-pi-table` → **Flat** (или Expandable где отмечено)

| Страница | Route / зона | to-be |
|----------|--------------|-------|
| materials | `/materials` | Flat |
| products | `/products` | **Expandable** (уже) |
| modules | `/modules` | Flat (expand — опц. позже) |
| organizations | `/organizations` | Flat |
| orders | `/orders` | Flat |
| contracts | `/contracts` | Flat |
| proposals | commercial | Flat |
| work-types | `/work-types` | Flat |
| people | `/people` | Flat |
| units | `/dictionaries/units` | Flat |
| measurements-group | `/dictionaries/measurements` | Flat (в body Group Workspace) |
| color-references | `/dictionaries/color-references` | Flat |
| document-template-categories | `/doc-template-categories` | Flat |
| stock-movements | inventory | Flat |
| users-admin / roles-admin | admin | Flat |
| entity-list (DSL) | shared | Flat |

**Итого реестров на kit:** 16 page-level + DSL `entity-list` (пилот измерений уже на kit).

### 4.2 Raw `<table>` реестры → **Flat** (child **305**)

| Страница | Зона |
|----------|------|
| texts | doc-constructor |
| templates | doc-constructor |
| tables | doc-constructor |
| documents | doc-constructor |
| forms | `/forms` |
| inventory-dashboard | dashboard widgets |
| text-block-categories | dictionaries |

### 4.3 Custom tree → **Tree** (child **302**)

| Страница | As-is | to-be |
|----------|-------|-------|
| categories | CDK drag-drop list (не kit) | Tree variant; `dragReorder` capability |

### 4.4 Вне scope реестров (не путать с catalog migration)

- Detail nested tables: `product-detail`, `module-detail`.
- Dialogs / builder canvas: cost-calculation dialog, table-template-dialog, `block-renderer`.
- Playground theme-editor.

### 4.5 Не найдено в app

- `mat-table` / Angular Material table — **0**.
- `cdk-tree` — **0** (категории = DropList/Drag, не CdkTree).

---

## 5. Связь с Group Chip Workspace

| Слой | Владелец | Ответственность |
|------|----------|-----------------|
| Group chips + sticky tools | `PiGroupWorkspace` | навигация соседей, фильтры/CTA |
| Body | **table kit variant** | список / дерево / expand |

Слои **не пересекаются**: workspace не рисует thead; table не рисует chips.  
Пилот DICT-308 уже кладёт Flat (`app-pi-table`) в body — ок до Tree/Selectable.

---

## 6. Child-TZ предложение (только нумерация, без кода)

| ID | Содержание | Приоритет |
|----|------------|-----------|
| **TZ-UI-TABLE-302** | Tree variant в kit + миграция `categories` (drag = flag) | высокий (единственный non-kit список) |
| **TZ-UI-TABLE-303** | Expandable polish (API/UX паритет products → переиспользование) | средний |
| **TZ-UI-TABLE-304** | Selectable + dense для склада (когда PO/склад попросит) | backlog |
| **TZ-UI-TABLE-305** | Raw-каталоги §4.2 → Flat | высокий (визуальный долг) |
| **Card grid (body mode)** | Не отдельный table primitive: `PiShowcaseCard` grid в tools toggle (продукция). Фото в Flat — cell template + `PiEmptyTile`. | каталог 2026-08-05 |

Подробные TZ пишет Cursor Mode A по старту PO; этот файл — только карта.

---

## 7. Acceptance (для этой docs-TZ)

1. SoT читается без кода; 3+ variants + sameness + «правка kit → везде».  
2. as-is inventory покрывает справочники + materials/products/modules + raw/doc-constructor.  
3. Selectable/dense явно в backlog до склада.  
4. `frontend/src/**` не изменён этой TZ.  
5. Связь с Group Chip Workspace §5 зафиксирована.

---

## 8. Решение (зафиксировано аудитом)

| Тема | Вердикт |
|------|---------|
| База kit | расширять `app-pi-table`, не плодить второй table |
| Tree | отдельный variant / capability, не вечный custom categories |
| Selectable | API есть, UI-потребителей 0 → backlog 304 |
| Raw реестры | мигрировать на Flat (305), не «улучшать» локальный HTML |
| Workspace body | только table variants |

---

*SoT table kit. Child-TZ 302+ не стартуют код без явного старта PO.*
