# Checklist — TZ-AUTH-RBAC-ROLE-PERMS

> Status: **DONE**
> Spec: `tasks/TZ-AUTH-RBAC-ROLE-PERMS.md`
> Wave: `docs/agent-checklists/WAVE-AUTH-RBAC.md`

## Claim slot (до кода)

- agent_id: `buffy-gpt-5.6-luna`
- claimed_at: `2026-08-31T20:00:00+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable

## Preflight

- [x] Нет чужого CLAIM на те же backend keys
- [x] Не трогать frontend-nx (DCI Freebuff #1)
- [x] Прочитал TZ + существующий WIP diff
- [x] Claim + `tasks/_active/TZ-AUTH-RBAC-ROLE-PERMS.md`

## Acceptance

- [x] Guard использует permissions роли (+ overrides), не пустой user-only
- [x] `/auth/me` effectivePermissions совпадает с guard
- [x] Specs: admin / manager / deny override
- [x] Backend tsc + full Jest PASS; full lint имеет только baseline-ошибки вне RBAC scope

## Integrity

- [x] Тип: module (auth)
- [x] FIC §B: N/A — permission seed не изменялся
- [x] `docs/RBAC-CONTRACT.md`: N/A — canonical algorithm не изменялся
- [x] Чужой FE WIP не в коммите

## Gates (факт)

- [x] tsc: exit 0 (`pnpm exec tsc -p tsconfig.build.json --noEmit`)
- [x] test: exit 0 (`119 suites / 1112 tests`)
- [x] target lint: exit 0 (изменённые auth/RBAC-файлы)
- [ ] repository lint: exit 1 — 45 pre-existing errors и 200 warnings вне scope

## Изменения

- `backend/src/common/contracts/rbac-contract.ts` — role permissions в auth user shape
- `backend/src/common/guards/permissions.guard.ts` — effective permissions из user overrides + persisted role permissions
- `backend/src/modules/auth/strategies/jwt.strategy.ts` — hydration permissions роли из БД
- `backend/src/modules/auth/auth.service.ts` — `/auth/me` и login payload через canonical merge
- `backend/src/modules/auth/auth.module.ts` — экспорт `JwtStrategy` для DI
- соответствующие regression specs для guard, JWT и `/auth/me`

## Executor report (auto)

```text
outcome: DONE with repository-lint baseline limitation documented
commit: b3607871
gates: tsc PASS; Jest PASS (119 suites / 1112 tests); target lint PASS; full lint FAIL on 45 unrelated errors
archive: tasks/_archive/2026-08/TZ-AUTH-RBAC-ROLE-PERMS.done.md
```
