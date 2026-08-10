═══════════════════════════════════════════════════════════════
TZ-PRODUCTS-307: Products list hierarchy quick-preview
═══════════════════════════════════════════════════════════════

> Domain preflight: Counterparty ≠ Organization (N/A — catalog UI only).
> Проверено: frontend/src/app/pages/products/products.page.ts (#expandedTpl);
> ProductModulesService.getProductTree / getModuleTree; composition-tree.component.ts
> (kind badges, nest); docs/pages/products.page.md § Expandable; PO: nested
> module-in-module expand later, list preview must feel structured.

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: Нет (gold-tray / badge / 3-col grid уже на main в products.page —
  flat modulesOf). Это successor для иерархии.

LAYER: 3

PAGES: /products
PAGE_DOCS: products.page.md

CONFLICT KEYS: frontend/src/app/pages/products/products.page.ts; frontend/src/app/pages/products/products.page.spec.ts; docs/pages/products.page.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. `/products` — клик по строке разворачивает `#expandedTpl`: gold-soft tray,
   сетка карточек **только прямых модулей** (`modulesOf` из composition /
   productModuleIds + moduleCatalog). Клик по карточке → `/modules/:id`.

2. Проблемы:
   - Нет дерева: module внутри module / materials / product-lines не видны.
   - Нет layout «слева модуль — справа зависимые».
   - Повторный expand вложенного модуля в списке не реализован.

3. Контекст:
   - API уже есть: `GET /products/:id/tree`, `GET /modules/:id/tree`
     (`ProductModulesService.getProductTree` / `getModuleTree`).
   - Полный editor состава — `CompositionTreeComponent` на detail; **не**
     копипастить весь BomPanel в список. Нужен **read-only compact preview**.
   - PO: nested expand «позже проверю» — в этой TZ сделать depth≤2 (product→
     module→children), без бесконечной рекурсии в таблице.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Lazy tree на expand

  Под-шаг 1.1: При `onRowClick` → expand: если tree для productId ещё не
    закэширован — `getProductTree(id, maxDepth=2)` (или эквивалент).
    Пока loading — компактный placeholder в tray; error — одна строка + toast
    не спамить.
  Под-шаг 1.2: Кэш `Map<productId, CompositionTreeNode>` в signal; invalidate
    не требуется в этой TZ (reload list = clear cache ok).

ШАГ 2: Layout иерархии в `#expandedTpl`

  Под-шаг 2.1: Для каждого child kind=`module` (depth 1): строка-блок
    `grid` / flex: **слева** карточка модуля (badge «мод», name line-clamp-2,
    article), **справа** компактный список прямых children (module / material /
    product) с kind badge (`мод`/`мат`/`изд` как в composition-tree kindShort)
    и line-clamp-2. Материалы — без перехода или link на `/materials/:id` если
    route есть; модули — link `/modules/:id`; изделия — `/products/:id`.
  Под-шаг 2.2: Сохранить gold-soft tray + border-l-gold; не превращать в
    второй BomPanel (нет add/edit/delete в preview).
  Под-шаг 2.3: Если у модуля children.length>0 и depth позволяет — клик по
    шеврону/строке модуля **в preview** (не уводя с списка) toggles локальный
    expand depth-2; иначе только navigate по явной ссылке/иконке «открыть».

ШАГ 3: Specs + docs

  Под-шаг 3.1: `products.page.spec.ts` — mock getProductTree; assert hierarchy
    layout data-test hooks (`expanded-tree`, `preview-module-*`,
    `preview-child-*`).
  Под-шаг 3.2: Обновить `docs/pages/products.page.md` § Expandable.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/products/products.page.ts
- frontend/src/app/pages/products/products.page.spec.ts
- docs/pages/products.page.md
- docs/pages/PAGE-TZ-INDEX.md (строка /products — отметить 307 DONE при closeout)

НЕ ИЗМЕНЯТЬ:
- composition-tree.component.ts / product-bom-panel (reuse patterns only)
- backend/**
- desktop/**, supply/**, orders/**
- чужие TZ в _active/

known_limitation:
- Depth >2 и full containment outlines composition-tree — только на detail.
- Не строить editable BOM в списке.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Expand строки с модулями, у которых есть children в tree: видно слева модуль,
   справа ≥1 child с kind badge; длинные имена не раздувают карточку
   горизонтально (line-clamp-2 / break).
2. Expand без лишних GET на каждый повторный toggle той же строки (cache hit).
3. Клик по ссылке модуля ведёт на `/modules/:id`; row-actions по-прежнему не
   раскрывают строку.
4. Tray остаётся gold-soft (не серый paper-2).
5. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
6. `cd frontend && pnpm test -- --testPathPattern=products.page.spec --no-coverage`
7. Manual: /products → клик строку с DEMO modules → иерархия читаема light+dark.

═══════════════════════════════════════════════════════════════
КОНФЛИКТ-ЧЕК-ЛИСТ
═══════════════════════════════════════════════════════════════

Параллель с Desktop TZD / Shop-north-B OK (другие CONFLICT KEYS).
Не стартовать параллельно с другим TZ на products.page.ts.

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

По GEMINI.md / kppdf-executor: progress + archive tasks/_archive/2026-08/
TZ-PRODUCTS-307.done.md + commit/push своей зоны. Не трогать peer WIP.
