# TZ-PRODUCTION-336 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-336.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)
> Spec: `tasks/TZ-PRODUCTION-336-gantt-skip-orders-without-modules.md` (removed after archive)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-grok-4.6 (TZ-PRODUCTION-336 frontend executor)
- claimed_at: 2026-08-16T12:08:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (join/inbox ok; claim: Unknown task TZ-PRODUCTION-336, sync tasks first)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (UX-332 products/dashboard; TZD-48 desktop + import-mapping-profile; later UX-326 / CATALOG-374 other keys)
- [x] TZ / канон / deps прочитаны (`TZ-PRODUCTION-336-gantt-skip-orders-without-modules.md`, `PO-CANON.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-PRODUCTION-336.md` на месте (removed after archive)

## Mode

- TZ-exec / TDD-first (eligibility + toast + rail marker)
- Primary signal: «Все активные» без пустых заказов на Ганте и без жёлтой простыни «нет прямых модулей»; toast только при попытке взять негодный заказ на план — **met**
- Secondary: tsc + focused jest — **PASS**

## Acceptance

- [x] «Все активные»: на Ганте нет заказов без оцениваемых модулей/видов работ; **нет** жёлтой простыни «нет прямых модулей»
- [x] Такие заказы видны в rail с понятным маркером
- [x] Клик/выбор негодного заказа → русский toast с причиной; диаграмма не заполняется пустыми полосками этого заказа
- [x] Eligible заказы ведут себя как до TZ (expand, drag, meta)
- [x] Gates PASS; Cursor verdict PASS; archive after PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (`/production` Gantt eligibility + toast)
- [x] FIC §A–E: §A page.md + PAGE-TZ-INDEX (index line in working tree; mixed peer rows not staged); §B–E N/A (нет permission/BE/MCP)
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS N/A (поведение студии, не статус раздела)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (UX-332 / TZD-48 / UX-326 / CATALOG-374 не трогать)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS

cd frontend && pnpm test -- --testPathPattern="production-read.facade|production-cockpit.page|gantt-bar.model|orders-rail" --coverage=false
→ PASS — 4 suites / 56 tests

eslint owned production files
→ PASS (1 pre-existing OnInit warning on production-cockpit.page.ts)
```

Primary signal: met
Secondary: PASS

## Executor report (auto)

- task: TZ-PRODUCTION-336
- outcome: DONE
- commit: (landing SHA after git commit)
- what: Gantt shows only orders with ≥1 work-bar; ineligible stay in rail with «нет плана»; toast.warning on select / `?orderId=`
- conflict disclosure: none vs UX-332 / TZD-48 / UX-326 / CATALOG-374
- known limits: no deep BOM; no auto in_production
- deploy: NOT RUN

## Review handoff

- [x] Cursor self-review PASS (eligibility matches buildGanttBars; header spam gone; toast only on attempt; rail visible)
- [x] Archive after Cursor PASS

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active` + spec
- [x] Status = DONE
- closed_at: 2026-08-16T12:20:00+03:00
