# TZ-BACKEND-E2E-HARNESS — DONE

**Статус:** DONE / fix + targeted verification
**Дата:** 2026-08-02
**Исполнитель:** Buffy
**Commit:** `a7943f82c8361a9d7ee78dbaed570327bb006afd`
**Title:** `fix(backend): TZ-BACKEND-E2E-HARNESS — IsObjectId accepts Types.ObjectId + real e2e tests`

## Summary

Два преэкзистинг-фейла штатного `pnpm test:e2e`, ставшие CI-blocking после того как TZ-150..165 убрали trustedTypes blocker в `sanitize-html.ts`. После фикса `pnpm test:e2e` реально запустился и проявил реальные баги harness'а.

### Корневые причины и фиксы

1. **`backend/test/e2e/user-organizationId.e2e-spec.ts`** — пустой `TestingModule({ imports: [] })` + `app.get(Model)` в `beforeAll` (DI failure) + пустые тела 5 тестов. **Фикс:** переписан на `createTestApp()` + `loginAsAdmin()`. 7 реальных тестов на TZ-238 контракт.
2. **`backend/test/e2e/production.e2e-spec.ts`** — 1 тест, fail на 400 для валидного productId. **Root cause:** `@IsObjectId()` (string-only regex 24-hex) + `@ToObjectId()` (class-transformer `Transform`) — order-of-operations bug: ValidationPipe `{transform: true}` применяет `@ToObjectId` ДО `@IsObjectId`, поэтому валидная 24-hex строка превращается в `Types.ObjectId` instance и отклоняется 400. **Канонический фикс:** расширить `IsObjectId` чтобы он принимал и `typeof === 'string'` (regex строгий), и `instanceof Types.ObjectId` (после `@ToObjectId()` transform). String-контракт остаётся строгим. Покрывает все 4 DTO с `@IsObjectId() @ToObjectId()` (production-order, order-task, work-type) без ослабления публичного HTTP контракта. Локально на production DTO оставлен `@IsObjectId()` без `@ToObjectId()` для `productId` (с comment), остальные 4 поля по-прежнему парятся.
3. **`backend/src/common/decorators/is-object-id.decorator.spec.ts`** — NEW unit spec, 4/4 pass (24-hex accepted, non-24-hex rejected, non-string non-ObjectId rejected, `new Types.ObjectId(...)` accepted).

## Verification log

| Gate | Result |
|------|--------|
| `pnpm exec jest ... user-organizationId production` | **12/12 PASS** in 11.9s (2 suites green, exit 0) ✅ |
| `pnpm exec jest --testPathPattern=is-object-id` | **4/4 PASS** in 2.1s ✅ |
| `pnpm exec tsc -p tsconfig.build.json --noEmit` | **PASS** exit 0 ✅ |
| `git diff --check` | PASS ✅ |
| Baseline control (4 files `git checkout HEAD` + spec deleted) | РОВНО 2 suites / 6 tests fail (5 user-org + 1 production) как в task файле — моя фикс-версия переводит обе в PASS ✅ |
| Полный `pnpm test:e2e` (24 suites) | 22 PASS, 2 FAIL (text-blocks + integration) — обе **out-of-scope** и **pre-existing baseline**, не моя регрессия (см. ниже) |

## Затронутые файлы (5)

```
backend/src/common/decorators/is-object-id.decorator.ts         (modified, +14/-1)
backend/src/common/decorators/is-object-id.decorator.spec.ts     (NEW, +39)
backend/src/modules/production-order/dto/create-production-order.dto.ts  (modified, +6/-1)
backend/test/e2e/user-organizationId.e2e-spec.ts                (rewritten, +137/-43)
backend/test/e2e/production.e2e-spec.ts                         (modified, +75/-30)
```

5 files changed, 232 insertions(+), 64 deletions(-).

## Pre-existing out-of-scope failures (NOT regressions)

- **`text-blocks.e2e-spec.ts`** — 6 POST-тестов fail (400 вместо 201). Корневая причина за пределами TZ: TZ-DOC-315 commit `43bda33 feat(text-block): add TextBlockCategory domain` уже в HEAD `db50743`. Сервис теперь требует `categoryId` (через `categoryService.resolveDefault`) если DTO его не передаёт; e2e-спек использует только legacy `category: 'legal'` и получает 400 «Default text-block category unavailable». Pre-existing baseline regression, появившаяся в результате TZ-DOC-315. Successor **TZ-DOC-318** «migration enum → categoryId» запланирован для починки spared text-blocks e2e.
- **`integration.e2e-spec.ts`** — 1 тест fail (`reserve-stock` 500 в полном прогоне). В **изоляции** PASS (1/1 in 7.6s). Order-dependent flake при `--runInBand` + `clearCollections + reserve-stock` race. Stash-тест подтвердил: 4 файла вне scope дают тот же флейк в полном прогоне. Не моя регрессия.

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| `jest ... user-organizationId production` → all tests pass | ✅ 12/12 |
| `pnpm test:e2e` → 0 failing suites | ⚠️ 2 suites fail (text-blocks, integration) — обе out-of-scope pre-existing |
| Тесты реально проверяют сценарии (не пустые комментарии) | ✅ user-org: 7, production: 4 |
| Единый контракт productId зафиксирован | ✅ string-only (regex 24-hex) + ObjectId-instance accepted post-transform |
| `pnpm exec tsc -p tsconfig.build.json --noEmit` clean | ✅ exit 0 |
| Browser check | NOT APPLICABLE (backend API E2E) |

## Связанные артефакты

- `STATUS.md` — entry 2026-08-02 — TZ-BACKEND-E2E-HARNESS DONE
- `progress.md` — entry 2026-08-02 — TZ-BACKEND-E2E-HARNESS DONE
- `docs/agent-checklists/TZ-BACKEND-E2E-HARNESS.md` — verification log заполнен
- `tasks/TZ-BACKEND-E2E-HARNESS.md` — оригинальный task, не удалён (историческая ссылка)
- Commit: `a7943f82c8361a9d7ee78dbaed570327bb006afd` (5 files / 232+/64−)

## Известные ограничения

- Полный `pnpm test:e2e` формально не даёт «0 failing suites». Это pre-existing baseline (text-blocks TZ-DOC-315 effect + integration order-flake), не регрессия от этого коммита. Successor TZ-DOC-318 запланирован.

[BACKUP-MARKER]
