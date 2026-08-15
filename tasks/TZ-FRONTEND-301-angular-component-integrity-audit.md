# TZ-FRONTEND-301: Angular component integrity audit

РОЛЬ АГЕНТА: Senior Angular 20 Architect / read-only auditor

ЗАВИСИМОСТИ: `docs/ANGULAR-GUIDE.md` landed in origin/main

LAYER: 4 (two read-only audit lanes)

CONFLICT KEYS:

- Lane A coordinator: `docs/audits/2026-08-15-angular-component-integrity-pages.md` ;
  `docs/audits/2026-08-15-angular-component-integrity.md` ;
  `docs/agent-checklists/TZ-FRONTEND-301.md`
- Lane B platform: `docs/audits/2026-08-15-angular-component-integrity-platform.md` ;
  `docs/agent-checklists/TZ-FRONTEND-301-B.md`

Обе lanes read-only по `frontend/src/**`; `_NOW.md` не менять параллельно.

## ИСХОДНОЕ СОСТОЯНИЕ

Проверено:

- `frontend/package.json`: Angular 20.3, RxJS 7.8, TypeScript 5.9, Jest,
  angular-eslint уже подключены;
- `frontend/eslint.config.js`: standalone и custom raw-HTTP/OnInit checks уже есть,
  часть project rules пока warning;
- `scripts/architecture-check.mjs`: shared→pages и cross-page boundaries проверяются;
- `docs/DEVELOPMENT-PATTERNS.md`: SilentResult/service/form patterns существуют;
- `docs/ANGULAR-GUIDE.md`: новый version-pinned component/state canon.

Новые зависимости для аудита не нужны.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Зафиксировать baseline

1. `git status`, branch/worktree, active conflict keys.
2. Frontend tsc, lint, focused custom ESLint rule specs, architecture-check.
3. Не исправлять baseline в этой TZ.

### ШАГ 2. Построить inventory двумя lanes

- Lane A: `frontend/src/app/pages/**`.
- Lane B: `frontend/src/app/shared/**`, `core/**`, `layout/**`, root
  `app*.ts`, routes/config и frontend ESLint/tooling.

Проверить `frontend/src/app/**` и посчитать/перечислить:

- raw `HttpClient`/domain service/Router в components;
- constructor DI, `@Input/@Output`, redundant `standalone: true`;
- отсутствие explicit OnPush;
- `NgModule`, legacy structural directives, `ngClass/ngStyle`;
- writable duplicate derived state, suspicious `effect`, mutable inputs;
- manual/nested subscriptions и teardown;
- untyped forms / DTO-form coupling / duplicate submit paths;
- shared→pages, cross-domain imports, direct deep imports;
- крупные mixed-responsibility components.

Regex/AST hit — только lead. Каждый вывод подтвердить чтением boundary и тестов.

### ШАГ 3. Оценить container/presentational split

Для каждого кандидата записать:

- current responsibilities/state owner/dependencies;
- extract или keep;
- предлагаемая container/presentational граница;
- публичные inputs/outputs;
- characterization tests до изменения;
- риск prop drilling/wrapper-only decomposition.

Размер файла не является дефектом без отдельной ответственности.

### ШАГ 4. Сформировать remediation map

Каждая lane создаёт только свой report. После двух pushed reports Lane A
консолидирует `docs/audits/2026-08-15-angular-component-integrity.md`:

- summary и baseline;
- findings P0/P1/P2/P3 с evidence `path:line`;
- false positives / intentionally accepted legacy;
- batches по одной page boundary или ≤8 связанным файлам;
- exact conflict keys, tests и browser scenario каждого batch;
- `FIX NOW | BACKLOG | KEEP` verdict.

## НЕ ИЗМЕНЯТЬ

- `frontend/src/**` product code;
- backend, API contracts, RBAC, routes, UX/business behavior;
- dependencies, Angular version, zone/zoneless, test runner;
- ESLint baseline/rules до evidence audit;
- текущий AUTH-305/deploy contour.

## КРИТЕРИИ ПРИЁМКИ

1. Audit покрывает все Angular source components/pages/services/templates.
2. Каждый finding имеет evidence и severity; search hit без manual proof не считается.
3. Для крупных компонентов есть аргументированный `extract|keep`, не line-count split.
4. P0/P1 batches имеют exact conflict keys и regression tests.
5. Нет предложения Signal Forms/Angular 22 API или новой зависимости.
6. Baseline команды и exit codes записаны.
7. Checklist заполнен; Cursor/PO review PASS до archive.
8. Lane reports не редактируют один файл параллельно; canonical report содержит
   batch assignment `lane: A|B` и не имеет пересекающихся conflict keys.

## ФИНАЛИЗАЦИЯ

Root docs-only TZ: checklist → review → archive/lock/progress → commit/push.
Product remediation начинает только TZ-FRONTEND-302 после PASS этого audit.
