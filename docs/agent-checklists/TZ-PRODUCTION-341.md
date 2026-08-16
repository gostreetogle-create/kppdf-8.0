# TZ-PRODUCTION-341 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-341.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor)
> Spec: `tasks/_archive/2026-08/TZ-PRODUCTION-341.done.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: composer-executor (kppdf-executor-loop)
- claimed_at: 2026-08-16T17:51:44Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in this environment; claim slot заполнен)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (338 DONE; root cause PREFETCH=8 vs Nest short 10/s)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-PRODUCTION-341-gantt-hydrate-throttle-429.md` был на месте

## Acceptance

- [x] PREFETCH_CONCURRENCY = 3 (was 8)
- [x] getProduct/getModule retry on 429/503 (backoff 300/800/1500); no retry on 404
- [x] unique-id prefetch + caches preserved; estimate math / PATCH / gantt-bars / BE throttle untouched
- [x] Spec: 429 once then 200 → success; concurrency ∈ [2,3]; bar ids unchanged
- [x] FE tsc + jest production-read.facade PASS (6/6)
- [x] Archive + PAGE-TZ-INDEX; commit+push own files; no deploy

## Integrity slot (до READY / archive)

- [x] Тип: page (`/production` hydrate throttle workaround)
- [x] FIC §A page.md + PAGE-TZ-INDEX; §B–E N/A; §F N/A
- [x] page.md / PAGE-TZ-INDEX touch
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите; conflict keys = facade + facade.spec (+ docs/archive)
- [x] Coupling map N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm test -- --testPathPattern="production-read.facade" --no-coverage` → PASS (1 suite / 6 tests)

## Executor report

- root cause: PREFETCH_CONCURRENCY=8 vs Nest short 10/s → 429 on products/modules
- fix: concurrency 3 + retry 429/503; BE throttle unchanged
- deploy: NOT RUN

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active` + root TZ
- [x] Status = DONE
- closed_at: 2026-08-16T17:55:00Z
