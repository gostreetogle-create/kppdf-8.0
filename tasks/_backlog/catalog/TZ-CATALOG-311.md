═══════════════════════════════════════════════════════════════
TZ-CATALOG-311: Unified CompositionTree + CompositionEditor
═══════════════════════════════════════════════════════════════

> Полное дерево состава. Стартовать **после** TZ-CATALOG-320 (быстрый gap в диалогах).
> Канон: `tasks/TZ-CATALOG-300.md` §3 depth/cycles, §4 CompositionLine.
> BE: `GET /products|modules/:id/tree` + composition CRUD уже есть (303/305/310 area).

РОЛЬ АГЕНТА: Frontend Component Engineer (Angular 20, shared UI + pages)

ЗАВИСИМОСТИ:
- TZ-CATALOG-317 DONE
- TZ-CATALOG-305 DONE
- **TZ-CATALOG-320 DONE** (типы lineType=product, каскад в диалогах, kind-лейблы)
- TZ-CATALOG-314 DONE (не параллелить archive/composition на тех же owners)
- Рекомендуется 312 DONE (material detail для drill-down), не блокер

LAYER: 3 (shared component + product/module pages)

PAGES: /products/:id ; /modules/:id
PAGE_DOCS: product-detail.page.md ; module-detail.page.md

CONFLICT KEYS:
frontend/src/app/shared/ui/composition/** (new);
frontend/src/app/shared/services/pi-product-modules.service.ts;
frontend/src/app/shared/services/pi-product-modules.service.spec.ts;
frontend/src/app/pages/products/product-detail.page.ts;
frontend/src/app/pages/modules/module-detail.page.ts;
frontend/src/app/pages/modules/module-materials-form-dialog.component.ts;
frontend/src/app/pages/products/product-form-dialog.component.ts;
docs/pages/product-detail.page.md;
docs/pages/module-detail.page.md

Проверено:
- BE `GET /:id/tree?maxDepth=` на Product и ProductModule (`MAX_DEPTH=8`)
- FE service после 320: lineType включает `product`; CRUD composition готов
- UI после 320: плоские редакторы в dialogs; нет lazy tree / depth warn

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Менеджер видит состав плоско (строки), без раскрытия «модуль внутри модуля /
   изделие внутри комплекса» по дереву.
2. Depth>5 warn и отказ depth≥9 есть на backend; UI не предупреждает.
3. 320 закрывает CRUD всех lineType; 311 — **единый** UX дерева + редактора.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: FE client для tree

- `getProductTree(id, maxDepth?)` / `getModuleTree(id, maxDepth?)` →
  `GET /api/products|modules/:id/tree`
- Типы узла зеркалят BE TreeNode (id, kind, name?, children[], line meta если есть).
- Unit-тест HTTP.

ШАГ 2: Shared `CompositionTree` + `CompositionEditor` (одна пара для Product и Module)

- Разместить под `frontend/src/app/shared/ui/composition/` (или `pages/catalog/composition/`
  если shared/ui перегружен — один выбор, задокументировать в page docs).
- Tree: lazy expand детей (повторный fetch subtree или один tree с maxDepth);
  RU labels: Изделие / Модуль / Материал + kind для material.
- Editor: add/edit qty / remove линии; для parent Product — типы module|material≠raw|product;
  для parent Module — module|material; product-линия запрещена на module (toast + не слать).
- Depth: если путь >5 — warn banner; попытка создать depth≥9 — показать текст 422 с BE.
- Цикл / self-ref — показать понятный RU текст из ошибки API.
- Бейдж «Комплекс» если корень Product и есть product-ребёнок (как в 320).

ШАГ 3: Встроить на detail-страницы

- `/products/:id` и `/modules/:id`: секция «Состав» = CompositionEditor (tree).
- Dialogs из 320: не ломать; либо оставить как quick-edit, либо thin-wrap на тот же editor
  (предпочтение: detail = tree SoT UI; dialogs могут остаться плоскими до 315 polish).
- Не дублировать два write-path с разным поведением правил.

ШАГ 4: Docs + a11y минимум

- Page docs: tree API, expand, depth warn, ссылка на 300 §3.1.
- Keyboard: focus ring на expand/add; empty state «Состав пуст».

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: CONFLICT KEYS.

НЕ ИЗМЕНЯТЬ:
- backend catalog-graph / composition (уже DONE)
- BOM write, cost rollup, Order snapshot
- Excel / desktop Wave 4
- TZ-CATALOG-315 (lists polish) — successor после 311

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. На product detail и module detail есть дерево состава с lazy expand.
2. Можно добавить/изменить qty/удалить линии всех **разрешённых** типов для родителя.
3. Module→module и Product→product видны как вложенные узлы (не только плоский список).
4. Material-узлы показывают RU kind (деталь/покупное/…).
5. Depth>5 → warn в UI; depth≥9 → ошибка с понятным текстом (не silent fail).
6. Cycle/self-ref → RU сообщение, состав не портится.
7. Jest: service tree + component smoke (expand / add lineType=module на module).
8. Page docs обновлены.

Verification:
```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="composition|product-detail|module-detail|pi-product-modules"
```

═══════════════════════════════════════════════════════════════
KNOWN LIMITATIONS
═══════════════════════════════════════════════════════════════

- Cost / mass auto-rollup — не Phase 1.
- Unlimited nesting — запрещено (hard 8).
- Lists polish / 375px dialogs → **315**.
- Snapshot в заказ → Wave 3.

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

Checklist до кода. Archive `tasks/_archive/2026-08/TZ-CATALOG-311.done.md`.
Удалить stub из backlog после archive. Обновить `_active-map`: next = 315.
