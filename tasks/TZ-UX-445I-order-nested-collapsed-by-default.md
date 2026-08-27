# TZ-UX-445I: Состав/внутренности заказа — свёрнуты по умолчанию

PAGES: `/desk` ; `/orders` (hub expand) ; order tray composition  
PAGE_DOCS: orders.page.md ; manager-desk (если есть)

РОЛЬ АГЕНТА: Frontend UI Engineer  
ЗАВИСИМОСТИ: TZ-QA-445F DONE (row click ≠ edit)  
LAYER: 3

### Preflight Check Output
- **Context read:** `order-hub-tray.component.ts` ngOnInit (DESK-413); `composition-tree.component.ts` effect auto-expand root; `orders.page.spec.ts` HUB-302/DESK-423; manager-desk.page.spec «413 composition opens by default»
- **Key Constraints:** не ломать lazy-load supply; не возвращать row→catalog navigate; Paper & Ink disclosure
- **Planned Deliverable:** при открытии строки заказа «Состав» и дерево — свёрнуты, пока пользователь не нажмёт
- **Validation Path:** focused jest desk + order-hub-tray + composition-tree + orders.page

CONFLICT KEYS:
`frontend/src/app/shared/orders/order-hub-tray.component.ts`;
`frontend/src/app/shared/orders/order-hub-tray.component.spec.ts`;
`frontend/src/app/shared/ui/composition/composition-tree.component.ts`;
`frontend/src/app/shared/ui/composition/composition-tree.component.spec.ts`;
`frontend/src/app/pages/desk/manager-desk.page.spec.ts`;
`frontend/src/app/pages/orders/orders.page.spec.ts`;
`docs/pages/orders.page.md`

## Domain preflight

- **Проверено:** tray `compositionExpanded` стартует `false`, но в `ngOnInit` при `mode()==='desk'` форсится `true` + `loadComposition()` (DESK-413 «primary surface»).
- **Проверено:** `composition-tree` в `effect` при смене root **автодобавляет root._id в expanded** → первый уровень дерева сразу открыт → «портянка» при глубоком BOM.
- **Loose wording PO:** «открываешь заказ в списке — внутренности раскрыты» → desk/orders hub tray + composition-tree, не supply-quick-order.
- **НЕ:** менять UX supply-quick-order tiles; не трогать Гант; не откатывать 445F pencil-only edit.

## ИСХОДНОЕ

1. Стол менеджера: клик по заказу → tray → блок «Состав заказа» **уже раскрыт**, дерево грузится сразу, корни модулей **уже expanded**.
2. При большом составе список раздувается на весь экран без явного действия пользователя.
3. Секции supply/logistics на hub уже collapsed by default (DESK-423); logistics auto-open только для ready/shipped — **оставить** (операционный сигнал), если не указано иначе.

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Tray: состав не auto-open на desk

В `order-hub-tray.component.ts` `ngOnInit`:

- Убрать / не вызывать `compositionExpanded.set(true)` для `mode()==='desk'`.
- Не вызывать `loadComposition()` до первого `toggleComposition()` (или вызывать load только когда `compositionExpanded` становится true — предпочтительно один путь с hub).
- Обновить комментарий DESK-413 → UX-445I: состав = disclosure, не primary dump.

### ШАГ 2 — Composition tree: без auto-expand root

В `composition-tree.component.ts` constructor `effect`:

- При смене `root` **не** добавлять `root._id` в `expanded` автоматически.
- Сброс `lastRootId` / clear expanded set при смене root — ок; стартовое состояние = всё свёрнуто.
- Клик по узлу по-прежнему expand/collapse + select (445F: edit только pencil).

### ШАГ 3 — Specs + docs

- `manager-desk.page.spec.ts`: убрать ожидание «413 composition opens by default»; assert `order-composition-toggle` `aria-expanded=false` после expand строки; после клика toggle → panel + tree.
- `order-hub-tray.component.spec.ts` / `orders.page.spec.ts`: состав collapsed on open; expand по клику.
- `composition-tree.component.spec.ts`: root не expanded на init; expand по клику показывает nest.
- `orders.page.md`: одна строка канона — nested composition collapsed until user opens disclosure.

## НЕ ИЗМЕНЯТЬ

- `work-types`, supply-quick-order, PDF/templates, desktop MCP
- Логику pencil edit (445F)
- Auto-expand logistics для `ready`/`shipped` (оставить)
- Backend API

## КРИТЕРИИ ПРИЁМКИ

1. Desk: раскрыл заказ в списке → «Состав заказа» **свёрнут**; клик «раскрыть» → панель + дерево.
2. Дерево состава: узлы (включая root) **свёрнуты** до клика; глубокий BOM не разворачивается сам.
3. Hub `/orders` expand row: тот же канон для состава.
4. Focused jest: desk + tray + composition-tree + orders — PASS; FE tsc PASS.
5. Archive + lock; deploy NO.

## Финализация

Root: `tasks/_archive/2026-08/TZ-UX-445I.done.md` + `.mimocode/locks/TZ-UX-445I-order-nested-collapsed.lock` по `GEMINI.md`.
