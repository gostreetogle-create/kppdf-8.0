# TZ-DESK-418 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-DESK-418-desk-order-delete.md` (archived)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T22:15:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room CLI не обнаружен)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-DESK-418-desk-order-delete.md` создан до product-кода
- [x] `git fetch origin && git merge origin/main` → Already up to date

## Acceptance

- [x] Delete control exists in desk order row with `data-test="desk-order-delete"`
- [x] Delete click does not toggle order expansion
- [x] Confirm is required before `OrdersService.remove`
- [x] Confirmed delete reloads list and clears matching expanded order

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page
- [x] FIC §A–E: N/A (existing page behavior; no new capability)
- [x] page.md / PAGE-TZ-INDEX updated
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A (same order soft-delete write-path)
- [x] Канон: docs/DOCS-INTEGRITY.md учтён

## Gates (факт)

- [x] `frontend/pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- [x] `frontend/pnpm exec jest --config jest.config.js --runInBand --testPathPattern=manager-desk.page.spec` → PASS, 25/25
- [x] `frontend/pnpm lint` → PASS, exit 0; 18 pre-existing warnings, 0 errors
- [x] browser live → N/A, known limitation из TZ
- [x] review diff → PASS

## Executor report

- что сделано: desk delete action + shared confirm/write-path + regression test + page docs/index
- conflict disclosure: checkout содержит чужие изменения; stage только DESK-418 scope
- known limits: live browser smoke не выполнялся по known limitation; deploy не выполнялся

## Review handoff

- [x] READY FOR REVIEW: N/A unless requested by TZ
- [x] Archive выполнен после gates

## Closeout

- [x] archive + lock + checklist + page docs + `_NOW` обновлены
- [x] Status = DONE
- closed_at: 2026-08-22
