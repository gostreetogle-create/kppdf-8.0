# TZ-NX-HUB-02-orders: expand affordance + dense list + icon card — `/orders`

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-HUB-01-counterparties` DONE (sequential kppdf-web)  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/orders`  
**PAGE_DOCS:** `orders.page.md`  

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/orders/orders-list.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/orders/orders-list.page.spec.ts` ;  
`docs/pages/orders.page.md` ;  
`docs/agent-checklists/WAVE-NX-HUB-TABLE-PARITY.md` ;  
`docs/agent-checklists/HUB-TABLE-CONTINUOUS-CHECKLIST.md`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

### Preflight Check Output
- **Context read:** hub-table canon; `orders-list.page.ts` (expand already + `OrderHubTray`); registries chevron pattern
- **Key Constraints:** Hub tray **логику не ломать** — только list chrome + affordance + icon «Карточка». Не трогать Гант.
- **Planned Deliverable:** видимый expand + плотность + icon link
- **Validation Path:** orders-list specs + nx build last

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Expand + `OrderHubTray` уже есть — PO это видит.
2. FAIL канона: **H1** нет chevron; **H3** широкая «Карточка»; **H4** слабая читаемость списка («белое полотно»).
3. Не трогать содержимое tray (кроме явного visual bug на пути).

## ЧТО ДЕЛАТЬ

1. Колонка ▸/▾ слева (или перед номером): отражает `expandedId === row._id`.
2. Row: `hover:bg-paper-2`; expanded row — лёгкий `bg-paper-2` / left accent (Paper & Ink token, не invent color).
3. Заменить текстовую «Карточка» на `pi-icon-btn pi-icon-btn-doc` (или эквивалент) с `aria-label="Открыть карточку"`; сохранить `routerLink` + `stopPropagation` (native `<a>` ok — ButtonComponent не форвардит routerLink).
4. Header/row denser (`py-2` rows ok); сохранить все колонки и readiness.
5. Specs: chevron/aria-expanded; icon link не тоглает expand; существующие hub specs зелёные.
6. page.md NX note; WAVE 02; checklist DONE+SHA.

## НЕ ИЗМЕНЯТЬ

- `order-hub-tray.component.ts` бизнес-логика / write-paths (confirm/ship)
- BE, `/production`, create/detail pages (кроме link target)

## КРИТЕРИИ ПРИЁМКИ

1. С первого взгляда ясно: строки — раскрываемый список.
2. Нет текстовой кнопки «Карточка» — icon + aria-label.
3. Hub tray по клику работает как до FIX.
4. Gates:

```text
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=orders-list
cd frontend-nx && pnpm exec nx build kppdf-web
```

## BUILD INTEGRITY

Baseline + last `nx build kppdf-web`. Sequential only.

## Archive

`tasks/_archive/2026-09/` + Executor report SHA.
