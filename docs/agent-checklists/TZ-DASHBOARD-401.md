# TZ-DASHBOARD-401 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-DASHBOARD-401.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: composer-executor-dashboard-401
- claimed_at: 2026-08-16T14:02:36.521Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task until sync; Claim slot filled)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на stats page
- [x] TZ / канон / deps прочитаны (NAV-303 DONE)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-DASHBOARD-401.md` на месте
- [x] HARD CONFLICT: **не** трогаем `dashboard.page.ts` / order/** / production/** / photos/**

## Acceptance

- [x] Home `/dashboard` = сводка RU (не Комбайн / не канбан)
- [x] Order KPI из GET `/orders` + ссылки `/orders`, `/design/combine`
- [x] Опц. склад pulse через aggregate `GET /inventory` (не unbounded N×list)
- [x] Loading / empty / error RU
- [x] Specs `dashboard-stats` + `dashboard.page` still PASS
- [x] Docs `docs/pages/dashboard.page.md` + PAGE-TZ-INDEX
- [x] КП open count: skipped (нет aggregate) → known_limit / optional TZ-DASHBOARD-402

## Integrity slot (до READY / archive)

- [x] Тип изменения: page
- [x] FIC §A (route/UI copy) — page.md + PAGE-TZ-INDEX
- [x] SECTION-READINESS: N/A (home уже в навигации; статус раздела не меняется)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (только stats page)
- [x] Coupling map: N/A (не трогали общее поле/статус Order.status write-path)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS EXIT 0
- `cd frontend && pnpm test -- --testPathPattern="dashboard-stats|dashboard.page" --coverage=false` → PASS 3 suites / 23 (dashboard.page untouched)

## Executor report

- Denser `/dashboard` Overview: order KPI section + warehouse pulse from GET `/inventory`.
- No kanban on home; Combine only linked to `/design/combine`.
- Conflict disclosure: Freebuff owns Combine board — `dashboard.page.ts` not touched.
- Known limit: КП open count deferred without aggregate API.

## Review handoff

- [x] PO prompt authorized claim + archive + push; self-review PASS

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T14:04:17.355Z
