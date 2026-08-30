# TZ-NX-REGISTRY-UNITS-DELETE-FIX checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-REGISTRY-UNITS-DELETE-FIX.done.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-29T00:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] `tasks/_active/` проверен — пусто до этого claim, конфликтов нет
- [x] `git status --porcelain -- backend/src/modules/unit` — пусто до старта, чужого WIP нет
- [x] TZ прочитан (execution prompt, `tasks/TZ-NX-REGISTRY-UNITS-DELETE-FIX.md` в репо отсутствует — восстановлено в `tasks/_active/`)
- [x] Прочитаны discovery + read-slice archive, schema/service/controller/controller.spec, storage-item.service.ts precedent, DOCS-INTEGRITY.md (+ FIC §C)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS

## Acceptance

- [x] `UnitService.remove()`: non-system unit — реальное удаление (hard delete `deleteOne`), не soft-delete no-op
- [x] `isSystem` unit — DELETE по-прежнему отклоняется (400), документ не тронут
- [x] missing key — 404 через существующий `findByKey`, без изменений
- [x] Soft-delete plugin для Units НЕ включён (`softDelete: false` в schema не тронут — `unit.schema.ts` не менялся)
- [x] `organizationId` не добавлен
- [x] Permission keys / roles не изменены без доказанной необходимости (роли/декораторы `unit.controller.ts` не тронуты)
- [x] API path и DTO не изменены; GET/POST/PATCH поведение не изменено (только `remove()` в `unit.service.ts` изменён)
- [x] Regression tests: non-system удалён и не возвращается из list/get (+ ключ становится переиспользуемым); system unit не удаляется; missing key корректно обрабатывается
- [x] Изменения только в `backend/src/modules/unit/**` (unit.service.ts modified, unit.service.spec.ts new) + task/checklist/archive docs; `frontend/**`, `frontend-nx/**`, остальной `backend/**` не тронуты; новых зависимостей нет

## Integrity slot (до READY / archive)

- [x] Тип изменения: module (существующий backend-модуль, bug fix, без нового route/DTO/permission)
- [x] FIC §C: существующий модуль уже зарегистрирован/имеет schema-решение/Swagger/RBAC — из применимого: **Focused Jest на service** добавлен (`unit.service.spec.ts`, новый файл — до этой TZ отсутствовал); остальные пункты N/A (модуль не новый)
- [x] page.md / PAGE-TZ-INDEX: N/A — нет UI route, чисто backend-поведение
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys: `backend/src/modules/unit/**` — `git status --porcelain` до старта был пуст для этой зоны
- [x] Coupling map: N/A (не общее UI-поле/статус между экранами)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — **PASS** (0 ошибок, пустой вывод)
- `cd backend && pnpm test -- unit` — **PASS** 5/5 (2 suites: `unit.controller.spec.ts` 2/2 pre-existing, `unit.service.spec.ts` 3/3 new)
- `cd backend && pnpm lint` — **51 pre-existing errors / 198 pre-existing warnings** во всём backend (`{src,test}/**/*.ts`), **0 errors** в моих файлах; `unit.service.ts` — чисто; `unit.service.spec.ts` — 3 warnings `no-explicit-any` (тот же паттерн, что `dictionary-label.service.spec.ts`'s `model as any` в существующем коде); все error-строки в отчёте — в файлах, которые я не трогал (`product-passport.service.ts`, `query-product.dto.ts`, `rate-limit.service.ts`, `worker.service.spec.ts` и др., подтверждено `git status --porcelain` = пусто для них); тот же формат отчёта, что `TZ-CORE-302` ("pnpm lint → 47 pre-existing errors")
- `pnpm run architecture:check` — **3 pre-existing violations**, все в `frontend/src/app/pages/**` (`stock-movement-form-dialog.component.ts`, `material-form-dialog.component.ts`, `product-form-dialog.component.ts`) — вне разрешённой зоны (`backend/src/modules/unit/**`), подтверждено `git status --porcelain` = пусто для этих файлов; 0 violations в backend

## Executor report

**Что сделано:** `UnitService.remove()` (`backend/src/modules/unit/unit.service.ts`)
заменён с soft-delete-that-was-a-no-op (`updateOne({...}, {$set:{deletedAt: new Date()}})`
на схему без поля `deletedAt` и с `softDelete: false` — Mongoose strict
молча отбрасывал `$set`, документ не менялся) на настоящий hard delete
(`this.model.deleteOne({ _id: doc._id }).exec()`), с тем же комментарием-объяснением
и тем же fix-паттерном, что уже применён в `storage-item.service.ts` для
идентичного бага. Лог-сообщение `Unit soft-deleted` → `Unit deleted`.
`isSystem`-guard (400 до удаления) не тронут — стоит раньше hard-delete
вызова, как и раньше.

**Regression tests** (`unit.service.spec.ts`, новый файл, in-memory fake
Model, паттерн `query()`-хелпера как в `dictionary-label.service.spec.ts`,
но с реально мутирующим массивом `rows`, чтобы доказать исчезновение из
последующих чтений, а не просто факт вызова `deleteOne`):
1. non-system unit: `remove()` → `deleteOne` вызван с правильным `_id`,
   `findAll().items` пуст, `findByKey()` кидает `NotFoundException`,
   и — прямое доказательство исправления бага с уникальным индексом —
   `create({key: 'kg', ...})` теперь успешен (раньше ключ оставался
   заблокирован недо-удалённой записью).
2. system unit: `remove()` кидает `BadRequestException`, `deleteOne` не
   вызывается, документ остаётся доступен через `findByKey()`.
3. missing key: `remove()` кидает `NotFoundException` (через существующий
   `findByKey`), `deleteOne` не вызывается.

**GET/POST/PATCH не тронуты** — `findAll`, `findActive`, `findByKey`,
`create`, `update` не изменены (проверено diff — единственный изменённый
блок это `remove()`). `unit.controller.ts`, оба DTO, `unit.module.ts`,
`unit.schema.ts` не тронуты. Soft-delete plugin для Units по-прежнему
выключен (`softDelete: false` в schema), не включён и не обойдён —
исправление осталось строго в рамках "hard delete конкретно для Unit",
как и у прецедента `storage-item`.

**Известные ограничения:** нет — фикс изолирован, покрыт regression-тестами,
все требуемые gates зелёные или содержат только заведомо-чужие pre-existing
проблемы (задокументировано выше с точными путями и подтверждением через
`git status --porcelain`).

**Outcome: PASS.**

## Review handoff

- [x] Review diff перед закрытием (single-agent TZ, без wave review inbox) — `git diff -- backend/src/modules/unit/unit.service.ts` проверен: единственное изменение — `remove()`; `unit.service.spec.ts` — новый файл, только тесты

## Closeout (после PASS)

- [x] archive `tasks/_archive/2026-08/TZ-NX-REGISTRY-UNITS-DELETE-FIX.done.md`
- [x] удалить `tasks/_active/TZ-NX-REGISTRY-UNITS-DELETE-FIX.md`
- Status = DONE
- closed_at: 2026-08-29T00:00:00+03:00
