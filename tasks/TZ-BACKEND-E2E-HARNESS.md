# TZ-BACKEND-E2E-HARNESS — починка двух падающих e2e-спеков

Статус: OPEN (не архивировать до реализации)

## Контекст
Задача возникла после исправления trustedTypes-блокера
(fix(backend): resolve trusted types sanitizer test blocker).
Раньше штатный `pnpm test:e2e` полностью блокировался на type-check
(`sanitize-html.ts`), поэтому эти спеки вообще не запускались.
После фикса E2E реально работает, и проявились два преэкзистинг-фейла
harness'а, не связанных с sanitizer-функциональностью.

## Точные файлы
- `backend/test/e2e/user-organizationId.e2e-spec.ts` (5 тестов)
- `backend/test/e2e/production.e2e-spec.ts` (1 тест)

## Failing command
```bash
cd backend && pnpm test:e2e
```
(jest --config ./test/jest-e2e.json --runInBand --forceExit)

Итог на момент обнаружения: 22 suites / 116 тестов pass,
2 suites / 6 тестов fail.

## Точные причины

### 1. user-organizationId.e2e-spec.ts
- `Test.createTestingModule({ imports: [] })` — AppModule не подключён,
  Mongoose-модели не зарегистрированы в DI-контексте.
- `app.get(Model)` бросает «Nest could not find Model element (this
  provider does not exist in the current context)» ещё в `beforeAll`.
- Тела всех 5 тестов пустые (только комментарии) — покрытия нет.

Ожидаемое исправление: использовать `createTestApp()` из
`backend/test/setup/test-db` (как в остальных e2e-спеках) и написать
реальные тела тестов TZ-238 (POST /users → 400/201, POST /auth/login
orgId claim, GET /auth/me, JWT decode).

### 2. production.e2e-spec.ts
- `CreateProductionOrderDto.productId` аннотирован
  `@IsObjectId() @ToObjectId()`.
- `ToObjectId()` (class-transformer `Transform`) конвертирует строку
  в `Types.ObjectId` ПЕРЕД запуском class-validator.
- `IsObjectId()` требует `typeof value === 'string'` и regex 24-hex.
- Итог: любой валидный productId превращается в ObjectId и отклоняется
  400 «productId must be a 24-char hex ObjectId».
- Подтверждено probe-запуском: POST /api/products → 201 с валидным
  `_id`; POST /api/production-orders с этим `_id` → 400.

Ожидаемое исправление (выбрать и зафиксировать в тестах):
- убрать `@ToObjectId()` из productId (оставить строковый контракт),
  либо
- переписать `IsObjectId` так, чтобы принимать `Types.ObjectId`,
  либо
- использовать стандартный `@IsMongoId()` (он принимает оба типа),
  согласовав с конвенцией проекта.

## Acceptance criteria
- [ ] `pnpm exec jest --config ./test/jest-e2e.json --runInBand --forceExit user-organizationId production` — все тесты pass
- [ ] `pnpm test:e2e` — 0 падающих suites
- [ ] Тела тестов реально проверяют сценарии (не пустые комментарии)
- [ ] Выбран единый контракт productId (строковый или ObjectId) зафиксирован в тестах
- [ ] `pnpm exec tsc -p tsconfig.build.json --noEmit` — чисто

## Важно
Sanitizer-функциональность к этой задаче НЕ относится: `sanitize-html`
проходит unit-тесты (8/8) и не импортируется падающими спеками.
