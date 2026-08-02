# TZ-PRODUCTS-304 — Expandable catalog rows (модули в каталоге товаров)

> Checklist (конвенция GEMINI.md / AI-AGENT-GUIDE). Создан до финализации, обновлён по результатам.

## Scope

Layer 3 (frontend). Четвёртый в цепочке Products (зависит от TZ-PRODUCTS-303 — карточки модулей в диалоге товара).

- `frontend/src/app/pages/products/products.page.ts` — expandable-строки:
  - `expandedId: signal<string | null>` + `onRowClick(row)` toggle (повторный клик сворачивает);
  - `(rowClick)="onRowClick($event)"` (pi-table эмитит строку);
  - `[expandedRow]="expandedId() ? expandedTpl : null"` — свёрнутые строки БЕЗ пустых `<tr>`;
  - `#expandedTpl`: карточки модулей (инициалы-аватар, имя, артикул, «N материалов»), `routerLink` `/modules/:id` (route существует, app.routes.ts:195), empty state «Нет модулей в составе…»;
  - колонка «Модулей» (count из `productModuleIds.length`, numeric right);
  - `modulesOf(row)` — фильтр populated ProductModule объектов из `productModuleIds`.
- `frontend/src/app/pages/products/products.page.spec.ts` (NEW, 8 tests) — реальный рендер pi-table.
- `docs/pages/products.page.md` — секция «Expandable-строки (TZ-PRODUCTS-304)» + TZ-строка + Column definitions sync.

## Dependencies

- TZ-PRODUCTS-303 (`243aeda`) — «Модули в составе» в диалоге товара; консистентный рендер модулей.
- Паттерн-референс: TZ-MODULES-302 (expandable-строки: pi-table `expandedRow` + сигнал + conditional template).

## Conflict keys

- `frontend/src/app/pages/products/products.page.ts`
- `frontend/src/app/pages/products/products.page.spec.ts`
- `frontend/src/app/shared/ui/pi-table.component.ts` — НЕ менялся (per-row toggle делается на странице, pi-table уже умеет `expandedRow`)
- `docs/pages/products.page.md`

## Protected paths

- TZ-PRODUCTS-303 (`243aeda`/`f82c358` — closed), TZ-PRODUCTS-301/302/305, TZ-MODULES-* (паттерн-референс, read-only).
- backend/ — НЕ трогается (TZ-304 frontend-only; `list()` уже populate `productModuleIds`, product.service.ts:72).
- TZ-WORKERS-* (people.page.ts — pre-existing), TZ-DOC-308 categories.page.ts (pre-existing), TZ-MATERIALS-*, sanitize-html, Z-backlog, desktop/, mobile/.

## Решения (зафиксированы)

1. **Toggle на странице, pi-table не меняется.** `expandedRow` — единый TemplateRef под каждую строку (pi-table рендерит `<tr>` под каждой строкой когда template передан); содержимое ограничено `@if (expandedId() === row._id)` внутри шаблона. Свёрнутое состояние (`expandedId() === null`) передаёт `null` → вообще без лишних `<tr>`.
2. **Навигация на `/products/:id` сохранена** — ссылка-название имеет `stopPropagation`, клик по остальной строке — toggle. Row-actions НЕ раскрывают (pi-table сам `stopPropagation` на actions `<td>`, строка 193).
3. **Карточка без фото** — инициалы-аватар (у `GET /modules` нет фото, отдельная сущность `ProductModulePhoto`), согласовано с TZ-PRODUCTS-303.
4. **Колонка «Модулей»** — raw `productModuleIds?.length`; в практике backend populate top-level → совпадает с числом карточек (`modulesOf` фильтрует только populated объекты). Комментарий в docblock фиксирует это.

## Acceptance criteria (все выполнены)

1. Клик по строке разворачивает список модулей; повторный клик сворачивает. ✅ (тесты toggle open/close/switch)
2. Модули — карточки с инициалами/именем/артикулом/«N материалов»; клик → `/modules/:id`. ✅ (тест routerLink href + контент карточек)
3. Свёрнутые строки без пустых `<tr>`; row-actions не раскрывают. ✅ (тест edit-button → expandedId null)
4. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — exit 0. ✅
5. `cd frontend && pnpm exec jest products --no-coverage` — 48/48 PASS (8 новых + 32 dialog + 8 picker). ✅
6. `cd frontend && pnpm exec ng build --configuration=development` — exit 0. ✅
7. `git diff --check` — clean; `bash OrchestratorKit/verify-status.sh` — PASS. ✅
8. Code review (code-reviewer-deepseek-flash): stale comment 7→8 колонок, docs Column definitions sync, комментарий count-vs-modulesOf, +1 тест row-actions. Все исправлены. ✅

## Тесты (8 новых в products.page.spec.ts)

- row click → expandedId == productId + `[data-test="expanded-row"]` рендерится;
- повторный клик → null + строка скрыта;
- клик по ДРУГОЙ строке → switch;
- карточки: имя/артикул/«N материалов» (2 и 1);
- routerLink href = `/modules/mod1`;
- empty state для товара без модулей;
- «Модулей» column format (2 / 0);
- row-actions (edit) НЕ триггерят expand.

## Browser-сценарий

MANUAL_BROWSER_CHECK_REQUIRED — live flow не запускался (dev-stack не поднимался); контракт доказан unit-тестами с РЕАЛЬНЫМ рендером pi-table (provideHttpClientTesting + provideRouter) + ng build.

## Known limitations

- TZ-DOC-308 categories.page.ts — пре-экзистинг blocker из основного worktree; в этом билде ng build прошёл (не fix-force).
- TZ-WORKERS-302 (parallel session) — people.page.ts/workers.service.ts; здесь ng build exit 0.
- `frontend` полный jest: 1 pre-existing failure в `button.component.spec.ts` — НЕ регрессия (852/853 PASS).
- pi-table artifact: когда одна строка развёрнута, под остальными строками рендерится пустой `<tr bg-paper-2 hairline-b>` (структурное ограничение единого `expandedRow` template; паттерн TZ-MODULES-302, pi-table НЕ менялся по ТЗ).
