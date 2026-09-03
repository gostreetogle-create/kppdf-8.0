# TZ-NX-SALES-S30-CURRENCY-RUB checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-SALES-S30-CURRENCY-RUB.md`
> Commit/push: required after green gates and archive

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-03T05:27:00+03:00
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable (continuous executor has no Team Room confirmation in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `/d/kppdf-8.0` / `D:/kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — до claim был только `.gitkeep`, S30 keys свободны
- [x] TZ / канон / deps прочитаны: S30 TZ, sales roadmap, currency seed/schema/service, executor/context-preflight skills
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SALES-S30-CURRENCY-RUB.md` на месте

### Preflight Check Output

- **Context read:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/architecture/nx-sales-canon-roadmap.md`, `backend/src/common/seed/currencies.seed.ts`, `backend/src/modules/currency/currency.schema.ts`, `backend/src/modules/currency/currency.service.ts`
- **Key Constraints:** backend-only seed change; preserve historical USD/EUR records by deactivation; no UI, invoice, payment, or order changes.
- **Planned Deliverable:** RUB-only defaults, idempotent deactivation of USD/EUR, focused regression test, backend gates, archive and point commit/push.
- **Validation Path:** focused Jest, backend tsc, backend lint, diff review; FIC §C/§F and page docs are N/A because this changes an existing bootstrap seed only and adds no API/page/status field.

## Acceptance

- [x] `DEFAULT_CURRENCIES` contains only RUB.
- [x] Bootstrap deactivates existing USD/EUR without hard-delete.
- [x] Repeated bootstrap does not recreate USD/EUR.
- [x] Focused seed regression tests pass.
- [x] Backend typecheck passes.
- [x] Backend lint passes.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: `other` (existing backend bootstrap seed; no new module/API)
- [x] FIC §A–E и §F: N/A с причиной: no route, permission, module, MCP, or shared status field changed
- [x] page.md / PAGE-TZ-INDEX: N/A (нет UI route)
- [x] SECTION-READINESS: N/A (нет пользовательского контура)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A (не трогал общее поле/статус)
- [x] Канон: `docs/DOCS-INTEGRITY.md` соблюдён

## Gates (факт)

- baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS, exit 0; existing Angular CSS budget warnings only
- backend focused tests: `cd backend && pnpm test -- src/common/seed/currencies.seed.spec.ts --runInBand` — PASS, 2 tests
- backend typecheck: `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS
- backend lint: `cd backend && pnpm exec eslint src/common/seed/currencies.seed.ts src/common/seed/currencies.seed.spec.ts` — PASS
- review diff: PASS; only S30 implementation/test/checklist/archive/wave paths selected, pre-existing dirty files excluded

## Executor report

- status: DONE
- planned: change only the currency seed and focused seed spec; preserve unrelated dirty worktree files
- conflict disclosure: pre-existing dirty worktree changes are unrelated; stage only S30 paths; `.mimocode/locks/` is gitignored and remains local
- known limits: existing USD/EUR records are retained and made inactive; no production data or deploy operation

## Review handoff

- [x] READY FOR REVIEW in wave inbox (not required by S30 TZ)
- [x] Cursor/PO Verdict PASS (not required by S30 TZ)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-03T05:31:00+03:00

## Executor report (auto)

- acceptance: PASS
- archive: `tasks/_archive/2026-09/TZ-NX-SALES-S30-CURRENCY-RUB.done.md`
- lock: `.mimocode/locks/TZ-NX-SALES-S30-CURRENCY-RUB.lock` (local; ignored by Git)
- commit/push: pending at checklist close; wave SHA is recorded after push
