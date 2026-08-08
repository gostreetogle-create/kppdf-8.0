═══════════════════════════════════════════════════════════════
Z-006: Фронтовые shared-примитивы — error-state, error-helper, table
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Engineer (UI Platform / Paper & Ink)

ЗАВИСИМОСТИ: нет. Идёт в паре с Z-002. Серия: `tasks/_backlog/z-series/README.md` § Z-006.

LAYER: frontend (shared UI components + page consolidation)

CONFLICT KEYS:
frontend/src/app/shared/ui/*;frontend/src/app/pages/contracts/contracts.page.ts;frontend/src/app/pages/orders/orders.page.ts;frontend/src/app/pages/materials/materials.page.ts;frontend/src/app/pages/admin/roles-admin.page.ts;frontend/src/app/pages/admin/users-admin.page.ts;frontend/src/app/pages/inventory/stock-movements.page.ts;frontend/src/app/shared/dsl/entity-list/entity-list.component.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ (верифицировано по коду 2026-08-02)
═══════════════════════════════════════════════════════════════

1. Идентичный inline error-блок скопирован дословно в ~19 страницах:
     <div role="alert" class="mb-6 border hairline border-destructive
       rounded-sm px-4 py-3 text-sm text-destructive">{{ error() }}</div>
   Пример: `contracts/contracts.page.ts:210-216` + 18 других. Это
   классический сигнал недостающего shared-компонента.

2. ~15 страниц дублируют связку error-handling boilerplate в .ts:
     error = computed(() => extractErrorMessage(resource.error()));
     errorEffect = effect(() => { ... this.toast.error(...) });
   Всего `this.toast.error(extractErrorMessage(...))` — 79 вызовов
   по pages/. Каждый новый page копирует паттерн вручную.

3. Admin-страницы используют НЕСОВМЕСТИМУЮ error-разметку:
   `roles-admin.page.ts:86-88` — `<p class="text-destructive">` БЕЗ
   `role="alert"`. Screen-reader НЕ анонсирует ошибку — это a11y-регрессия
   относительно остальных страниц. Аналогично users-admin.

4. 7 страниц обходят `app-pi-table` (общий table-компонент с
   loading/empty/pagination/a11y) и пишут сырой `<table>`:
   admin/*, doc-constructor/*, inventory-dashboard, product-detail, materials.
   Они вручную повторяют `<thead>`, row-striping, пагинацию — и теряют
   `aria-label`/`aria-describedby`, которые `app-pi-table` даёт из коробки.

5. Огромные компоненты в doc-constructor/builder:
     builder-inspector.component.ts — 2342 строки
     builder.page.ts                 — 1856
     table-template-dialog.component.ts — 1371
     block-renderer.component.ts     — 1150
     builder-canvas.component.ts     — 1046
   26 не-spec .ts файлов превышают 400 строк. Builder-кластер —
   candidate на decomposition (отдельная задача, не в этом TZ).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Создать `shared/ui/pi-error-state/` компонент (Paper & Ink):
   - selector: `app-pi-error-state`
   - inputs: `message = input<string | null>(null)`,
             `variant = input<'alert'|'inline'>('alert')`
   - рендер: при message — `<div role="alert" class="...">`.
     Внутри — текущая разметка из 19 страниц (единый source of truth).
   - WCAG: `role="alert"` + `aria-live="assertive"` (announce).
   - spec: render на null → пусто; на message → role=alert.

ШАГ 2 — Мигрировать ~19 страниц на `<app-pi-error-state [message]="error()" />`.
   - По странице за commit (zero visual diff — разметка идентична).
   - Особое внимание admin-страницам: их `<p>` → `app-pi-error-state` —
     это ещё и a11y-fix.

ШАГ 3 — Создать error-handling helper в shared/dsl/ (или core/):
   - `bindResourceError(resource, toast): Signal<string | null>` —
     инкапсулирует computed+effect (extractErrorMessage + toast.error).
   - ИЛИ директиву `piToastOnError` для resource.
   - Цель: убрать 79 ручных `this.toast.error(extractErrorMessage(...))`.
   - Не менять поведение toast — только устранить копипасту.

ШАГ 4 — Унификация raw tables через `app-pi-table`:
   - 7 страниц с сырым `<table>` → мигрировать на `app-pi-table`.
   - admin/users-admin, admin/roles-admin — первичные кандидаты (там
     же пагинация TODO, см. TZ-278; вместе закроет два долга).
   - doc-constructor/tables, inventory-dashboard, product-detail —
     отдельные подзадачи (там сложная структура; возможно нужны
     расширения app-pi-table: custom cell templates, column groups).
   - Цель: каждая таблица получает loading/empty/aria из коробки.

ШАГ 5 (опционально, junior-friendly) — Создать `shared/ui/pi-empty-state/`
   и `pi-loading-skeleton/` если их ещё нет (проверить). Если есть —
   убедиться, что все list-страницы их используют, а не пишут «Загрузка...»
   вручную.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. `app-pi-error-state` создан, adopted ≥15 страницами.
2. `grep -rn 'border-destructive rounded-sm px-4 py-3 text-sm text-destructive'`
   в pages/ возвращает 0 (копипаста устранена).
3. Все error-блоки на страницах имеют `role="alert"` (a11y — admin-fix).
4. error-handling helper создан, ≥5 страниц используют его вместо
   ручного `this.toast.error(extractErrorMessage(...))`.
5. ≥3 из 7 raw-`<table>` страниц мигрированы на `app-pi-table`.
6. Frontend typecheck + Jest PASS; lint PASS.
7. Каждый мигрированный page: visual diff = 0 (одобрено сравнением
   скриншотов или ручной проверкой DOM).

ОГРАНИЧЕНИЯ: НЕ переписывать Paper & Ink дизайн — только DRY. НЕ
трогать doc-constructor/builder-кластер (это отдельная decomposition-задача,
большой scope). НЕ добавлять сторонние UI-библиотеки (Material/PrimeNG —
REJECTED). accessibility-priority: admin-страницы исправить обязательно.
