# TZ-AUTH-306 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-AUTH-306.md`
> Commit/push: **YES after green gates; NO deploy**

## Claim slot

- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0
- team_room_claim:

## Preflight

- [ ] Точный `ADMIN_USERNAME` и единственный bootstrap admin подтверждены без вывода секрета
- [ ] Root/worktree, active map и conflict keys проверены
- [ ] Active marker создан до кода
- [ ] Backfill fail-closed, wipe/reseed запрещены

## Acceptance

- [ ] Ровно один immutable `isOwner=true`
- [ ] Owner не является ролью/permission
- [ ] Non-owner не перечисляет и не изменяет owner
- [ ] Role editor owner-only и скрыт от ordinary admin
- [ ] Owner full access + password break-glass
- [ ] Owner auth/enumeration/escalation tests PASS

## Integrity slot

- [ ] Тип: permission + auth + page
- [ ] FIC §A–E пройден
- [ ] admin users/roles page docs обновлены
- [ ] Чужой WIP исключён

## Gates

- [ ] backend tsc + owner/users/roles tests
- [ ] owner e2e
- [ ] frontend tsc + admin users/roles tests
- [ ] diff/review security invariants

## Review handoff

- [ ] READY FOR REVIEW; Cursor/PO PASS до archive

## Executor report (auto)

_(исполнитель заполняет ≤15 строк перед archive)_
