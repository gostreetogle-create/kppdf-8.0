# TZ-BACKEND-ORDER-ORG-SCOPE-TX checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-BACKEND-ORDER-ORG-SCOPE-TX.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T05:17:27Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Preflight

- [x] `git status` → main; чужие Freebuff-файлы (`frontend-nx/**`, `docs/agent-checklists/WAVE-*`) не тронуты
- [x] SoT прочитан: TZ, `docs/audits/2026-09-05-gantt-nx-l0-peer-review.md` (known_limitation после HARDEN), текущий `order.service.ts`/`order.controller.ts` (post-`448af9d9`)
- [x] Claim slot заполнен

## Сделано

### TX blast radius closed (4 метода)

`reserveStock`, `ship`, `cancel`, `remove` — все четыре из HARDEN's known_limitation.
Тот же паттерн, что в HARDEN: `@CurrentUser()` в контроллере → `organizationId` в
сервис → `assertOrgAccess(order, organizationId)` сразу после загрузки заказа
(внутри `sessionRunner.run` для первых трёх, через публичный `findById` для
`remove`), до любого side-effect (создание резервации/отгрузки, освобождение
резервации, soft-delete). Reused существующий `assertOrgAccess` — не менял
семантику (no-org-either-side-allow), не изобретал второй helper.

**Любопытная деталь, закрытая явно:** `ship()` уже принимал параметр
`organizationId?: string | null` до этой TZ — выглядел защищённым, но нигде не
проверялся. Контроллер уже передавал `user.organizationId` седьмым аргументом —
фикс был только в сервисе (добавить сам `assertOrgAccess` вызов), контроллер
`ship` не менялся.

### Regression-тесты

`order.service.spec.ts` — новый describe `org-scope hardening — transactional
writes (TZ-BACKEND-ORDER-ORG-SCOPE-TX)`, 8 тестов (cross-org reject + same-org
allow × 4 метода). **Verified fail-on-old-code:** `git stash` фикса
(`order.service.ts` + `order.controller.ts`) → suite **не компилируется**
(`TS2554`, все 8 новых тестов), затем `git stash pop` восстановил фикс — тот же
метод доказательства, что в `ff5cbad3`/`448af9d9`.

## Integrity slot

- [x] Тип изменения: backend security hardening — без нового route/permission/module; FIC N/A
- [x] Чужой WIP не в коммите (Freebuff на `frontend-nx` не тронут; случайно
      застейдженный `docs/agent-checklists/WAVE-NX-GANTT-POLISH.md` после
      `stash pop` — обнаружен и `git reset` до коммита)
- [x] Семантика `assertOrgAccess` (no-org-either-side-allow) не менялась

## Gates (факт)

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit  → PASS
cd backend && pnpm test  → PASS, 126 suites / 1187 tests (incl. 8 new)
cd backend && pnpm lint  → PASS, 0 errors (197 pre-existing warnings, none in touched files)
```

## Executor report

- 4 метода (`reserveStock`/`ship`/`cancel`/`remove`) теперь отклоняют cross-org
  caller ДО мутации/side-effect; same-org и legacy no-org caller работают как раньше.
- Это закрывает весь known_limitation из HARDEN — `OrderService` полностью
  org-scoped на запись (все write-пути, названные в peer-review audit, закрыты
  между `ff5cbad3` / `448af9d9` / этой TZ).
- Не тронул `frontend-nx/**` — конфликт с Freebuff отсутствует.
- Peer-review audit (`2026-09-05-gantt-nx-l0-peer-review.md`) обновлён строкой
  «TX blast radius closed too» со ссылкой на этот checklist/archive.

## Review handoff

- [x] Готово к архивации
