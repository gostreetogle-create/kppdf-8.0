# TZ-PARTY-301 checklist

> Status: **DONE** · Wave: WAVE-PARTY-DOCS #1
> Source: `tasks/_archive/2026-08/TZ-PARTY-301.done.md`

## Claim slot
- agent_id: agent-3e757640b7 (Cursor executor, this chat)
- claimed_at: 2026-08-08T18:47:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable — registry syncs only `tasks/*.md`, wave TZ lives in
  `tasks/_backlog/party-docs/` (same limitation as TZD-30)

## Acceptance
- [x] IDOR: чужой Counterparty / Organization → 404 (не 403), unit-покрыто
- [x] quickCreate всегда штампует `organizationId` из JWT; body-поля игнорируются
- [x] DELETE = реальный soft-delete (`deletedAt` в схеме), список и get не показывают удалённые
- [x] Глобальный unique на `Counterparty.inn` снят; уникальность per-tenant
      (`{organizationId, inn}` sparse unique) + миграция с отчётом коллизий
- [x] `innIsStub` + бейдж «временный» на `/counterparties` (+ счётчик в тулбаре)
- [x] «Наша фирма»: `Organization.isOurCompany` + `GET /organizations/current`

## Gates
- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS
- [x] `cd backend && pnpm exec jest --testPathPattern "(organization|counterparty|party)"` — PASS (31 tests)
- [x] `cd backend && pnpm exec eslint src/modules/counterparty src/modules/organization src/database/migrations/2026-08-08-TZ-PARTY-301-*` — 0 errors (45 pre-existing `any` warnings в spec-моках)
- [x] `cd frontend && pnpm run typecheck` — PASS
- [x] `cd frontend && pnpm run build:dev` — PASS (template typecheck)
- [x] `cd frontend && pnpm exec jest --runTestsByPath src/app/pages/counterparties/counterparties.page.spec.ts` — PASS (3 tests)

## Closeout
- [x] Archive `tasks/_archive/2026-08/TZ-PARTY-301.done.md` + lock + progress + ARCHITECTURE зона
- [x] Commit + push `origin/main`; deploy NO

## Evidence
- `backend/src/modules/counterparty/counterparty.service.ts` — `withoutTenantFields` (mass-assign
  guard), `tenantStamp` из JWT, `isVisibleTo` (404 на чужой tenant), quick-create ставит
  `innIsStub: true` и проверяет коллизию ИНН внутри своего tenant.
- `backend/src/modules/organization/organization.service.ts` — scope списка/get по
  `user.organizationId`, `findCurrent()` с явной ошибкой настройки вместо угадывания.
- `backend/src/database/migrations/2026-08-08-TZ-PARTY-301-party-hygiene.ts` — drop `inn_1`,
  отчёт дублей `{organizationId, inn}`, backfill `innIsStub`, разметка «нашей» Org; идемпотентна.
- `frontend/src/app/pages/counterparties/counterparties.page.ts` — бейдж «временный» через
  `cellTemplates.inn`; spec проверяет, что верифицированный ИНН остаётся без бейджа.

## known_limitation
- `Organization.inn` остаётся глобально unique: Org — это сам tenant, single-org политика.
- Полный FullEditor карточки контрагента / организации — TZ-PARTY-302 / 303.
- Восстановление soft-deleted записей (undelete UI) — вне этого TZ.
- Миграция не запускается автоматически на bootstrap: `npx ts-node backend/src/database/migrations/2026-08-08-TZ-PARTY-301-party-hygiene.ts` перед первым использованием на существующей базе.
