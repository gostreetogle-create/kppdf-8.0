# TZ-PRODUCTION-340 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-340.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor)
> Spec: `tasks/_archive/2026-08/TZ-PRODUCTION-340.done.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: composer-executor (kppdf-executor-loop)
- claimed_at: 2026-08-16T17:46:30Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in this environment; claim slot заполнен)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (339 DONE)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-PRODUCTION-340-gantt-summary-header-tint.md` был на месте

## Acceptance

- [x] Expanded order summary (`gantt-order-group-start`) slightly darker/warmer wash than children
- [x] Dark: header slightly lighter/warmer than mid; meta-active still stronger
- [x] No chevron resize / estimate / PATCH changes
- [x] FE tsc + jest gantt-bars PASS (43/43)
- [x] Archive + PAGE-TZ-INDEX; commit+push own files; no deploy

## Integrity slot (до READY / archive)

- [x] Тип: page (`/production` Gantt CSS polish)
- [x] FIC §A page.md + PAGE-TZ-INDEX; §B–E N/A; §F N/A
- [x] page.md / PAGE-TZ-INDEX touch
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите; conflict keys = gantt-bars only (+ docs/archive)
- [x] Coupling map N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm test -- gantt-bars.component` → **43/43** PASS

## Executor report

- CSS-only group-start header tint + meta-active re-assert; +1 jest; no facade/PATCH/chevron.

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T17:50:00Z
