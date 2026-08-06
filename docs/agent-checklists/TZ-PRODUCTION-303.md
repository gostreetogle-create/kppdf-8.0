# TZ-PRODUCTION-303 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-303.done.md`
> Commit/push: scoped commits only (no `git add .`)

## Claim slot

- agent_id: cursor-composer
- claimed_at: 2026-08-06T17:53:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Windows host; claim via `_active` + checklist)
- closed_at: 2026-08-06T18:45:00Z

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] `_active-map.md` + `tasks/_active/` — no conflicting CLAIM on routes/layout
- [x] TZ + audit A–J + design spec read
- [x] Claim slot filled
- [x] `tasks/_active/TZ-PRODUCTION-303.md` removed on archive

## Acceptance

- [x] `/production` opens; nav «Производство» (page ACL admin/director/manager)
- [x] Orders rail: 7 status labels; «Все активные» = draft/confirmed/in_production/ready
- [x] Select order focuses Gantt; empty state RU
- [x] Bars from Order → Product → Module → WorkType.days; legend «План-оценка»
- [x] Quantity `×N` display only (no duration multiply)
- [x] null/0/invalid days → no-term striped; no estimatedHours conversion
- [x] No ProductionOrder/OrderTask reads
- [x] PAGE_KEYS.production + seed pages; director on facade GET Roles
- [x] Dense `/production`; Feature Checklist §A noted
- [x] FE tsc + focused jest PASS; scoped commit

## Gates (факт)

```text
cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern="production|gantt|cockpit"
→ 4 suites / 14 tests PASS

cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS

cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
→ PASS
```

Browser smoke: **PO** после land (живой API/Mongo).

## Executor report

Shell `/production` + nav + dense; FE read facade composition-first; A–J locks; BE PAGE_KEYS/seed/`production:read`/director GET; docs page + indexes + SECTION-READINESS + FEATURE §A + PO-DIARY lifecycle north-star.

## Closeout

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-06T18:45:00Z
