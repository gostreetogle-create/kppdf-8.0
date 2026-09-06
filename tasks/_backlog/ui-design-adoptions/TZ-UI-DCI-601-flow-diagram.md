# TZ-UI-DCI-601: pi-flow-diagram kit primitive

**РОЛЬ АГЕНТА:** Executor  
**LAYER:** 3 (new shared component + kit page)  
**CONFLICT KEYS:** `frontend/src/app/shared/ui/`; `frontend/src/app/pages/kit/`; `docs/ui-rules.md`; `docs/paper-and-ink.md`  
**ЗАВИСИМОСТИ:** TZ-UI-DCI-602 (focus-visible) — soft, можно параллельно если разные файлы  
**ИСТОЧНИК:** DCI §8 SVG routes + audit A4

## ИСХОДНОЕ СОСТОЯНИЕ

- Orthogonal flow diagrams не существуют в Pi-*.
- Combine kanban и production cockpit используют таблицы/бары без SVG-связей.
- DCI pattern: `ResizeObserver` + `getBoundingClientRect` + `orthogonalPath()`.

## ЧТО ДЕЛАТЬ

1. Создать `PiFlowDiagramComponent` в `shared/ui/flow-diagram/`:
   - Inputs: `nodes: { id, label, status? }[]`, `edges: { from, to }[]`
   - SVG overlay: base route (low contrast `--color-rule`), pulse optional (gold-deep, `@media (prefers-reduced-motion: reduce)` off)
   - `ResizeObserver` на container; paths пересчитываются
   - ARIA: `role="img"`, `aria-label` с текстовым fallback списком связей

2. Kit showcase: секция на `/kit/overview` или новый `/kit/flow` — 5–6 узлов demo «Заказ → Снабжение → Цех → Отгрузка».

3. Добавить строку в `docs/ui-rules.md` таблицу примитивов.

4. `docs/paper-and-ink.md` § External references — ссылка на компонент.

## НЕ ИЗМЕНЯТЬ

- Production/combine pages (только kit demo в этой TZ).
- Violet/ice colors — только gold/rule tokens.
- Hardcoded SVG paths без ResizeObserver.

## КРИТЕРИИ ПРИЁМКИ

- [ ] Kit demo: resize окна перестраивает маршруты без артеfactов
- [ ] Reduced motion: pulse hidden, base routes visible
- [ ] Keyboard: узлы focusable, focus ring виден
- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [ ] `cd frontend && pnpm test -- --testPathPattern=flow-diagram` PASS (spec added)
- [ ] `docs/ui-rules.md` + `paper-and-ink.md` updated

## Integrity slot

- [ ] FIC §A: kit route если новый `/kit/flow`
- [ ] PAGE-TZ-INDEX: строка если новый route
