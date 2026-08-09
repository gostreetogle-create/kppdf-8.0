# TZ-SALES-328: Create КП — shop-витрина изделий (карточки + фильтры + edit/create)

PAGES: /proposals/create  
PAGE_DOCS: proposals-create.page.md  
Аудит: `docs/audits/2026-08-09-kp-create-product-vitrine.md`  
Зависит от: **TZ-SALES-326** (ширина+dismiss), **TZ-SALES-327** (md equal-height); после wave-2 323–325 предпочтительно  
SUPERSEDES: WAVE пункт **TZ-SALES-318** cascade (файл TZ не существовал) — фильтр категорий входит сюда как MVP chips/select, не L1/L2 дерево

РОЛЬ АГЕНТА: frontend  
ЗАВИСИМОСТИ: 326 DONE visual; 327 DONE  
LAYER: 3  
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts; frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.spec.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; docs/pages/proposals-create.page.md

Проверено: rail = text list + `list({limit:30,search})` без page UI; `ProductsListParams` уже page/limit/search/categoryId; create/edit в каталоге = QuickCreate + ProductFormDialog; клиент = Counterparty (не трогать); изделие = Product.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. PO: полноценная витрина как в магазине — фото, равные карточки, больше позиций на экран, фильтры, пагинация.
2. Во время сборки КП — **Добавить**, **Редактировать**, **Создать** изделие без ухода со студии.
3. Эталон карточки = `app-pi-showcase-card size="md"` после 327.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Сетка витрины в `proposal-product-rail`**
   - Заменить `<ul>` text-rows на CSS grid **2 колонки** (в широком flyout 326); на очень узком fallback 1 col.
   - Каждая ячейка: `app-pi-showcase-card size="md"`:
     - `title` = name; `description` = sku · цена; `mediaUrl` = thumb (`photoListUrl` / тот же helper что `/products`).
     - Слоты actions: **Добавить** (primary) + **Редактировать** (outline/ghost).
   - Карточки stretch equal-height (рецепт 327).

2. **Фильтры + пагинация**
   - Сохранить search (debounce).
   - Category filter: select/chips по существующему Categories API (как на products page — reuse service, не invent).
   - Pager: `page` + `limit` (напр. 12 = 2×6) + total; кнопки/Pi pager pattern уже в проекте — reuse.
   - Empty/loading RU states.

3. **Create / Edit**
   - Кнопка «Создать изделие» в шапке rail → `QuickCreateDialogComponent` `{ entity: 'product', size: 'M' }` (как products.page).
   - «Редактировать» → `ProductFormDialogComponent` с product (width lg).
   - После successful create/edit → reload текущего page списка; optional auto-add созданного в draftLines **только если** диалог вернул entity (не угадывать).
   - CDK overlay: click-outside студии **не** закрывает из-за диалога (уже exclude `.cdk-overlay-container` в 326).

4. **Add & continue**
   - «Добавить» не закрывает flyout (уже policy 317).
   - Не рисовать bullet list на бланке (325 — отдельный bind).

5. **Tests + docs**
   - Jest: grid renders cards; add emit; filter/page calls list params; edit/create open dialog (mock).
   - `proposals-create.page.md`: витрина md + фильтры + QuickCreate/Edit.
   - WAVE: 318 → superseded by 328.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- FROZEN 317 shell / A4 compress
- BuildDocumentDto / draftLines→sheet (**325**)
- Snapshot 322 / print 320 / deploy
- Глубокое L→R category cascade дерево (достаточно filter)
- Второй Product write-path / ModuleMaterials
- DOC-344

known_limitation: live строки на бланке — 325; полный shop sort UX — later.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Open «Товары»: широкая сетка md-карточек с фото (или placeholder), равная высота в ряду.
2. Search + category + pager меняют список через API params.
3. Добавить → draftLines; Редактировать / Создать открывают существующие диалоги; после save список обновляется.
4. Flyout не закрывается на Add; dismiss вне — поведение 326.
5. Gates:
   ```
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern=proposal-product-rail|proposal-create
   ```
6. Archive после Cursor/PO visual PASS (витрина «как магазин» по стилю сайта).

Финализация: `tasks/_archive/2026-08/TZ-SALES-328.done.md`.
