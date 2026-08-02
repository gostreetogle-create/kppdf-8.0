# TZ-BACKEND-SANITIZE-TRUSTED-TYPES — checklist исправления trustedTypes-блокера

Статус: DONE (commit см. ниже)

## Исходный блокер
`backend/src/common/sanitize-html.ts` строка:
```ts
const purify = DOMPurify(window as unknown as typeof globalThis);
```
dompurify v3.4.12 ожидает параметр `WindowLike` =
`Pick<typeof globalThis, …> & … & Pick<TrustedTypesWindow, 'trustedTypes'>`.
Каст в `typeof globalThis` терял обязательное поле `trustedTypes`:

- падал `pnpm exec tsc -p tsconfig.build.json --noEmit`;
- ts-jest (type-check при трансформации) ломал штатный `pnpm test:e2e` целиком;
- 4 unit-suites (document-template, text-block, template-block и др.),
  транзитивно импортировавшие sanitize-html, не компилировались.

## Почему каст в typeof globalThis был неверным
`typeof globalThis` не включает `trustedTypes` (обязательное поле
`WindowLike`), поэтому тип не присваивался параметру конструктора
DOMPurify. Это чисто тип-уровневый дефект: runtime не меняется.

## Почему WindowLike корректнее
`WindowLike` — официальный экспортируемый тип библиотеки dompurify,
описывающий ровно то, что библиотека читает из window (включая
Trusted Types). Каст `window as unknown as WindowLike` сохраняет
trusted-types protection в типах и не ослабляет sanitization.

## Изменённые файлы (перенесены из commit d228e44 в канонический main)
- `backend/src/common/sanitize-html.ts` — каст в `WindowLike`;
- `backend/src/common/sanitize-html.spec.ts` — новый, 8 unit-тестов
  на РЕАЛЬНЫЕ jsdom + dompurify (без passthrough-моков из
  `src/common/__mocks__/`): safe HTML сохраняется; `<script>` удаляется
  вместе с содержимым; `<iframe>`/`<object>`/`<embed>` удаляются;
  `javascript:`-URL вырезаются; inline-обработчики (onclick/onerror/
  onload/onmouseover) удаляются; `sanitizeBlockContent` оборачивает для
  парсинга, удаляет обёртку `<div>` и санитизирует внутри;
- `backend/jest.config.ts` — необходимая тестовая инфраструктура:
  - `moduleFileExtensions` + `mjs`;
  - transform `.mjs` через ts-jest с `allowJs`/`commonjs`;
  - `transformIgnorePatterns` whitelist ESM-only-пакетов jsdom-цепочки
    (`@asamuzakjp`, `@bramus`, `@csstools`, `@exodus/bytes`, `css-tree`,
    `lru-cache`, `parse5`, `entities`, `tough-cookie`) — Jest 29
    (CJS-рантайм) не может `require` их без трансформации.
    Whitelist завязан на pnpm-layout (`.pnpm/<pkg>@<ver>`) и на состав
    дерева зависимостей jsdom: при обновлении jsdom список нужно
    перепроверить. Transform-опции (allowJs/commonjs/esModuleInterop)
    применяются ко всем файлам проекта, не только к ESM-пакетам;
    эмпирически валидировано (все unit-тесты проходят), при желании
    можно сузить отдельным transform-энтри.

Безопасность не ослаблена: FORBID_TAGS/FORBID_ATTR/SAFE_FOR_TEMPLATES
нетронуты, `any` не использовался, реальные тесты вместо моков.

## Результаты проверок (канонический D:\kppdf-8.0)
- Backend typecheck: `pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- Targeted sanitizer jest: 8/8 PASS (реальная санитизация)
- Полный backend jest: 36 suites pass / 346 тестов pass; 1 suite
  (roles-admin.controller.spec.ts, 2 теста) падает. Фейл воспроизводится
  и БЕЗ sanitize-правок (stash-тест: jest.config + sanitize-html.ts
  откачены к HEAD, спеку перезапущен — тот же `.find(...).sort is not
  a function`). Важно: в дереве есть чужие незакоммиченные правки
  Admin/RBAC-зоны (roles-admin.controller.ts/.spec.ts — мок не содержит
  `.sort`), т.е. фейл независим от sanitize-фикса и живёт в чужой
  зоне работ — в scope не входит.
- Штатный E2E `pnpm test:e2e`: теперь ЗАПУСКАЕТСЯ (раньше блокировался
  на type-check). 22 suites / 116 тестов pass; 2 suites / 6 тестов fail.

## Remaining e2e harness failures (ОТДЕЛЬНАЯ задача)
- `backend/test/e2e/user-organizationId.e2e-spec.ts` (5 тестов):
  `imports: []` без AppModule → `app.get(Model)` бросает
  «Nest could not find Model element»; тела тестов пустые.
- `backend/test/e2e/production.e2e-spec.ts` (1 тест):
  `CreateProductionOrderDto.productId` аннотирован
  `@IsObjectId() @ToObjectId()`; `ToObjectId` конвертирует строку
  в `Types.ObjectId` до валидации, а `IsObjectId` требует string →
  400 «productId must be a 24-char hex ObjectId» даже для валидного id.
- Оба спека не модифицированы (преэкзистинг). Описано в
  `tasks/TZ-BACKEND-E2E-HARNESS.md` (OPEN, не архивировать).

Sanitizer-функциональность к этим фейлам не относится (спеки не
импортируют sanitize-html).

## MANUAL_BROWSER_CHECK_REQUIRED
Не требуется: изменение чисто серверное (типизация + unit/e2e harness).
Браузерный аудит Materials — отдельная задача вне этого scope.

## Известные ограничения
- `test/jest-e2e.json` продолжает использовать passthrough-моки
  dompurify/jsdom (moduleNameMapper) — это существующее поведение e2e,
  в рамках фикса не менялось; unit-тесты sanitizer проверяют реальную
  санитизацию отдельно.
- Локальные workaround-файлы прошлых сессий (`jest-e2e.local.json`,
  `jest.e2e.probe.json`) в каноническом дереве отсутствуют — нечего
  удалять, ничего не коммитилось.

## Commit
`fix(backend): resolve trusted types sanitizer test blocker`
(см. HEAD после коммита; перенос содержимого из worktree-commit d228e44).
