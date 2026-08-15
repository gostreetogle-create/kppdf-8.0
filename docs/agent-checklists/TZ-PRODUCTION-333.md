# TZ-PRODUCTION-333 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-333.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-grok-4.6-executor
- claimed_at: 2026-08-15T19:46:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root TZ not in kit room registry; Claim slot filled)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (active empty)
- [x] TZ / канон / deps прочитаны (331/332 DONE; GEMINI + PO-CANON)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-PRODUCTION-333.md` на месте (removed after archive)

## Acceptance

- [x] Drag/resize strip → release: no full Gantt flash/rebuild; bar stays put
- [x] Network fail (mock) → bar reverts + error toast; success toast absent on OK
- [x] Explicit «Обновить» still full reload
- [x] FE tsc + jest production-cockpit + gantt-bar.model PASS
- [x] page.md write-path matrix + archive + lock + commit/push (no deploy)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (UX write-path `/production` Gantt drag)
- [x] FIC §A–E: N/A — нет нового route/permission/module/MCP; обновлены page.md + PAGE-TZ-INDEX
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS N/A — статус раздела не менялся
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `frontend` `pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS (exit 0)
- `frontend` `pnpm exec jest --testPathPattern=gantt-bar.model.spec|production-cockpit.page.spec` — PASS 38 tests (exit 0)
- eslint owned files — PASS (1 pre-existing OnInit warning)

Primary signal: drag/resize release keeps bar in place; fail reverts + error toast — met (unit/page specs).
Secondary: tsc/jest/lint — PASS

## Executor report

Optimistic Gantt drag on three paths: silent PATCH, local bars, revert + error toast on fail. Meta save / catalog keep toast+reload. Per-orderId inFlight ignores overlapping commits. No BE, no deploy.

## Review handoff

- [x] N/A — TZ не требует Cursor Verdict перед archive (executor closeout)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T20:05:00Z
