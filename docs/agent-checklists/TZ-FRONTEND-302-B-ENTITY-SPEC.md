# TZ-FRONTEND-302-B-ENTITY-SPEC checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-FRONTEND-302-B-ENTITY-SPEC.md`
> Lane: B · Parent: TZ-FRONTEND-302 (umbrella, Lane A-owned — не редактирую)
> Canon: `docs/audits/2026-08-15-angular-component-integrity.md` @ `405cb71d51f56b21e694a0781ca3f82d30c6702d`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy-TZ-FRONTEND-302-B
- claimed_at: 2026-08-15T05:50:00Z
- workspace: D:\kppdf-8.0 (isolated worktree `.worktrees/TZ-FRONTEND-302-B`, branch `feature/TZ-FRONTEND-302-B`)
- team_room_claim: no — Team Room CLI недоступен; claim виден другим worktrees через pushed feature branch (B-TOOLING pushed `c58a7da2`)

## Preflight

- [x] Worktree чистый после B-TOOLING commit/push
- [x] Нет чужого CLAIM на key `frontend/src/app/shared/dsl/entity/entity-service.spec.ts` (только Lane B batch)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-FRONTEND-302-B-ENTITY-SPEC.md` на месте

## Acceptance (из canonical audit B-ENTITY-SPEC)

- [x] `entity-service.spec.ts` не импортирует `pages/users` entity — локальный fixture (`defineEntity<User>({ endpoint: '/users', idKey: '_id' })`)
- [x] Те же typed CRUD assertions сохранены (18/18 PASS до и после)
- [x] Нет изменения page files / API behavior
- [x] Фокусированный spec PASS; tsc/lint/architecture unchanged PASS
- [x] `git diff --check` PASS
- [x] Отдельный commit/push + evidence

## Integrity slot

- [x] Тип изменения: test-only (shared DSL spec fixture)
- [x] FIC §A–E: N/A (нет product code / page / permission изменения)
- [x] page.md / PAGE-TZ-INDEX: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Root cause (B-ENTITY-SPEC)

`entity-service.spec.ts:8` импортировал `Users`/`User` из
`../../../pages/users/users.entity` — test-only shared→page dependency.
`scripts/architecture-check.mjs:30-33` исключает `.spec.ts`, поэтому checker
проходил, но тестовая граница оставалась связанной. Production DSL page-neutral.

Fix: локальный fixture entity (тот же контракт: endpoint `/users`, idKey `_id`,
тип User) внутри shared spec; все assertions без изменений.

## Gates (факт)

- [x] `cd frontend && pnpm exec jest --runInBand --runTestsByPath src/app/shared/dsl/entity/entity-service.spec.ts` → **PASS, 18/18** (baseline 18/18 до правки)
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS, exit 0**
- [x] `cd frontend && pnpm exec eslint src/app/shared/dsl/entity/entity-service.spec.ts` → **PASS**
- [x] `pnpm architecture:check` → **PASS** (936 files; baseline 6; resolved since baseline: 0)
- [x] `git diff --check` → **PASS**
- Browser: N/A (test-only)

## Executor report

- B-ENTITY-SPEC выполнен: shared DSL spec больше не зависит от page-domain
  entity; локальный fixture повторяет контракт users.entity 1-в-1
  (`endpoint: '/users'`, `idKey: '_id'`, `interface User`). Ни один page file,
  production DSL или API behavior не изменён. Conflict keys: только один spec-файл.

## Review handoff

- [x] READY FOR REVIEW — child batch; umbrella/audit — Lane A
- [x] Не archive до Cursor/PO PASS (umbrella final)

## Closeout (после PASS umbrella)

- [ ] archive + lock + удалить `_active` marker
