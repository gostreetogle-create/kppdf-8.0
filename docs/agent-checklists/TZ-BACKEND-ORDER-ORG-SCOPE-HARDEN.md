# TZ-BACKEND-ORDER-ORG-SCOPE-HARDEN checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-BACKEND-ORDER-ORG-SCOPE-HARDEN.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T05:03:13Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Preflight

- [x] `git status` → main; только чужой `TZ-NX-REGISTRIES-CATALOG-SPEC-FIX.md` в `_active/` (Freebuff, frontend-nx) — не пересекается
- [x] SoT прочитан: TZ, `docs/audits/2026-09-05-gantt-nx-l0-peer-review.md` (P0 blast radius), текущий `order.service.ts`/`order.controller.ts` (post-`ff5cbad3`)
- [x] Claim slot заполнен

## Сделано

### Harden (4 названных + 1 найденный при аудите)

`update`, `setItemStatus`, `patchLineBoardLane`, `patchModuleLane` — как требовала
TZ: `@CurrentUser()` в контроллере → `organizationId` в сервис → `assertOrgAccess(doc,
organizationId)` сразу после `findByIdRaw`, до любой мутации/`save()`. Reused
существующий `assertOrgAccess` (не изобретал второй helper, семантику no-org-allow
не менял).

**Плюс `setLineReady`** — не входил в список TZ, но контроллер УЖЕ брал
`@CurrentUser()` (для `user.id`) — тривиальное расширение того же паттерна,
закрывает ещё один экземпляр того же класса бага почти бесплатно.

### Audit grep остальных write-методов (TZ п.4)

Прошёлся по всем `async` методам `order.service.ts`, ищущим мутацию + `findByIdRaw`/
`model.findById`. Помимо 5 исправленных, нашёл **4 непокрытых**:

- `reserveStock` (`this.model.findById(id).session(session).exec()`, внутри
  `sessionRunner.run` транзакции — не через `findByIdRaw`)
- `ship` (тот же паттерн; **любопытная деталь** — сигнатура УЖЕ принимает
  `organizationId?: string | null` параметром, но нигде его не использует —
  выглядит защищённым, но не защищён)
- `cancel` (тот же `session`-scoped `model.findById`)
- `remove` (`this.findById(id)` — публичный, тоже unscoped — затем `updateOne`)

**Known_limitation, не чинил:** все четыре — transaction-wrapped или
широко используемый `remove()`; фикс требует более осторожного отдельного прохода
(своя regression на каждый, session-моки сложнее). Записано в
`docs/audits/2026-09-05-gantt-nx-l0-peer-review.md` (P0 update) с точными
path:line — «blast radius closed» относится к 5 методам, названным TZ + 1 бонусный,
не ко всему модулю.

### Regression-тесты

`order.service.spec.ts` — новый describe `org-scope hardening`, 10 тестов
(cross-org reject + same-org allow × 5 методов). **Verified fail-on-old-code:**
`git stash` фикса → suite **не компилируется** (`TS2554`, для всех 10 новых тестов) —
тот же метод доказательства, что в `ff5cbad3`.

**Побочный эффект, тоже исправлен:** `order.controller.spec.ts` (отдельный файл,
юнит-тесты контроллера напрямую) перестал компилироваться после добавления
обязательного `@CurrentUser()` параметра в `patchLineBoardLane`/`patchModuleLane` —
обновлены вызовы + добавлен мок `USER: AuthenticatedUser`.

## Integrity slot

- [x] Тип изменения: backend security hardening — без нового route/permission/module; FIC N/A
- [x] Чужой WIP не в коммите (Freebuff на `frontend-nx` не тронут)
- [x] Семантика `assertOrgAccess` (no-org-either-side-allow) не менялась

## Gates (факт)

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit  → PASS
cd backend && pnpm test  → PASS, 126 suites / 1179 tests (incl. 10 new + controller-spec fix)
cd backend && pnpm lint  → PASS, 0 errors (197 pre-existing warnings, none in touched files)
```

## Executor report

- 5 методов (4 названных TZ + `setLineReady`) теперь отклоняют cross-org caller
  ДО мутации/`save()`; same-org и legacy no-org caller работают как раньше.
- 4 метода (`reserveStock`/`ship`/`cancel`/`remove`) остаются unscoped —
  задокументированы с точными path:line как known_limitation, не «тихо забыты».
- Не тронул `frontend-nx/**` — конфликт с Freebuff отсутствует.
- Peer-review audit (`2026-09-05-gantt-nx-l0-peer-review.md`) обновлён строкой
  «blast radius closed» со ссылкой на этот checklist/archive.

## Review handoff

- [x] Готово к архивации
