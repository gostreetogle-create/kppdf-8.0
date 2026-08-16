# TZ-PRODUCTION-338 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-338.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor)
> Spec: `tasks/_archive/2026-08/TZ-PRODUCTION-338.done.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff (deepseek-v4-pro) → closeout composer-executor
- claimed_at: 2026-08-16T20:55:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in this environment; claim slot заполнен)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-PRODUCTION-338-gantt-hydrate-parallel.md` был на месте (removed on archive)

## Acceptance (из TZ)

- [x] Same filtered orders → same Gantt bar set (ids, start/end days, worker labels) as before for fixtures
- [x] Unique products/modules for a multi-order load fetched concurrently (no pure sequential chain)
- [x] First bars appear without waiting for full thumb map; thumbs fill in after
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [x] focused jest `production-read.facade` + `production-cockpit.page` PASS (2 suites / 27)
- [x] Archive + progress + PAGE-TZ-INDEX touch; no deploy

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (`/production` hydrate perf)
- [x] FIC §A page.md + PAGE-TZ-INDEX; §B–E N/A (нет permission/BE/MCP); §F N/A (не общее новое поле)
- [x] page.md / PAGE-TZ-INDEX обновлены (perf-строка в page.md; 338 DONE в индексе)
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (только production facade/page + их specs + docs; **не** gantt-bars / 339)
- [x] Coupling map: `docs/COUPLING-MAP.md` N/A (оценка/эст. формулы не менялись; только порядок фетчей)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0)
- `cd frontend && pnpm test -- --testPathPattern="production-read.facade|production-cockpit.page" --no-coverage` → PASS (2 suites / 27 tests)

## Executor report

- baseline Network: 10 product + 19 module GETs (33 API), module waterfall строго последовательный, last catalog response ≈ 4.5s
- what: параллельный prefetch уникальных product/module ids (bounded concurrency 8, cache+inflight reuse); thumbs не блокируют bars
- known limits: destroy по-прежнему чистит кэши (successor); BE batch — не в этом TZ
- deploy: NOT RUN

## Review handoff

- [x] N/A — TZ не требует Cursor Verdict перед archive
- [x] Archive after green gates

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active` + root TZ
- [x] Status = DONE
- closed_at: 2026-08-16T21:05:00+03:00
