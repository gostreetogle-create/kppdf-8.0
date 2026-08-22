# TZ-SALES-381 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-SALES-381-multipage-text-wrap-capacity.md` (archived)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T22:45:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room CLI не обнаружен)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — чужой TZ-TEST-420 не пересекает keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-SALES-381-multipage-text-wrap-capacity.md` создан до product-кода
- [x] `git fetch origin && git merge origin/main` → Already up to date

## Acceptance

- [x] Short lines retain one unit of capacity
- [x] Long productName/description consumes extra capacity, capped at 3 extra units
- [x] Manual `rowsFirstPage`/`rowsNextPage` uses the same weighted capacity
- [x] Existing header-drop behavior remains green

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: module
- [x] FIC §A–E: N/A (existing backend module behavior; no new module/capability)
- [x] page.md / PAGE-TZ-INDEX: N/A (no UI changes required)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md учтён

## Gates (факт)

- [x] `backend/pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- [x] `backend/pnpm exec jest --runInBand document-template.continuation.spec` → PASS, 3/3
- [x] browser/UI → N/A, backend-only scope
- [x] review diff → PASS

## Executor report

- что сделано: weighted preview line capacity + focused short/long continuation coverage
- conflict disclosure: checkout содержит чужие изменения; stage только SALES-381 keys
- known limits: exact browser wrap intentionally conservative at 36 characters; deploy не выполнялся

## Review handoff

- [x] READY FOR REVIEW: N/A unless TZ requests
- [x] Archive выполнен после gates

## Closeout

- [x] archive + lock + checklist обновлены
- [x] Status = DONE
- closed_at: 2026-08-22
