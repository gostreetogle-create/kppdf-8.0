# TZ-FRONTEND-304: Состав изделия — разделить контейнер и UI (осторожный фон)

РОЛЬ АГЕНТА: Senior Angular 20 refactoring engineer (thorough, not fast)

ЗАВИСИМОСТИ: TZ-FRONTEND-302 DONE; TZ-FRONTEND-303 DONE (Jest debt landed)

LAYER: 3 (shared composition + callers; serial)

PAGES: /products/:id ; /modules/:id
PAGE_DOCS: обновить только если реально меняется контракт страницы; иначе N/A одной строкой

CONFLICT KEYS (стартовый максимум; дробить на child ≤8 файлов):

- `frontend/src/app/shared/ui/composition/product-bom-panel.component.ts` ;
  `frontend/src/app/shared/ui/composition/product-bom-panel.component.spec.ts` ;
  `frontend/src/app/shared/ui/composition/product-composition-picker-dialog.component.ts` ;
  `frontend/src/app/shared/ui/composition/product-composition-picker-dialog.component.spec.ts` ;
  `frontend/src/app/shared/ui/composition/composition-tree.component.ts` ;
  `frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts` ;
  `frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts` ;
  `docs/agent-checklists/TZ-FRONTEND-304.md`

Callers pages (`products/product-detail`, `modules/module-detail`, `products/product-form-dialog`)
подключать **только отдельным child-batch** с exact keys после зелёного shared-контракта.
Не claim весь `frontend/src/**`.

## ИСХОДНОЕ СОСТОЯНИЕ

Проверено (integrity audit P1-COMPOSITION + код):

- `ProductBomPanelComponent` в `shared/ui/composition` владеет Product/Material/ProductModules
  API, Router, Dialog и динамически импортирует page form-dialogs.
- Это нарушает канон: shared UI не должен знать pages/** и не должен быть
  domain-orchestrator «на всякий случай».
- Callers: product-detail, module-detail, product-form-dialog, QuickCreate.
- Focused composition specs уже существуют (~22 tests) — использовать как baseline.
- Цель **не** «переписать состав», а сделать ownership ясным без смены бизнес-поведения
  (кол-во, cost preview, add/edit/remove lines, права read-only).

Проверено: Angular 20.3; `docs/ANGULAR-GUIDE.md` § container/presentational;
`docs/audits/2026-08-15-angular-component-integrity.md` § B-COMPOSITION-SUCCESSOR.

## ЧТО ДЕЛАТЬ (медленно и тщательно)

### Фаза 0 — Claim и карта

1. Isolated worktree от свежего `origin/main`.
2. CLAIM `tasks/_active/TZ-FRONTEND-304.md` + checklist **до** кода.
3. Перечислить всех callers и dynamic imports (с path:line). Записать в checklist.
4. Прогнать baseline focused composition + quick-create specs; зафиксировать PASS/FAIL.

### Фаза 1 — Characterization (обязательна, не пропускать)

5. Добавить/расширить characterization tests на:
   - load empty/error/success дерева;
   - add line / change qty / remove (если UI позволяет в test harness);
   - read-only / permissions path без мутации;
   - cost hint loading label (не ломать TZ-COST контракт).
6. Не начинать extract, пока characterization зелёные на текущем поведении.

### Фаза 2 — Граница без смены UX

7. Выбрать **один** безопасный разрез (записать rationale в checklist):
   - **A (предпочтительно):** вынести orchestration (API/Router/dialog open) в
     `shared/services` или page-level container helper, а panel оставить
     presentational (inputs/outputs + tree UI); **или**
   - **B:** оставить panel как container, но убрать dynamic `import('...pages...')` —
     открытие форм только через callback/output народителя / уже существующий dialog API.
8. Запрещено: forwarding-wrapper на 10+ inputs; перенос бизнес-правил цены/состава;
   новый NgRx/store; Signal Forms.
9. Child batch ≤8 файлов. Сначала shared + specs, потом **по одному** page caller.
10. После каждого child: focused Jest + tsc + eslint changed + architecture:check +
    diff-check. Полный frontend test перед closeout.

### Фаза 3 — Closeout

11. Обновить canonical audit finding P1-COMPOSITION → FIXED или PARTIAL+successor.
12. Archive/lock/progress; deploy НЕ.

## НЕ ИЗМЕНЯТЬ

- Backend / schema / RBAC / KP create / photo / form-profiles;
- Визуальный язык Paper & Ink и пользовательские подписи без нужды;
- Architecture baseline expansion; новые зависимости; deploy.

## STOP CONDITIONS

- Нужен выбор PO по продуктовому UX («куда деть кнопку добавить») → STOP;
- Батч расползается >8 файлов или второй page domain без child marker → split;
- Baseline composition specs red и чинится «заодно» без отдельной записи → STOP;
- Conflict с чужим active claim → STOP.

## КРИТЕРИИ ПРИЁМКИ

1. Нет dynamic import `pages/**` из `shared/ui/composition/**` (или явный BLOCKED successor).
2. Presentational граница задокументирована: кто владеет API, кто UI.
3. Characterization + focused composition/quick-create PASS; затронутые page specs PASS.
4. Пользовательский сценарий состава (товар/модуль/quick-create) behavior-preserving.
5. Checklist с картой callers, rationale A/B, SHAs child batches.
6. Deploy НЕ.

## ФИНАЛИЗАЦИЯ

Root TZ: checklist → archive `tasks/_archive/2026-08/TZ-FRONTEND-304.done.md` →
lock → progress → удалить `_active` → commit/push.
Скорость не важна. Важны characterization, маленькие батчи и отсутствие регрессий.
