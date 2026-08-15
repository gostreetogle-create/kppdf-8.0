# Production Gantt Studio — Chrome Spec

**Статус:** FROZEN · TZ-UX-323 — tools in app chrome; no local 48px rails  
**Route:** `/production`  
**Sibling:** `/work-types`  
**Source:** `docs/audits/2026-08-15-production-studio-plan-review.md`  
**Wave (studio chrome):** `tasks/_backlog/WAVE-PRODUCTION-STUDIO-CHROME.md`  
**Wave (chrome tools):** `tasks/_backlog/WAVE-UX-CHROME-GANTT-TOOLS.md`  
**Wave (gantt tree):** `tasks/_backlog/WAVE-PRODUCTION-GANTT-TREE.md`  
**Master checklist:** `docs/agent-checklists/WAVE-UX-CHROME-GANTT-TOOLS.md`  
**Current implementation:** Gantt tools projected into app-chrome-rail (TZ-UX-322/323); local `production-studio-rail` removed. Default Gantt = **order summary bars** with ▸ expand to work-type composition (TZ-PRODUCTION-314).

## 0. Product boundary

`/production` is a **plan-estimate studio**. It calculates a calendar estimate from the existing `WorkType.days` path and is not the fact-production register.

This spec does not authorize:

- drag-reschedule, check-in, assignment writes or auto-chain;
- `ProductionSchedule`, `ProductionOrder`, `OrderTask` or a new production SoT;
- a new backend endpoint or estimate formula;
- order-level days writes (future separate wave);
- changing `WorkType.days`, `ProductionReadFacade`, `ProductionCockpitContext` or `gantt-bar.model`.

## FROZEN — shell contract

```text
app-chrome-rail-left:  ← + page tools (Заказы · Фильтры · Обновить)
main: Gantt full width (no local 48px columns)
app-chrome-rail-right: → + page tools (Карточка · Сегодня · Масштаб)
flyouts: overlay on production-studio-body; center width unchanged
PiGroupWorkspace (Цех: Гант | Виды работ)   ← только section chrome
└─ production-studio-body (relative; overflow:hidden; single column)
   └─ center: Gantt only, flex:1, min-width:0
```

### Frozen rules

1. `PiGroupWorkspace` отвечает только за section chrome: TOC/chips/tools/body. Он не знает rails, Gantt, inspector или production state.
2. Page tools живут в **app chrome rails** (`PiChromeToolsService`, TZ-UX-322/323). Локальные `production-studio-rail` 48px **запрещены**.
3. Нельзя одновременно открывать левый и правый flyout. Один active flyout за раз.
4. `Сброс фильтров` находится внутри flyout `Фильтры`, а не отдельной кнопкой rail.
5. Flyout — absolute overlay; открытие/закрытие не меняет ширину центрального Ганта.
6. В закрытом состоянии центр получает всю ширину main (между глобальными chrome-rail окна).
7. Текстовый toolbar над Гантом не возвращается. Действия живут в chrome tools / flyout.
8. На узких экранах chrome-rail скрыты (<1680); flyout overlay/fallback допустим, но нельзя вернуть локальные 48px колонки рядом с Гантом.
9. Факт цеха остаётся out of readiness claim.

## 1. Section chrome

`PiGroupWorkspace` должен показывать единый раздел:

- TOC/section: **Цех**;
- sibling chips: **Гант** и **Виды работ**;
- пустой tools-slot не рисует ghost toolbar.

`/work-types` — справочник и рабочая страница раздела **Цех**, не «Каталог». Его таблица и CRUD не меняются этой wave; меняется только IA-документация и будущая визуальная parity.

## 2. Studio zones

| Zone | Default | Role | Source of behavior |
|---|---|---|---|
| App chrome left | ≥1680 | ← + Заказы · Фильтры · Обновить | `PiChromeToolsService` + existing orders/filters/refresh |
| Center | always visible | Gantt timeline only | existing bars/facade |
| App chrome right | ≥1680 | → + Карточка · Сегодня · Масштаб | chrome tools + inspector / today / zoom |
| Flyout | closed | overlay for one selected tool | local shell state only |

### Flyout semantics

- `Заказы`: только список заказов, поиск по заказам, выбор заказа и `Все активные`/select-all.
- `Фильтры`: только `active-only`, приоритет, даты и `Сброс фильтров`.
- `Обновить`: preserves existing reload behavior; no new persistence.
- `Карточка`: existing selected-order inspector; closing it does not clear selected order.
- `Сегодня`: existing range adjustment/scroll-to-today behavior; no calendar model.
- `Масштаб`: День, Неделя, Весь горизонт; existing zoom/fit behavior only.

## 3. UI ↔ code dictionary

| UI label | Existing owner / meaning |
|---|---|
| Заказы | `OrdersRailComponent`, `selectedOrderId`, `search` (поиск по заказам) |
| Фильтры | `activeOnly` / `priorityFilter` / `dateFrom`/`dateTo`, `resetFilters()` |
| Обновить | existing `ProductionCockpitPage.onRefresh()` |
| Карточка | `OrderInspectorComponent`, selected order; read-only rules unchanged |
| Сегодня | existing `onToday()` / future viewport scroll only if separately approved |
| Масштаб | `ctx.zoom`, existing day/week/fit actions |
| `/production?orderId=` | existing initial selection contract |
| unknown `orderId` | existing RU hint + safe fallback to active orders |

## 4. Desktop geometry

### Target at `min-width: 1680px` (chrome rails visible)

```text
┌────┬──────────────────────────────────────────────────┬────┐
│ ←  │ PiGroupWorkspace: Цех · Гант · Виды работ         │ →  │
│ +  │┌────────────────────────────────────────────────┐│ +  │
│ tools││              Gantt full width (main)          ││tools│
│    │└────────────────────────────────────────────────┘│    │
└────┴──────────────────────────────────────────────────┴────┘
```

- studio body: `position: relative; overflow: hidden; min-height: 0`; **single column** (no local 48px);
- center: `flex: 1; min-width: 0; min-height: 0`;
- page tools: app-chrome-rail via `PiChromeToolsService` (`chrome-tool-{id}`);
- flyouts: absolute overlay anchored `left:0` / `right:0` of studio body;
- center Gantt keeps its own intentional horizontal timeline scrolling, not page-level double scroll.

## 5. Responsive contract

- Desktop `>=1680px`: app chrome rails + page tools visible; Gantt full main width.
- Below `1680px`: chrome rails hidden; flyout may use available overlay width; **do not** resurrect local 48px columns.
- The page must not clip the header, hide the active tool, or create a second vertical page scroll.
- Any mobile-specific replacement is a future explicit design decision; do not invent a third production layout.

## 6. Mapping v1 — old controls to new chrome

| Current control | New location | Keep behavior |
|---|---|---|
| `☰ заказы` / `« список` and persistent orders rail | Left → Заказы | open/close list; select order; selection semantics unchanged |
| search | Left → Заказы | поиск по заказам; тот же context search |
| active-only / priority / dates | Left → Фильтры | те же context signals |
| `Обновить` | Left → Обновить | same reload/read behavior |
| `Сброс фильтров` | Left → Фильтры | calls existing reset; no separate rail button |
| right inspector | Right → Карточка | same selected order and read-only policy |
| `Сегодня` | Right → Сегодня | same range behavior; no new calendar SoT |
| `День` / `Неделя` | Right → Масштаб | same zoom signal |
| `Весь горизонт` | Right → Масштаб | same fit behavior |
| group chips | `PiGroupWorkspace` section chrome | same `/production` ↔ `/work-types` navigation |

## 7. Accessibility contract

- Every rail button has a Russian `aria-label`, `title`, `aria-expanded` and `aria-controls` when it owns a flyout.
- Buttons support mouse, Enter and Space.
- Only the active flyout is in the accessibility tree; closed flyouts are not tabbable.
- On open, focus moves to the flyout heading or first meaningful control.
- On Escape/backdrop close, focus returns to the opener.
- Focus-visible is present in light and dark themes.
- A selected order, active filter and zoom state are not conveyed by color alone.
- Existing listbox/tree/Gantt semantics remain valid; this shell does not redefine them.

### Tree (TZ-PRODUCTION-314)

- Default: one **summary** bar per order (span = min child start … max child end).
- ▸ / Expand on the label row reveals work-type child bars; collapse hides them.
- `ProductionCockpitContext.expandedOrderIds` is session-scoped (F5 reset OK).
- Summary body-drag = plannedDate; child right-resize = estimate-days; child body-drag = start offset (316, parallel OK).

## 8. Geometry gate

A browser smoke at **1920px**, both light and dark, must use `getBoundingClientRect()` and verify:

1. left and right rails are inside the production studio body;
2. rail width is 48px (within the documented pixel tolerance);
3. center width is unchanged before/after opening each flyout;
4. flyout overlays the center and does not create a docked `w-56` or `20rem` column;
5. no old text toolbar remains above the timeline;
6. no page-level double scroll or clipped flyout exists.

DOM presence alone is not a pass.

## 9. Behavior-preservation gate

The following must remain 1:1 through B/C:

- order selection and select-all;
- search, active-only, priority, date filters and reset;
- Day/Week/fit and Today behavior;
- refresh and error/loading states;
- `/production?orderId=<sales Order._id>` selection;
- unknown `orderId` RU hint and safe fallback;
- inspector read-only behavior for shipped/delivered/cancelled;
- existing estimate bars and warnings.

## 10. Explicit out of wave

- Waves 304–307: stuck/check-in/auto-chain plug-ins;
- Wave 309 writes: capability and order-level days;
- drag/resize/reschedule;
- weekend shading without a production calendar SoT;
- shared `StudioRail` primitive;
- new BE summary/estimate API;
- any change to estimate math or WorkType model.

Parked 308–310 are blocked by the new studio wave and must not be launched on top of the old docked layout. 309 remains a separate future write wave.

## 11. Success

Wave A success means the **contract** is reviewable and consistent, not that product code is migrated.

After B/C/D implementation, PO success target is **98–99/100 for estimate-only studio chrome**:

- Gantt is the visual center;
- rails and flyouts are predictable and do not steal center width;
- `/production` and `/work-types` read as one Цех section;
- light/dark, keyboard and empty/error states are trustworthy;
- factual production remains explicitly out of scope.
