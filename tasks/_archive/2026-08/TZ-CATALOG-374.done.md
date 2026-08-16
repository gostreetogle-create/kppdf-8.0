# TZ-CATALOG-374.done — Modules list expandable composition

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16
closed_by: cursor-composer (TZ-CATALOG-374 frontend executor)
TZ: TZ-CATALOG-374
WAVE: catalog list parity (successor of CATALOG-372)
DEP: TZ-CATALOG-372 DONE; products expand эталон
Cursor_verdict: PASS

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (modules.page 24/24)
  - lint: N/A (focused tsc + jest; owned files)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

COMMIT: _(filled after commit)_

## Outcome

- `/modules` list: row-click toggles expand tray состава (не navigate).
- Tray: gold-soft / `border-l-gold`; секция «Состав» + «Открыть карточку»; empty/loading/error RU.
- Lazy `getModuleTree` / `ensureModuleTree`; children → `/materials/:id` / `/modules/:id`.
- `expandedSection: 'composition'` — задел successor без пустых вкладок.
- Detail через имя-ссылку / «Открыть карточку»; row-actions не триггерят expand.
- Grid: без expand (клик карточки → detail), known_limitation.

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `frontend` jest `--testPathPattern="modules.page"`: PASS 24/24
- Cursor architect Verdict: PASS
- deploy: NOT RUN

## Files

- `frontend/src/app/pages/modules/modules.page.ts`
- `frontend/src/app/pages/modules/modules.page.spec.ts`
- `docs/pages/modules.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-CATALOG-374.md`
- `docs/agent-checklists/_NOW.md`
- `progress.md`
- `.mimocode/locks/TZ-CATALOG-374-modules-list-expand.lock`

## known_limitation

- Chrome filters-rail migrate → TZ-UX-327.
- Доп. секции tray (фото/себест. preview) — successor по PO.
- Grid expand — list-only (как products).

---

# Original TZ body

# TZ-CATALOG-374: Модули — expandable строка со составом (как Продукция)

> PO: на `/modules` клик по строке должен раскрывать **внизу** блок состава
> (как на `/products`), с местом под будущее меню «Состав + доп. инфо».
> CATALOG-372 явно оставил это successor’ом (`known_limitation: expandable состав`).

РОЛЬ АГЕНТА: Frontend

ЗАВИСИМОСТИ: TZ-CATALOG-372 DONE; эталон UX — products expand (PRODUCTS-304/307 + list)

LAYER: 3 (`modules.page.ts` — один агент)

CONFLICT KEYS: `frontend/src/app/pages/modules/modules.page.ts` ; `frontend/src/app/pages/modules/modules.page.spec.ts` ; `docs/pages/modules.page.md`

PAGES: `/modules`  
PAGE_DOCS: `docs/pages/modules.page.md`

CHECKLIST: `docs/agent-checklists/TZ-CATALOG-374.md`  
REVIEW: required

---

## Domain preflight

| Говорят | Канон |
|---------|--------|
| Модуль | **ProductModule** (`/api/modules`) |
| Состав модуля | material (+ nested) lines; tree: `GET /api/modules/:id/tree` via `ProductModulesService.getModuleTree` |
| Продукция (эталон) | `products.page.ts`: `expandedId` + `expandedTpl` + `ensureProductTree` / `getProductTree` |

Проверено:

- Сейчас `onRowClick` → `router.navigate(['/modules', id])` (`modules.page.ts` ~822–824) — **нет** expand.
- Нет `[expandedRow]` / `expandedTpl` на `app-pi-table`.
- API tree уже есть: `getModuleTree` (~264–272 в `pi-product-modules.service.ts`).
- CATALOG-372: «Row-click → detail»; expandable — successor.
- Имя-ссылка уже `stopPropagation` → detail — сохранить.

Loose wording PO «меню внизу» → **expandable row tray** под строкой (pi-table expandedRow), секции/chips внутри; не bottom sheet / не новая страница.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Клик по строке уводит на карточку — нельзя быстро глянуть состав в списке.
2. На Продукции уже: toggle expand, gold-soft tray, дерево/карточки, empty state, row-actions не триггерят expand.
3. Нужен паритет поведения + **задел** на доп. секции (не реализовывать выдуманный контент).

---

## ЧТО ДЕЛАТЬ

### 1. Expand вместо navigate на row-click

1. `expandedId = signal<string | null>(null)`.
2. `onRowClick`: toggle expand (как products); при открытии — lazy `ensureModuleTree(id)`.
3. Подключить `app-pi-table`: `[expandedRow]`, `[expandedRowWhen]`, `[expandedRowLabel]` (RU: «Состав модуля: {name}»).
4. **Не** navigate на row-click. Detail остаётся через:
   - ссылку в колонке «Название» (`open-row-link`, stopPropagation),
   - опционально кнопку «Открыть карточку» в tray (желательно, одна строка).
5. `pi-row-actions` edit/delete — не открывают/не закрывают expand (stopPropagation уже в pi-table).

### 2. Tray UI (паритет products + слоты на будущее)

В `#expandedTpl`:

1. Визуал как у products: `border-l-gold` + `bg-[var(--color-gold-soft)]` (или актуальный UX-319 ink-frame паттерн списка, если products уже на нём — **скопировать живой products**, не устаревший док).
2. **Секции (chips / tabs)** внутри tray, `data-test="module-expand-sections"`:
   - **«Состав»** — активна по умолчанию (единственная с контентом в этой TZ).
   - Заготовка 1–2 disabled или скрытых слота **не нужна**, если выглядит как мёртвый UI. Вместо этого: структура кода `expandedSection: 'composition' | …` + комментарий/TODO successor; в UI сейчас один заголовок «Состав» + контент. Если chips выглядят естественно с одной активной «Состав» — ок; не добавлять пустые «Скоро».
3. Контент «Состав»:
   - loading / error RU;
   - empty: «В составе нет материалов.» (+ hint открыть карточку);
   - дерево/список детей из `getModuleTree` (materials / nested modules по `CompositionTreeNode`), клики по детям → `routerLink` на `/materials/:id` или `/modules/:id` с stopPropagation где нужно;
   - не полный BomPanel editor в списке (read-only preview) — редактирование состава остаётся на detail / FullEditor.
4. Grid view: либо тот же expand не применять (list-only, как часто у products), либо карточка раскрывает тот же tray — **минимум list**; grid: known_limitation или клик по карточке = detail (текущее), если products grid тоже без expand.

Проверить products: если grid без expand — modules grid не обязан expand в этой TZ.

### 3. Тесты

`modules.page.spec.ts`:

- row click opens expanded content (`expanded-content` / module expand test id);
- second click closes;
- switch row switches expand;
- name link still navigates / has href to detail;
- edit/delete не оставляют stray expand bugs;
- empty composition message;
- tree load success path (mock `getModuleTree`).

Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="modules.page" --coverage=false
```

### 4. Docs

Обновить `modules.page.md`: row-click = expand состава; detail через имя; ссылка на CATALOG-374.  
PAGE-TZ-INDEX строка `/modules`.

---

## ИЗМЕНЯТЬ

- CONFLICT KEYS + checklist + PAGE-TZ-INDEX

## НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ

- `filters-rail` → chrome (это **TZ-UX-327**, отдельная волна) — не смешивать  
- Backend tree API / schema  
- BomPanel write в списке  
- Materials list expand (отдельный successor при PO)  
- Deploy / wipe  
- product-form / UX-332 / desktop  

---

## КРИТЕРИИ ПРИЁМКИ

- [x] Клик по строке модуля в list раскрывает tray под строкой со составом (не уводит сразу на detail)
- [x] Повторный клик сворачивает; клик по другой строке переключает
- [x] Ссылка в «Название» / «Открыть карточку» ведёт на `/modules/:id`
- [x] Empty / loading / error — русские, понятные
- [x] Визуально узнаваемый паритет с expand Продукции
- [x] Код готов к второй секции tray без перелома (signal/section), без фейковых пустых вкладок
- [x] Gates PASS; archive после Cursor PASS

---

## known_limitation

- Chrome filters-rail migrate → TZ-UX-327.  
- Доп. секции tray (фото/себест. preview batch) — successor по PO.  
- Grid expand — только если products уже так; иначе list-only.

---

## Финализация

`GEMINI.md` → `tasks/_archive/2026-08/TZ-CATALOG-374.done.md` + lock. Deploy нет.
