# TZ-WORKERS-301 — «Люди»: единая backend-сущность на базе Worker

> Checklist (конвенция GEMINI.md / AI-AGENT-GUIDE). Создан до финализации, обновлён по результатам.

## Scope

Backend-контракт единого справочника людей (Layer 4, строго первым в цепочке Workers/WorkTypes):

- `backend/src/modules/worker/worker.schema.ts` — новые поля «Людей» + индексы.
- `backend/src/modules/worker/dto/` — create (whitelist, без organizationId), update (PartialType), find (NEW).
- `backend/src/modules/worker/worker.service.ts` — FK-валидация, envelope, IDOR, soft-delete, 409 email.
- `backend/src/modules/worker/worker.controller.ts` — роли, swagger, org из req.user, AuditAction.
- `backend/src/modules/worker/worker.module.ts` — wiring WorkType/Organization/User schema (TZ-DOC-315 паттерн).
- Спеки: worker.service.spec.ts (NEW), worker.controller.spec.ts (NEW), workers.e2e-spec.ts (NEW).

## Dependencies

- Референсы: data-model.md (Person — физлицо-контакт; Worker — сотрудник), TZ-09 (Employee+Worker), TZ-238/240 (organizationId sparse), TZ-315 (sparse-unique + whitelist + module wiring).
- Фундамент для TZ-WORKERS-302, TZ-WORKTYPES-301/302.

## Conflict keys

- `backend/src/modules/worker/*`
- `backend/src/modules/person/*` (только read: решение о консолидации)
- `backend/src/modules/user/*` (только read: user.organizationId, email)
- `backend/src/modules/work-type/work-type.schema.ts` (M2M — только чтение)
- `backend/src/modules/organization/organization.schema.ts` (contactPersonId — только чтение)
- `backend/test/e2e/workers.e2e-spec.ts` (NEW)
- `docs/data-model.md`

## Protected paths

- НЕ менять work-type модуль (мутации M2M — TZ-WORKTYPES-301).
- НЕ менять auth/user (пароль/логин — там, связь только чтением).
- НЕ менять frontend (TZ-WORKERS-302).
- НЕ трогать TZ-MODULES-*, TZ-PRODUCTS-*, TZ-DOC-*, Materials/ProductModule, Admin/RBAC, Z-backlog.
- НЕ менять package.json / lock-файлы.

## Решения (зафиксированы)

1. **Person НЕ консолидируется**: Organization.contactPersonId, Counterparty, OrganizationContact, EAV активно ссылаются на `persons` — миграция рискованна. Worker расширяется; консолидация → SUCCESSOR (в docs/data-model.md).
2. **IDOR**: organizationId ВСЕГДА из req.user (контроллер → сервис), НЕ из DTO (TZ-DOC-315 паттерн).
3. **Email**: lowercased; sparse-unique `{organizationId, email}` индекс + детерминированный сервисный pre-check (409).
4. **Soft delete**: deletedAt (counterparty-паттерн); findAll/findById исключают удалённые.
5. **Envelope** findAll `{items, total, page, limit}` + org-scope $or (своя + системные + legacy без области).

## Acceptance criteria (все выполнены)

1. Worker поддерживает: email, phone, position, department, grade, ratePerHour, workTypeIds[], supplierId?, managerOfSupplierIds?, userId?, organizationId? (sparse), deletedAt?, notes?, isActive. ✅
2. DTO валидируют email/phone и ObjectId-ссылки; 404 на битые ref; supplierId не-поставщик → 400. ✅
3. Старые Worker-записи без новых полей продолжают открываться (backward compat — unit-тест). ✅
4. Person-консолидация: решение зафиксировано по факту кода в docs (Worker расширен, Person остаётся, SUCCESSOR). ✅
5. `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — чисто. ✅
6. `cd backend && pnpm exec jest --no-coverage` — worker 24/24, полный 410/410 PASS; e2e workers 5/5 PASS. ✅
7. `git diff --check` — чисто; `bash OrchestratorKit/verify-status.sh` — PASS. ✅

## Тесты

- worker.service.spec.ts: create (валидный, битый workTypeIds 404, битый supplier 404, non-supplier 400, битый userId 404, email 409), findAll (envelope+soft-delete, search, workTypeId, clamp), update (IDOR 403, normalize email, 409), remove (soft-delete, legacy compat, IDOR 403).
- worker.controller.spec.ts: org из req.user, делегирование, RBAC-метаданные.
- workers.e2e-spec.ts: CRUD round-trip + envelope + soft-delete, 404 битый ref, 400 non-supplier, 409 email, whitelist-strip + invalid email.

## Browser-сценарий

MANUAL_BROWSER_CHECK_REQUIRED — backend-only задача; UI «Люди» реализуется в TZ-WORKERS-302.

## Known limitations

- Person → Worker консолидация — SUCCESSOR (не в этой задаче).
- Аккаунт-пользователя из карточки человека — SUCCESSOR (auth/user).
- e2e-харнесс (`test-db.ts`) ставит `whitelist` без `forbidNonWhitelisted` (production `main.ts` имеет оба) — неизвестное поле молча стрипуется в e2e, 400 в production; поведение задокументировано тестом.
