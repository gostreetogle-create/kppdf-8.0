# TZ-WORKERS-301 — DONE (единая сущность «Люди/Сотрудники» — backend контракт)

**Date:** 2026-08-02
**Outcome:** DONE — Worker расширен до единого справочника людей; Person НЕ консолидирован (по факту кода: активные зависимости) — SUCCESSOR зафиксирован.
**Layer:** 4 (backend only). Frontend НЕ изменён (TZ-WORKERS-302).

## Консолидация Person → Worker (решение по факту кода)

Person НЕ переносится в Worker: `Organization.contactPersonId` (ref: 'Person'),
`Counterparty`, `OrganizationContact`, EAV-контроллер активно ссылаются на
`persons` — миграция рискованна без отдельной задачи. Вместо этого Worker
расширен до единой «Люди»-сущности (backward-compatible), а консолидация
Person → Worker вынесена в **SUCCESSOR** (зафиксировано в docs/data-model.md).

## Изменённые файлы (10)

| Файл | Δ |
|---|---|
| `backend/src/modules/worker/worker.schema.ts` | +email (sparse index), position, supplierId?, managerOfSupplierIds?, userId?, organizationId? (sparse), deletedAt?, notes?, isSystem?; индекс `{ organizationId: 1, email: 1 }` sparse-unique |
| `backend/src/modules/worker/dto/create-worker.dto.ts` | +email (@IsEmail), position, supplierId/managerOfSupplierIds/userId/personId (@IsObjectId), notes, isSystem; whitelist-only; organizationId НЕ из DTO (IDOR) |
| `backend/src/modules/worker/dto/update-worker.dto.ts` | PartialType(CreateWorkerDto) — новые поля автоматически |
| `backend/src/modules/worker/dto/find-workers.dto.ts` | NEW: page/limit/search/isActive/supplierId/workTypeId (defaults/clamps TZ-278: page≥1, 1≤limit≤100) |
| `backend/src/modules/worker/worker.service.ts` | FK-валидация (404 на битые ref; supplierId не-поставщик → 400), findAll envelope {items,total,page,limit} + org-scope $or + search, IDOR-guard (org всегда из req.user; update/remove/findById 403 на чужую область), soft-delete (deletedAt), email pre-check (409, детерминированный) + 11000 backstop |
| `backend/src/modules/worker/worker.controller.ts` | read @Roles('admin','manager','user'), мутации @Roles('admin','manager'), org-scope через @Req, Swagger-аннотации, AuditAction на все мутации |
| `backend/src/modules/worker/worker.module.ts` | MongooseModule.forFeature для WorkType/Organization/User schema (TZ-DOC-315 wiring, без circular deps) |
| `backend/src/modules/worker/worker.service.spec.ts` | NEW: 18 unit-тестов (create FK/409/400, findAll envelope/search/filter/clamp, IDOR 403, soft-delete, legacy backward-compat) |
| `backend/src/modules/worker/worker.controller.spec.ts` | NEW: 6 unit-тестов (org из req.user, делегирование, RBAC-метаданные) |
| `backend/test/e2e/workers.e2e-spec.ts` | NEW: 5 e2e-тестов (CRUD round-trip + envelope + soft-delete, 404 битый ref, 400 non-supplier, 409 email pre-check, whitelist-strip + invalid email) |

## Гейты (все зелёные)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — **exit 0**
- `pnpm exec jest --no-coverage --runInBand --testPathPattern "worker"` — **2 suites / 24 tests PASS**
- `pnpm exec jest --no-coverage --runInBand` (полный) — **43 suites / 410 tests PASS**
- `pnpm run test:e2e test/e2e/workers.e2e-spec.ts` — **5/5 PASS** (Mongo 7 docker поднят, replicaSet rs0)
- `git diff --check` — clean (только LF↔CRLF warnings, git нормализует)
- `bash OrchestratorKit/verify-status.sh` — **PASS**

## Code review (независимый)

Ревьюер (code-reviewer-deepseek-flash): P0/P1 — 1 замечание исправлено:
**P1: `GET /workers/:id` не проверял org-scope** (кросс-org чтение по известному
ID). Исправлено: `findById(id, organizationId)` теперь вызывает
`assertSameScope` — 403 на чужую область; контроллер передаёт org из req.user;
controller spec обновлён. **P2: `normalizeEmail(null)`** (null проходит
@IsOptional) давал TypeError → 500. Исправлено: `email == null → undefined`.
После фиксов все гейты перезапущены — зелёные.

## Person-консолидация — SUCCESSOR

- Зафиксировано в `docs/data-model.md`: Worker — единая «Люди»-сущность;
  Person остаётся отдельной сущностью (Organization.contactPersonId и др.).
- SUCCESSOR: миграция Person → Worker + перенацеливание contactPersonId
  (принимать оба ref) — отдельная задача, не выполнена в этой.

## Что НЕ изменялось намеренно

- `backend/src/modules/person/*` — Person остаётся (активные зависимости);
- `backend/src/modules/work-type/*` — M2M-мутации в TZ-WORKTYPES-301;
- `backend/src/modules/user/*` — пароль/логин там, связь только чтением;
- frontend (TZ-WORKERS-302), TZ-MODULES-*, TZ-PRODUCTS-*, TZ-DOC-*;
- Materials/ProductModule, Admin/RBAC (TZ-278), Z-backlog, sanitize-html;
- package.json / lock-файлы.

## Lock

`.mimocode/locks/TZ-WORKERS-301-people-backend-entity.lock` — создан, gitignored.

## Conventional commit (push НЕ выполнялся — ждёт владельца)

`feat(workers): consolidate People backend entity — TZ-WORKERS-301`
