# TZ-UI-407 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-UI-407-catalog-filter-escape.md` (archived)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T23:15:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room CLI не обнаружен)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — чужой TZ-TEST-420 не пересекает keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UI-407-catalog-filter-escape.md` создан до product-кода
- [x] `git fetch origin && git merge origin/main` → Already up to date

## Acceptance

- [x] Escape closes filters on products, modules and materials
- [x] Filter panels use `role="region"`, not `role="dialog"`
- [x] Filter labels do not use `text-[9px]`/`text-[10px]` in touched panels
- [x] PAGE-TZ-INDEX records UI-407

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page
- [x] FIC §A–E: N/A (existing pages; no capability/module change)
- [x] page.md / PAGE-TZ-INDEX updated
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md учтён

## Gates (факт)

- [x] `frontend/pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- [x] `frontend/pnpm lint` → PASS, exit 0; 18 pre-existing warnings, 0 errors
- [x] manual/static AC → PASS (3 handlers, region roles, labels 11px)
- [x] browser live → N/A, no server/session available
- [x] review diff → PASS; чужой Desktop hunk не stage'ился

## Executor report

- что сделано: Escape handlers + region semantics + label tokens on three catalog pages; PAGE-TZ-INDEX updated
- conflict disclosure: checkout содержит чужие изменения; stage только UI-407 keys
- known limits: live browser verification unavailable; deploy не выполнялся

## Review handoff

- [x] READY FOR REVIEW: N/A unless TZ requests
- [x] Archive выполнен после gates

## Closeout

- [x] archive + lock + checklist обновлены
- [x] Status = DONE
- closed_at: 2026-08-22
