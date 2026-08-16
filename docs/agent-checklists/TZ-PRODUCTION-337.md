# TZ-PRODUCTION-337 checklist

> Status: **DONE**
> Marker: _(removed — archived)_
> Commit/push: по `docs/GIT-POLICY.md`
> Spec: `tasks/_archive/2026-08/TZ-PRODUCTION-337.done.md`
> closed_at: 2026-08-16T09:50:00Z

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: agent-3e757640b7 (frontend executor)
- claimed_at: 2026-08-16T09:44:36Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-PRODUCTION-337; sync tasks first)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (CATALOG-375 materials; PHOTO-304 photos)
- [x] TZ / канон / deps прочитаны (`TZ-PRODUCTION-337-workshop-exclude-draft.md`, COUPLING-MAP, AI-AGENT-GUIDE)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-PRODUCTION-337.md` на месте

## Acceptance

- [x] `ACTIVE_COMMERCIAL_ORDER_STATUSES` === `['confirmed','in_production','ready']`
- [x] `filterOrdersForRail(..., {activeOnly:true, selectedOrderId:null})` не возвращает `status==='draft'`
- [x] `confirmed` / `in_production` / `ready` при activeOnly видны (если не `isActive===false`)
- [x] Комбайн / dashboard не трогали
- [x] page.md + COUPLING-MAP: draft ≠ цех «Все активные»
- [x] Integrity slot: Coupling map не N/A

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (`/production` rail filter) + other (coupling map sync)
- [x] FIC §A page.md + PAGE-TZ-INDEX; §B–E N/A (нет permission/BE/MCP); §F N/A (не общее новое поле — смысл ACTIVE сужен)
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS N/A (фильтр студии, не статус раздела)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (CATALOG-375 / PHOTO-304 не трогали)
- [x] Coupling map: `docs/COUPLING-MAP.md` обновлён — код = канон
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS

cd frontend && pnpm exec jest --testPathPattern="gantt-bar.model|production-cockpit.page|orders-rail" --no-coverage
→ PASS — 3 suites / 53 tests
```

## Executor report (auto)

- task: TZ-PRODUCTION-337
- outcome: DONE (Cursor Verdict PASS)
- what: ACTIVE set без `draft`; rail/gantt filter specs; docs page + COUPLING-MAP synced; archive + lock
- conflict disclosure: none vs CATALOG-375 / PHOTO-304
- known limits: deep-link `?orderId=` на draft по-прежнему показывает выбранный (selected bypass) — out of scope
- deploy: NOT RUN

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor Verdict PASS → archive

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T09:50:00Z
