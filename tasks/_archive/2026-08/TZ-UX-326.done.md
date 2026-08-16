# TZ-UX-326: `/products` — фильтр в app-chrome-rail (убрать локальный w-12)

> PO: воронка фильтра на Продукции всё ещё в локальной вертикальной полоске у таблицы;
> просил вынести туда, где ←→ (app-chrome-rail). Место уже создано (TZ-UX-321/322);
> волна `WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE` была в backlog **без** executable TZ — делаем #1.
> Эталон: `/production` (TZ-UX-323).

РОЛЬ АГЕНТА: Frontend

ЗАВИСИМОСТИ: TZ-UX-322 DONE; TZ-UX-323 DONE; TZ-UX-325 audit DONE

LAYER: 3 (`products.page.ts` — один агент)

CONFLICT KEYS: `frontend/src/app/pages/products/products.page.ts` ; `frontend/src/app/pages/products/products.page.spec.ts` ; `docs/pages/products.page.md`

PAGES: `/products`  
PAGE_DOCS: `docs/pages/products.page.md`

CHECKLIST: `docs/agent-checklists/TZ-UX-326.md`  
REVIEW: required  
WAVE: `tasks/_backlog/WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE.md` (#1)

---

## Domain preflight

Проверено:

- Аудит: `docs/audits/2026-08-15-chrome-page-tools-migration-audit.md` — P0 `/products`: снять `filters-rail` `w-12`; L=Фильтры; R=Вид+Обновить.
- Канон: `docs/pages/page-chrome.md` § Page tools; API `PiChromeToolsService.setTools(owner, items)` + `clear` on destroy.
- Живой код: `products.page.ts` ~253–270 — `aside.w-12` + `data-test="filters-rail"` + toggle; панель `filters-rail-panel` absolute.
- Эталон consumer: `production-cockpit.page.ts` `syncChromeTools()` (~483–546), `CHROME_OWNER`, effect+untracked, destroy clear.
- Wave draft id совпадает с этим файлом; executable раньше **не** было — не «кто-то недоделал код», а **не стартовали** волну.

НЕ путать с TZ-UX-332 (диалог изделия / undefined id) — другие keys.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Локальная колонка `w-12` ест ширину витрины (антипаттерн PO).
2. Иконка фильтра живёт в `filters-rail-toggle`, не в chrome-rail под ←.
3. Toolbar сверху уже имеет search, Create, status/active/category selects, view toggle, refresh — после миграции **icon-only** Вид/Обновить уходят в right chrome; дубли в toolbar убрать (search + Create + опционально компактные selects — по аудиту selects могут остаться в toolbar **или** только в flyout; **не** оставлять и воронку-колонку).

---

## ЧТО ДЕЛАТЬ

### 1. Chrome tools (как production)

1. `inject(PiChromeToolsService)`; `ownerId = 'products-page'` (или `'products'`).
2. `setTools` в effect с `untracked` (как cockpit — без infinite loop).
3. **Left:** `filters` — icon Filter/SlidersHorizontal; `aria-label`/`title` «Фильтры»; `active` когда `filtersOpen()` или dirty-фильтры; `onClick` → toggle flyout.
4. **Right:**  
   - `view-list` / `view-grid` (или один toggle с понятным title текущего режима) — переключение list↔grid как сейчас;  
   - `refresh` — текущий reload.
5. `destroyRef.onDestroy` → `chromeTools.clear(ownerId)`.
6. `data-test`: кнопки в chrome уже `chrome-tool-{id}` (сервис); сохранить семантику тестов через новые/обновлённые selectors.

### 2. Убрать локальный `filters-rail` w-12

1. Удалить `<aside class="… w-12" data-test="filters-rail">` и кнопку-toggle внутри.
2. Панель фильтров оставить как **flyout overlay** (absolute / fixed у layout страницы), без колонки-донора: открывается от chrome «Фильтры»; backdrop на контенте закрывает; клики внутри панели не закрывают (как сейчас).
3. Layout витрины: контент на всю ширину между глобальными chrome-rail (нет gap под бывший w-12).
4. На ширине &lt;1680 chrome скрыт каноном — filters всё равно доступны: либо кнопка «Фильтры» в toolbar как fallback **только icon** (не w-12 колонка), либо оставить открытие через существующий toolbar (если selects уже там). **Запрет:** возвращать docked `w-12` колонку.

### 3. Toolbar cleanup

- Убрать из горизонтального toolbar дублирующие **icon** list/grid и refresh, если они ушли в right chrome (на ≥1680).
- **Не** трогать: поиск, «+ Создать», счётчик «N продукт».
- Селекты статуса/категории: минимум — остаются в flyout; дубли в верхнем toolbar можно оставить для узких экранов **или** убрать дубль если flyout+fallback достаточен. Не раздувать UI: одно место правды для rail-фильтров = flyout.

### 4. Тесты + docs

- Обновить `products.page.spec.ts`:  
  - нет `filters-rail` / `w-12` колонки;  
  - toggle через chrome tool (mock `PiChromeToolsService` или клик `chrome-tool-filters` если в DOM);  
  - flyout open/close/backdrop;  
  - view/refresh через chrome tools.
- `docs/pages/products.page.md` — chrome L/R; filters-rail удалён.
- WAVE: отметить #1 IN WORK→DONE в closeout.

Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="products.page" --coverage=false
```

---

## ИЗМЕНЯТЬ

- CONFLICT KEYS  
- PAGE-TZ-INDEX строка products  
- checklist  

## НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ

- `/modules`, `/materials` (→ TZ-UX-327/328 после DONE этой)  
- `/production`, КП Create, Builder  
- product-form-dialog / TZ-UX-332 keys  
- Backend, deploy, wipe  
- Primary Create / search в chrome  

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] На широком экране (≥1680): слева в app-chrome-rail под ← есть «Фильтры»; локальной серой полоски `w-12` у таблицы **нет**
- [ ] Клик «Фильтры» открывает ту же панель (статус/активность/категория/сброс); backdrop закрывает
- [ ] Справа в chrome: вид list/grid + Обновить работают
- [ ] Витрина шире на ~48px (нет мёртвой колонки)
- [ ] Specs + tsc PASS; archive после Cursor PASS

---

## known_limitation

- Modules/materials parity — следующие TZ волны.  
- &lt;1680: chrome скрыт — нужен не-колоночный fallback (toolbar icon), без w-12.

---

## Финализация

`GEMINI.md` → `tasks/_archive/2026-08/TZ-UX-326.done.md` + lock. Deploy нет.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16
closed_by: cursor-grok-4.6 (TZ-UX-326 frontend executor)
TZ: TZ-UX-326
WAVE: WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE (#1)
DEP: TZ-UX-322/323/325 DONE
Cursor_verdict: PASS

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (products.page 24/24)
  - lint: N/A (focused tsc + jest; owned files)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

COMMIT: da5bf969c31d3939f376758da0c9ae4bb9888646

## Outcome

- `/products`: `PiChromeToolsService` owner `products-page`. Left «Фильтры»; right вид list/grid + «Обновить»; `clear` on destroy.
- Локальный `aside.w-12` `filters-rail` снят; flyout overlay + backdrop сохранены.
- Toolbar: поиск + «+ Создать» + счётчик. На &lt;1680 icon-fallback без docked 48px.
- Селекты статуса/активности/категории — только в flyout.

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `frontend` jest `--testPathPattern="products.page"`: PASS 24/24
- deploy: NOT RUN (PO: без деплоя)

## Files

- `frontend/src/app/pages/products/products.page.ts`
- `frontend/src/app/pages/products/products.page.spec.ts`
- `docs/pages/products.page.md`
- `docs/agent-checklists/TZ-UX-326.md`

## known_limitation

- Modules/materials parity → TZ-UX-327/328.
- Chrome rails ≥1680; узкий экран — toolbar icon-fallback.
