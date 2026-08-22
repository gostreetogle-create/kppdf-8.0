═══════════════════════════════════════════════════════════════
TZ-DESK-424: Стол — убрать забор рамок в составе
═══════════════════════════════════════════════════════════════

> `docs/TZ-AUTHORING.md`. Канон: `docs/pages/ui-composition-tree.md` (2026-08-22), `docs/superpowers/specs/2026-08-22-desk-order-tray-operator.md`.
> Gemini-консультация: рамки/сетка — да; новый `order-form-flyout` — нет (уже `OrderFormPanel` в `panel=bom`/`edit`).

РОЛЬ АГЕНТА: Frontend UI Engineer (executed by Claude terminal — see Executor report)

ЗАВИСИМОСТИ: DESK-423 DONE.

LAYER: 3

PAGES: /desk ; /orders ; /products/:id
PAGE_DOCS: manager-desk.page.md ; orders.page.md ; ui-composition-tree.md

CONFLICT KEYS: frontend/src/app/shared/ui/composition/composition-tree.component.ts; frontend/src/app/shared/ui/composition/composition-tree.component.spec.ts; frontend/src/app/shared/orders/order-hub-tray.component.ts; frontend/src/app/shared/orders/order-hub-tray.component.spec.ts; frontend/src/app/pages/desk/manager-desk.page.ts; frontend/src/app/pages/desk/manager-desk.page.spec.ts; docs/pages/ui-composition-tree.md

## ЧТО СДЕЛАНО

- `composition-tree.component.ts`: убран `nestShadow()` (метод + inline
  `box-shadow` binding, включая dark inset) и `[class.hairline]` на node-wrapper
  (была карточка-в-карточке на раскрытом узле). Строка (row) теперь всегда
  `border-b` (единая нижняя линия), вместо условного `hairline+rounded-sm`
  (свёрнуто) vs `border-b` (раскрыто). Kind rail `border-l-[5px]` не менялся.
- `order-hub-tray.component.ts`: снята внутренняя обёртка
  `p-2 hairline rounded-sm bg-paper` вокруг `app-composition-tree` (секция уже
  в рамке снаружи); убран span `order-summary-client` («Клиент: …») в
  desk-режиме (`clientLabel` input оставлен); «Подтвердить» → `bg-gold`/`text-ink`
  вместо `bg-ink`/`text-paper`; hub-ссылки «Открыть заказ»/«Открыть карточку
  заказа» → compact outline-кнопки вместо `underline` (маршруты не менялись);
  правые кнопки Снабжение/Производство/Документы/Блокнот → `w-full min-h-touch`,
  одна колонка вместо `ml-auto` разной высоты.
- `manager-desk.page.ts`: `.manager-desk__order-actions` — `flex` → `grid`
  (`1fr auto`), «Удалить» — последняя grid-колонка той же высоты, не отдельная
  flex-полоса; `.manager-desk__status` — `font-weight: 600` + `letter-spacing`
  + hairline outline, один акцентный цвет на все статусы (без светофора —
  никогда и не было per-status раскраски).
- Specs обновлены во всех трёх файлах под новое поведение (nestShadow
  отсутствует; client hidden; gold CTA; delete в grid) — детали в checklist.
- `manager-desk.page.md`: строка DESK-424 → DONE.
- `docs/pages/ui-composition-tree.md`: канон уже был обновлён (AC9) до старта
  этой TZ — включён в коммит как есть, не редактировался повторно.

## Acceptance (из TZ)

- [x] Дерево без «забора»: нет `nestShadow`/inset; нет hairline-обёртки на раскрытом node; kind rail остаётся; свёрнутая строка без hairline+rounded «коробки»
- [x] Tray: убрана внутренняя рамка вокруг дерева; «Клиент:» не дублируется в desk-режиме
- [x] «Подтвердить»: gold на бумаге когда доступна, outline+muted когда нет
- [x] Правая колонка: `w-full min-h-touch`, одна колонка, одинаковый размер
- [x] Hub «Открыть заказ»/«Открыть карточку заказа»: compact outline-кнопки, не underline; маршруты не менялись
- [x] «Удалить» в той же grid-строке последней колонкой; статус — font-medium/letter-spacing/outline hairline, не светофор
- [x] Specs + `manager-desk.page.md` обновлены

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit                          → exit 0
cd frontend && pnpm test -- composition-tree order-hub-tray manager-desk --runInBand → 46/46 PASS
cd frontend && pnpm lint                                                             → 0 errors, 18 pre-existing warnings (unrelated files)
```

## known_limitation

Живой браузерный прогон на 1440 `/desk` (упомянутый в Gates самой TZ) не
выполнялся в headless-сессии — только статические гейты. PO/dev: раскрыть
заказ на `/desk`, проверить визуально состав без тройной рамки, «Клиент»
один раз, «Подтвердить» не чёрная дыра, «Удалить» в линии строки.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude
sha: (см. следующий docs-commit «record TZ-DESK-424 SHA»)
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (46/46)
  - lint: PASS (0 errors)
  - checklist: ADDED (`docs/agent-checklists/TZ-DESK-424.md`)
  - progress.md: N/A
  - status synchronization: PASS (`_NOW.md`, `manager-desk.page.md`)
