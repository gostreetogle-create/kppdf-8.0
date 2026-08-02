# TZ-PRODUCTS-304 — DONE (Expandable catalog rows with modules)

**Date:** 2026-08-02
**Outcome:** DONE — каталог товаров получил expandable-строки: клик по строке разворачивает карточки привязанных модулей, клик по модулю ведёт на `/modules/:id`.
**Layer:** 3 (frontend). Backend НЕ трогался (populate уже готов, product.service.ts:72).

## Что сделано

**`frontend/src/app/pages/products/products.page.ts`:**
- `expandedId: signal<string | null>` + `onRowClick(row)` toggle (повторный клик по той же строке сворачивает).
- Подписка `(rowClick)="onRowClick($event)"` — pi-table эмитит строку по клику на `<tr>`.
- `[expandedRow]="expandedId() ? expandedTpl : null"` — свёрнутые строки БЕЗ пустых `<tr>` (template передаётся только при развёрнутой строке).
- `#expandedTpl` — карточки модулей: инициалы-аватар (у `GET /modules` нет фото — отдельная сущность `ProductModulePhoto`), имя, артикул, «N материалов»; клик по карточке → `routerLink` `/modules/:id` (route существует, app.routes.ts:195); empty state «Нет модулей в составе. Откройте товар, чтобы привязать модули.»
- Колонка «Модулей» (count из `productModuleIds.length`, numeric right, между `status` и `stockQty`).
- `modulesOf(row)` — фильтр populated ProductModule объектов из `productModuleIds` (строки-ids отфильтровываются).
- Docblock: 7 → 8 колонок (по review), комментарий про count-vs-modulesOf.

**`frontend/src/app/pages/products/products.page.spec.ts` (NEW, 8 tests):**
Реальный рендер pi-table (provideHttpClientTesting + provideRouter — contracts.page.spec паттерн). Кейсы: toggle open/close/switch, карточки (имя/артикул/N материалов), routerLink href `/modules/mod1`, empty state, «Модулей» column format, row-actions НЕ триггерят expand.

**Исправления по code review:**
- Stale docblock «7 visible columns» → 8 (добавлена «Модулей»).
- `docs/pages/products.page.md` Column definitions sync («Модулей» в цепочке колонок).
- Комментарий: колонка считает raw `productModuleIds.length`, `modulesOf` — только populated объекты (в практике совпадают).
- +1 тест: edit-button НЕ раскрывает строку (stopPropagation в pi-table).

**Docs:** `docs/pages/products.page.md` — секция «Expandable-строки (TZ-PRODUCTS-304)» + TZ-строка.

## Решения (зафиксированы)

1. **pi-table НЕ менялся.** `expandedRow` — единый TemplateRef под каждой строкой (структурное ограничение pi-table: template рендерится под КАЖДОЙ строкой, когда не null); содержимое ограничено `@if (expandedId() === row._id)` внутри шаблона. `expandedId() === null` → `[expandedRow]="null"` → вообще без лишних `<tr>`.
2. **Навигация на `/products/:id` сохранена** — название-ссылка имеет `stopPropagation`; клик по остальной строке — toggle. Row-actions НЕ раскрывают (pi-table `stopPropagation` на actions `<td>`, строка 193).
3. **Карточка без фото** — инициалы-аватар, согласовано с TZ-PRODUCTS-303.
4. **Scope-дисциплина:** только 3 conflict-файла (products.page.ts + spec + docs), pi-table/backend не тронуты.

## Гейты (все зелёные)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — exit 0 (sanity, backend не трогался)
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — exit 0
- `cd frontend && pnpm exec jest products --no-coverage` — 3 suites / 48 tests PASS (8 новых + 32 dialog + 8 picker)
- `cd frontend && pnpm exec jest --no-coverage --runInBand` (полный) — 852/853 PASS; единственный fail = pre-existing `button.component.spec.ts` (baseline-проверен stash'ем в 301, файл не мой)
- `cd frontend && pnpm exec ng build --configuration=development` — exit 0 (без warning'ов)
- `git diff --check` — clean
- `bash OrchestratorKit/verify-status.sh` — PASS

## Что НЕ изменялось намеренно

- `frontend/src/app/shared/ui/pi-table.component.ts` — НЕ менялся (per-row toggle на странице, ТЗ разрешает менять только при необходимости).
- Backend — НЕ трогался (TZ-304 frontend-only; populate готов product.service.ts:72).
- TZ-PRODUCTS-303 (`243aeda`/`f82c358` — closed), TZ-PRODUCTS-301/302/305, TZ-MODULES-* (референс), TZ-DOC-*, TZ-MATERIALS-*, TZ-WORKERS-*.
- package.json / lock-файлы.

## Conventional commits

- `feat(products): expandable-modules catalog row (TZ-PRODUCTS-304)`
- `docs(closeout): archive + lock + STATUS.md + progress.md (TZ-PRODUCTS-304)`

## ARCHIVE_MARKER

```yaml
outcome: DONE
closed_at: 2026-08-02
closed_by: autonomous-frontend-agent (Buffy)
source_task: tasks/TZ-PRODUCTS-304-products-catalog-expandable-modules.md
implementation_commit: 84ad25c60ed112b7450d4f3dc5cdcfc7c398c839
closeout_commit: <closeout-sha>
prerequisite: TZ-PRODUCTS-303 (243aeda) — module cards editor in product dialog
scope_before: каталог товаров без expandable-строк; (rowClick) «latent» (не подписан); колонок 7
scope_after: клик по строке разворачивает карточки модулей (инициалы/имя/артикул/N материалов), routerLink /modules/:id, empty state, колонка «Модулей», toggle expandedId; колонок 8
verification:
  - backend_tsc: PASS (sanity)
  - frontend_tsc: PASS
  - jest_products_scope: 3 suites / 48 tests PASS
  - jest_frontend_full: 852/853 PASS (1 pre-existing button.component.spec.ts failure — baseline, не регрессия)
  - ng_build_dev: PASS (exit 0)
  - git_diff_check: clean
  - verify_status_sh: PASS
browser_status: MANUAL_BROWSER_CHECK_REQUIRED (dev-stack не поднимался; контракт доказан unit-тестами с реальным рендером pi-table + ng build)
known_limitations:
  - pi-table artifact: при развёрнутой строке под остальными строками рендерится пустой <tr bg-paper-2 hairline-b> (структурное ограничение единого expandedRow template; паттерн TZ-MODULES-302; pi-table НЕ менялся по ТЗ)
  - TZ-DOC-308 categories.page.ts — pre-existing blocker из основного worktree (в этом билде ng build прошёл; не fix-force)
  - TZ-WORKERS-302 (parallel session) — people.page.ts/workers.service.ts могут быть build-блокером в другом worktree; здесь ng build exit 0
  - frontend полный jest: 1 pre-existing failure в button.component.spec.ts — baseline-проверен stash'ем в 301, НЕ регрессия
  - колонка «Модулей» считает raw productModuleIds.length, карточки — только populated объекты (в практике совпадают; backend populate top-level)
protected_files:
  - frontend/src/app/pages/products/products.page.ts
  - frontend/src/app/pages/products/products.page.spec.ts (NEW)
  - docs/pages/products.page.md
not_changed:
  - frontend/src/app/shared/ui/pi-table.component.ts (expandedRow уже есть; toggle на странице)
  - backend (product/* — populate готов)
  - TZ-PRODUCTS-301/302/303/305, TZ-MODULES-*, TZ-DOC-*, TZ-MATERIALS-*, TZ-WORKERS-*, sanitize-html, Z-backlog, desktop/, mobile/
  - package.json / lock-файлы
successor: TZ-PRODUCTS-305 (showcase cards sm/md/lg — частично закрыт e00be99) — разблокирован
lock_file: .mimocode/locks/TZ-PRODUCTS-304-products-catalog-expandable-modules.lock
```
