# TZ-FRONTEND-302: Staged Angular integrity remediation wave

РОЛЬ АГЕНТА: Senior Angular 20 Refactoring Engineer

ЗАВИСИМОСТИ: TZ-FRONTEND-301 DONE ; audit Cursor/PO PASS

LAYER: 3 per child batch; umbrella is orchestration only

CONFLICT KEYS: docs/audits/2026-08-15-angular-component-integrity.md ;
docs/agent-checklists/TZ-FRONTEND-302.md ;
docs/agent-checklists/_NOW.md

## ЦЕЛЬ

Исправить подтверждённые P0/P1 и согласованные P2 Angular findings без изменения
бизнес-поведения. Не делать один repository-wide refactor.

## ОБЯЗАТЕЛЬНАЯ МОДЕЛЬ BATCH

Перед product edit каждого batch:

1. Создать child marker/checklist `TZ-FRONTEND-302-A`, затем B/C по batches.
2. Перенести exact files и назначенный `lane: A|B` из approved audit.
3. Claim должен быть видим другим worktrees через Team Room или canonical root
   active registry; локальный marker только внутри isolated worktree недостаточен.
4. Один batch = одна page/container boundary или ≤8 связанных файлов.
5. Baseline focused tests должны PASS; неоднозначное legacy сначала фиксируется
   characterization test.
6. Отдельный commit/push и evidence после каждого зелёного batch.
7. Следующий batch нельзя начинать при failed gate или живом конфликте.

Umbrella TZ не даёт право claim на `frontend/src/**`.

## ДВЕ ПАРАЛЛЕЛЬНЫЕ LANES

- Максимум два remediation agents: A и B.
- Один batch принадлежит ровно одной lane; смена owner фиксируется до edits.
- Lane A единственная редактирует canonical audit/umbrella checklist.
- Lane B редактирует только свой child checklist/evidence и assigned product files.
- `app.routes.ts`, `app.config.ts`, global styles, shared API services и architecture
  tooling — serial hot files: одновременно только одна lane.
- Пересечение exact conflict keys, shared caller или одного focused spec = STOP,
  не «разрешить merge потом».
- Если audit не даёт два независимых ready batch, вторая lane ждёт/останавливается.

## ПОРЯДОК

### 1. Correctness

- duplicate writes/submits, state ownership, teardown, mutable inputs;
- raw HTTP/domain mutation из presentational component;
- permission/read-only/autosave regressions.

### 2. Architecture

- page/container → presentational extraction только по реальной ответственности;
- shared→pages/cross-domain imports;
- typed service/view-model boundaries;
- derived state → `computed`, imperative side effect → controlled `effect`.

### 3. Maintainability

- typed Reactive Forms;
- input/output/model APIs в реально затронутом component contract;
- native control flow/class/style bindings;
- lifecycle/cleanup modernization.

P3 style-only churn не выполнять без соседнего P0–P2 изменения.

## CONTAINER/PRESENTATIONAL CONTRACT

- Container: route, permissions, API orchestration, loading/error/save state.
- Presentational: input/output/model + local UI state; no API service/Router/store.
- Existing behavior, labels, order, keyboard, light/dark и public component contract
  сохраняются либо мигрируются атомарно вместе со всеми callers/tests.
- Не создавать forwarding wrappers и длинные prop chains.

## НЕ ДЕЛАТЬ

- Angular upgrade, zoneless, Signal Forms, NgRx или новую библиотеку;
- массовую замену decorators/constructor DI без functional value;
- перемещение бизнес-логики между Product/KP/order entities;
- изменение API/backend/RBAC «для удобства refactor»;
- suppress lint/type errors, раздувание architecture baseline;
- deploy.

## GATES КАЖДОГО CHILD BATCH

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern=proposal-create.page --runInBand
cd frontend && pnpm exec eslint src/app/pages/commercial/proposals/proposal-create.page.ts
pnpm architecture:check
git diff --check
```

Jest pattern и ESLint paths заменить exact spec/files текущего child checklist.

UI batch: browser smoke + loading/error/empty/success + keyboard/focus +
light/dark + F5/autosave/read-only по затронутому пути.

## КРИТЕРИИ ПРИЁМКИ ВОЛНЫ

1. P0/P1 из approved audit: FIXED либо BLOCKED с конкретным successor.
2. P2: исправлен только согласованный scope; остальное BACKLOG.
3. Каждый extract имеет тест публичного component contract и parent integration.
4. Full frontend tsc/lint/Jest + architecture-check PASS в финале.
5. Нет новой зависимости, product behavior или baseline suppression.
6. Audit обновлён verdict/commit по каждому finding.
7. Child tasks архивированы; umbrella checklist содержит full SHAs.
8. Cursor/PO review PASS; deploy НЕ.
9. Parallel run не оставил merge conflict, duplicate refactor или divergent component API.

## ФИНАЛИЗАЦИЯ

После всех child batches: final gates → review → umbrella archive/lock/progress →
commit/push. Остановиться со статусом `ANGULAR INTEGRITY READY`; production не трогать.
