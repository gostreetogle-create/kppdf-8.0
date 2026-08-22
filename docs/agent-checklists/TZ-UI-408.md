# TZ-UI-408 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-UI-408-admin-dialog-font-tokens.md` (archived)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-23T00:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room CLI не обнаружен)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — чужие TEST-420/TZD-62 не пересекают keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UI-408-admin-dialog-font-tokens.md` на месте
- [x] `git fetch origin && git merge origin/main` → Already up to date

## Scope plan

- [x] Replace JetBrains Mono literal with `var(--font-mono)` in six dialogs
- [x] Raise dialog field labels from 10px to 11px without changing input 13px
- [x] Run FE typecheck and static acceptance checks

## Acceptance

- [x] No `JetBrains Mono` in six dialog components
- [x] No `font-size: 10px` in six dialog components
- [x] Input 13px and markup/API remain unchanged

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page
- [x] FIC §A–E: N/A (existing admin dialogs; no capability change)
- [x] page.md / PAGE-TZ-INDEX: existing `/admin/devices` entry already records UI-408; no change required
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- [x] `frontend/pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- [x] scoped static AC → PASS (0 `JetBrains Mono`, 0 `font-size: 10px`; input 13px retained)
- [x] `frontend/pnpm lint` → PASS, exit 0; 18 pre-existing warnings, 0 errors
- [x] browser live → N/A, no server/session available
- [x] review diff → PASS; only six conflict keys

## Executor report

- что сделано: admin dialog font tokens and micro labels normalized across six scoped components
- conflict disclosure: checkout содержит чужие изменения; stage только UI-408 keys
- known limits: live browser verification unavailable; deploy не выполнялся

## Review handoff

- [x] READY FOR REVIEW: N/A unless TZ requests
- [x] Archive выполнен после gates

## Closeout

- [x] archive + lock + checklist обновлены
- [x] Status = DONE
- closed_at: 2026-08-23
- sha: 546daf65
