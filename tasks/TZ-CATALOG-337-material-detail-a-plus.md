═══════════════════════════════════════════════════════════════
TZ-CATALOG-337: Material detail = product A+ shell
═══════════════════════════════════════════════════════════════

STATUS: READY
DEPENDS ON: TZ-UX-FACT-304 DONE (materials/** slot); TZ-CATALOG-336 DONE (эталон A+)
LAYER: 3
CHECKLIST: docs/agent-checklists/TZ-CATALOG-337.md
PAGES: /materials/:id
PAGE_DOCS: material-detail.page.md ; product-detail.page.md ; module-detail.page.md

РОЛЬ АГЕНТА: Frontend Layout Engineer

CONFLICT KEYS:
frontend/src/app/pages/materials/material-detail.page.ts;
frontend/src/app/pages/materials/material-detail.page.spec.ts;
docs/pages/material-detail.page.md;
docs/agent-checklists/TZ-CATALOG-337.md;
docs/pages/PAGE-TZ-INDEX.md;

Проверено: frontend/.../material-detail.page.ts (PiPageHeader + PiSection I–IV);
  product-detail.page.ts (A+ grid sticky aside + BomPanel);
  module-detail.page.ts (CATALOG-336);
  docs/pages/material-detail.page.md; tasks/_archive/2026-08/TZ-CATALOG-336.done.md;
  tasks/_active/TZ-UX-FACT-304.md (passport only — НЕ A+).

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. `/materials/:id` — вертикальная «простыня»: header + Основное / Габариты / Склад /
   Где используется. Нет hero-фото, нет `PiPageChrome`, нет split xl как у изделия.
2. Модули уже = изделие A+ (CATALOG-336). Материал забыт в волне DETAIL/FACT:
   FACT-304 только FactStack passport, явно «не трогать composition» и **не** layout.
3. Материал — лист: BOM/BomPanel не применим. Правая колонка = where-used + склад.

## ЧТО ДЕЛАТЬ

ШАГ 1: Chrome + A+ grid

1. Заменить `PiPageHeader` на `PiPageChrome` crumbs: `Каталог / Материалы / <имя>`.
2. Layout как product: `xl:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]`,
   left sticky `data-test="material-detail-aside"`, right workspace
   `data-test="material-detail-main"`.
3. Убрать eyebrow-секции I–IV как главный UX (можно оставить логику данных).

ШАГ 2: Левая колонка (паспорт)

1. Hero cover 4/3 из photoIds / photos API (паттерн product/module); empty «Нет фото».
2. Имя `font-display text-lg sm:text-xl`; подпись артикул · SKU · тип · единица.
3. FactStack: цена (caption), вес, краткие габариты; остальные поля паспорта без
   дублирования title в header.
4. Аккордеон **Фото** (gallery) / **Цена** (FactCard цены) — визуально как у изделия,
   без CostCalculation / cost-preview API.

ШАГ 3: Правая колонка (не BOM)

1. Блок «Где используется» на всю высоту (таблица + ссылки на product/module) —
   главный контент справа.
2. Ссылка «Остатки на складе» — вторичная, над или под where-used, не отдельная
   простыня на всю страницу.
3. **НЕ** подключать `ProductBomPanel` / composition-tree.

ШАГ 4: Docs + tests

1. Довести `docs/pages/material-detail.page.md` до фактического A+ (если дрейф).
2. Jest: layout markers (`material-detail-layout`, aside, main); chrome crumbs;
   where-used справа; нет BomPanel в template.
3. PAGE-TZ-INDEX: `/materials/:id` → material-detail.page.md + CATALOG-337.

## ИЗМЕНЯТЬ

- `material-detail.page.ts` / `.spec.ts`
- page doc + checklist + PAGE-TZ-INDEX (keys выше)

## НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ

- `ProductBomPanel`, composition-tree, product/module detail (уже эталон)
- backend schema/API where-used (reuse existing)
- material form dialog / materials list (кроме обязательных shared helpers если уже есть)
- desktop / supply / FACT-304 если ещё IN WORK → DEFER
- deploy

## КРИТЕРИИ ПРИЁМКИ

1. `/materials/:id` визуально читается как sibling `/products/:id` и `/modules/:id`:
   chrome crumbs + sticky left (hero+passport+accordion) + right workspace.
2. Where-used и склад на **правой** колонке; нет секций I–IV как главного каркаса.
3. Нет `ProductBomPanel` / `app-composition-tree` в material-detail template.
4. FACT-304 FactStack/captions сохранены (не откат к `dl`).
5. Gates:
   ```text
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- material-detail
   ```
6. Checklist DONE; archive `tasks/_archive/2026-08/TZ-CATALOG-337.done.md`;
   progress + lock; **не** deploy без команды PO.

## known_limitation

- Аналоги материалов / substitute graph — out of scope (нет API).
- Нормализация мусорных dimensions в списке — отдельный thin TZ, если ещё не закрыт.
