# Global architecture scan — NX God Components (2026-09-14)

> **Шаг 1 только.** Код и WAVE/TZ не генерируются до утверждения кандидатов PO.  
> Эталон паттерна: Document Studio decomp — `tasks/_ready/2026-09-14-docstudio-editor-decomp/WAVE-MAP.md`  
> (тонкий Smart page в `app` · Signals Facade · dumb UI → `@kppdf/features/.../ui`).  
> Scope: **`frontend-nx/apps/kppdf-web`** (финальный продукт). Legacy `frontend/` — сноска.

### Метод

- Ранжирование по LOC + `inject()` + смешение API/state/DOM в одном файле.
- Порог внимания: **≥ ~400 LOC** smart/semi-smart, или **High** risk при меньшей массе (кросс-домен hub).
- Уже идущая волна Studio **включена для полноты**, но не требует повторного выбора.

---

## Executive summary

| Priority | Кандидаты | Комментарий |
|----------|-----------|-------------|
| **In flight** | `StudioEditorPage` (~3169) | WAVE 1–4 READY |
| **High** | Gantt bars · Production cockpit · Order hub tray · Role matrix dialog · Catalog form dialogs (material/module/product) | Ломают поддержку / кросс-домен / fat forms |
| **Medium** | Supply · SupplyRequests · Proposals list · Shipping · Warehouses · Storage items · Composition panel | Классические list+API+inline UI; dialogs частично уже вынесены |
| **Low** | Stock movements · Forms showcase | Тонкий CRUD / демо DS |
| **Not NX God** | Legacy KP workspace (~800–2100) | Вес в `frontend/`; NX КП = list + Studio, не port workspace God |

**Рекомендуемый порядок утверждения PO (после Studio):**  
1) Production (Gantt bars → cockpit glue) · 2) Order hub tray · 3) Supply cluster (`/supply` + `/supply-requests`) · 4) Warehouse cluster · 5) Proposals list · 6) Admin role matrix · 7) Registry fat forms (опционально, если боль оператора).

---

## Уже в работе

### StudioEditorPage — **IN FLIGHT**

| | |
|--|--|
| **Path** | `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` |
| **Scale** | ~3169 LOC · ~16 `inject` · ~12 `signal` · ~26 `computed` |
| **Symptoms** | God editor: revision queue + ERP/catalog + preview/PDF + chrome в одном классе |
| **Plan** | См. WAVE DocStudio Editor Decomp (Facade → util → UI → features) |
| **Priority** | High (уже взято) |

---

## High priority

### 1. GanttBarsComponent

| | |
|--|--|
| **Path** | `.../pages/production/blocks/gantt-bars.component.ts` |
| **Scale** | ~2539 LOC · ~3 inject (Injector/DestroyRef/ElementRef) · ~3 signal · ~10 computed · огромный inline template |
| **Symptoms** | Не HTTP-God, а **interaction/layout God**: дерево строк, drag/resize, work-detail, worker drafts, geometry — всё в одном компоненте. Любой баг геометрии рискует соседними жестами. |
| **Facade (предв.)** | Timeline geometry · row/tree model · pointer sessions (move/resize) · work-detail/worker drafts · scroll/today · order-meta strip state |
| **Dumb UI** | Left labels column · bar layer/handles · work-detail panel · order-meta strip · unassigned/legend banner |
| **Priority** | **High** |
| **Note** | HTTP пишет родитель (`ProductionCockpitPage` + `ProductionReadFacade` уже есть). Рефакторинг = UI/interaction facade + dumb slices, не дублировать read facade. |

### 2. ProductionCockpitPage

| | |
|--|--|
| **Path** | `.../pages/production/production-cockpit.page.ts` |
| **Scale** | ~910 LOC · ~10 inject · ~6 signal · ~6 computed |
| **Symptoms** | Оркестратор Ганта: caps, optimistic writes, expand state, shell tools, route return — рядом с template. Частичный split уже есть (`OrdersRail`, `GanttBars`, `ProductionReadFacade`, context). |
| **Facade (предв.)** | Усилить/расширить write+selection facade (horizon refresh, expand machine, optimistic commit/restore, worker assign, shell tool wiring callbacks) |
| **Dumb UI** | Error/hint banners · left flyout chrome · range/today toolbar |
| **Priority** | **High** (делать **после или paired** с Gantt bars — иначе двойной переезд) |

### 3. OrderHubTrayComponent

| | |
|--|--|
| **Path** | `.../pages/orders/order-hub-tray.component.ts` |
| **Scale** | ~599 LOC · ~9 inject · ~5 signal |
| **Symptoms** | Мини-ERP hub в tray: composition + supply + reservations + shipments + order API + UI. Кросс-доменные правила в одном файле. |
| **Facade (предв.)** | `OrderHubFacade`: composition load · supply counters · reservations · shipment lifecycle · kit-reserve · ship/cancel |
| **Dumb UI** | Lines/readiness · composition section · supply/reservation counters · shipment card |
| **Priority** | **High** — боль поддержки при любом изменении отгрузки/резерва |

### 4. RoleFormDialogComponent

| | |
|--|--|
| **Path** | `.../pages/role-form-dialog.component.ts` |
| **Scale** | ~925 LOC · permissions catalog inject · крупные template+styles |
| **Symptoms** | Матрица permissions/pages + grouping + submit в одном диалоге. Редкие правки = высокий риск регресса ACL UI. |
| **Facade (предв.)** | Catalog load/group · permission toggles · page toggles · select-all/section · validate/submit |
| **Dumb UI** | Identity fields · permissions matrix · pages matrix · footer |
| **Priority** | **High** (безопасность/роли; не каждый день, но дорого чинить) |

### 5. Registry fat forms (cluster)

| File | LOC | inject | Priority |
|------|-----|--------|----------|
| `registries/dialogs/material-form-dialog.component.ts` | ~735 | ~8–10 | **High** |
| `registries/dialogs/module-form-dialog.component.ts` | ~605 | ~8 | **High** |
| `registries/dialogs/product-form-dialog.component.ts` | ~539 | ~8 | **Medium–High** |

**Symptoms:** create/update + photos + categories/units + composition embed + payload builders в диалоге.  
**Facade:** form model · lookups · photos · submit payload · inline category create.  
**Dumb UI:** sections (basics / dims / photos / notes); composition уже частично вынесен (`CompositionPanel`).  
**Note:** три диалога похожи — один WAVE «registry entity form» с shared form-facade pattern выгоднее трёх изолированных волн.

---

## Medium priority

### 6. SupplyPage (`/supply`)

| | |
|--|--|
| **Path** | `.../pages/supply/supply.page.ts` |
| **Scale** | ~627 LOC · ~8 inject · inline create form + table |
| **Symptoms** | List + explode-from-order + status transitions + **create form inline** (не dialog). Классический page God. |
| **Facade** | List/filter · create · explode · status transitions · order lookup |
| **Dumb UI** | Filter bar · create form · task row/expand · action strip |
| **Priority** | **Medium** (операторский контур снабжения; WAVE-NX-SUPPLY) |

### 7. SupplyRequestsPage

| | |
|--|--|
| **Path** | `.../pages/supply-requests/supply-requests.page.ts` |
| **Scale** | ~475 LOC · ~8 inject |
| **Symptoms** | 4 API lookups + filters + CRUD; диалоги create/receive уже вынесены — страница всё ещё оркестратор. |
| **Facade** | Lookups · filtered list · CRUD/receive/delete |
| **Dumb UI** | Filter panel · request row/expand · status/priority chips |
| **Priority** | **Medium** — логично **парой** с SupplyPage (один pack `features/supply`) |

### 8. ProposalsListPage (`/proposals`)

| | |
|--|--|
| **Path** | `.../pages/proposals/proposals-list.page.ts` |
| **Scale** | ~422 LOC · ~9 inject |
| **Symptoms** | Не workspace-God: list + family expand + attach orgs + studio create/open + convert-to-order. Много write-paths на «списке». |
| **Facade** | Dual list load · family cache · attach orgs · studio bridge · convert |
| **Dumb UI** | Quotation row · family members panel |
| **Priority** | **Medium** |
| **Legacy note** | Настоящий KP God остался в `frontend/` (table-editor ~2k, draft service ~1.6k, workspace page ~830). На NX **не портировать** этот God — КП пишется в Studio. |

### 9. ShippingPage

| | |
|--|--|
| **Path** | `.../pages/shipping/shipping.page.ts` |
| **Scale** | ~454 LOC · ~9 inject |
| **Symptoms** | Lifecycle dispatch/deliver/cancel + list + dialogs; диалоги есть, оркестрация в page. |
| **Facade** | Load/lookups · filters · CRUD dialogs · dispatch/cancel/deliver |
| **Dumb UI** | Filter bar · shipment row/expand · docs snippet |
| **Priority** | **Medium** |

### 10. WarehousesPage · StorageItemsPage

| Page | LOC | inject | Note |
|------|-----|--------|------|
| `warehouse/warehouses.page.ts` | ~358 | ~6 | Expand тянет nested storage items API |
| `warehouse/storage-items.page.ts` | ~422 | ~8 | Put/adjust dialogs уже есть; query/route sync в page |

**Facade:** list/filter/route · CRUD · expand/nested load · put/adjust.  
**Dumb UI:** filter strip · row/expand · nested items list.  
**Priority:** **Medium** — pack `features/warehouse` вместе со Stock movements (Low) как хвост.

### 11. CompositionPanelComponent

| | |
|--|--|
| **Path** | `.../pages/composition/composition-panel.component.ts` |
| **Scale** | ~417 LOC · ~5 inject |
| **Symptoms** | Tree уже split; panel всё ещё dual-kind API + inspector. Живёт внутри registry forms → декомпозиция усиливает High #5. |
| **Facade** | Reload tree/lines · select · qty/unit patch · add/remove |
| **Dumb UI** | Selected-node inspector · toolbar |
| **Priority** | **Medium** (лучше внутри registry-forms WAVE) |

---

## Low priority / не God в смысле паттерна

| Path | LOC | Why Low |
|------|-----|---------|
| `warehouse/stock-movements.page.ts` | ~374 | Тонкий list + form dialog; facade по желанию в warehouse pack |
| `forms/forms.page.ts` | ~621 | Design-system **showcase**, нет domain API — не трогать ради «чистоты» |
| Большинство `*.page.ts` &lt; 300 LOC | — | CRUD list в норме; не планировать WAVE |

---

## Уже хороший задел (не кандидаты на полный rewrite)

| Artifact | Path | Note |
|----------|------|------|
| `ProductionReadFacade` | `pages/production/production-read.facade.ts` | Эталон частичного facade — расширять, не выкидывать |
| `ProductionCockpitContext` | `pages/production/production-cockpit.context.ts` | UI context рядом с page |
| Studio dumb panels | `pages/studio/studio-*-panel|canvas` | Уже Input/Output; ждут переезда в features (Studio WAVE) |
| Dialogs supply/warehouse/shipping | `*-form-dialog.component.ts` | Create/edit уже вынесены — page остаётся orchestration God среднего размера |

---

## Heatmap (NX pages/components ≥ ~400 LOC или High)

```text
LOC   inj  Risk    File
3169  16   HIGH*   studio-editor.page.ts          (*in flight)
2539   3   HIGH    gantt-bars.component.ts
 925   1   HIGH    role-form-dialog.component.ts
 910  10   HIGH    production-cockpit.page.ts
 735   8   HIGH    material-form-dialog.component.ts
 627   8   MED     supply.page.ts
 621   5   LOW     forms.page.ts (showcase)
 605   8   HIGH    module-form-dialog.component.ts
 599   9   HIGH    order-hub-tray.component.ts
 539   8   MED-H   product-form-dialog.component.ts
 475   8   MED     supply-requests.page.ts
 454   9   MED     shipping.page.ts
 422   9   MED     proposals-list.page.ts
 422   8   MED     storage-items.page.ts
 417   5   MED     composition-panel.component.ts
```

---

## Legacy footnote (не брать в NX WAVE без PO)

| File | ~LOC |
|------|------|
| `frontend/.../proposal-create-table-editor.component.ts` | ~2124 |
| `frontend/.../proposal-workspace-draft.service.ts` | ~1610 |
| `frontend/.../proposal-create-inspector.component.ts` | ~1093 |
| `frontend/.../proposal-workspace.page.ts` | ~830 |

Политика: cutover = NX; partial legacy cleanup без команды PO — **не** (см. `PO-SHARED-UNDERSTANDING` §2).

---

## Что дальше (Шаг 2 — только после вашего «берём X»)

Для каждого утверждённого модуля Cursor сгенерирует pack по эталону Studio:

```text
tasks/_ready/YYYY-MM-DD-<module>-decomp/
  WAVE-MAP.md
  TZ-…-FACADE.md
  TZ-…-UTIL-MOVE.md   (если есть pure helpers)
  TZ-…-UI-MOVE.md
  TZ-…-FACADE-TO-FEATURES.md
  PROMPT-CLAUDE-WAVE-…-CONTINUOUS.md
  PARK-… (опционально)
```

Инварианты те же: page/routes/guard в `app`; Facade instance-scoped; Signals; no NgRx; shared app dialogs не ломать без нужды.

---

## PO selection → TZ packs (2026-09-14 Step 2)

Index: `tasks/_ready/2026-09-14-DECOMP-BATCH-README.md`

| Block | Pack |
|-------|------|
| B1 Gantt+Cockpit + Order hub | `tasks/_ready/2026-09-14-decomp-b1-production-orderhub/` |
| B2 Supply + Warehouse | `tasks/_ready/2026-09-14-decomp-b2-supply-warehouse/` |
| B3 Proposals list | `tasks/_ready/2026-09-14-decomp-b3-proposals/` |

Full AFK prompt: `tasks/_ready/PROMPT-CLAUDE-DECOMP-BATCH-B1-B3-CONTINUOUS.md`

Not in batch (still scan High): role-form-dialog, registry fat forms.
