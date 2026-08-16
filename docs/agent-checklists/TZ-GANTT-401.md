# TZ-GANTT-401 checklist

> Status: **DONE**
> Marker: _(removed — archived)_
> Commit/push: по `docs/GIT-POLICY.md`
> Spec: `tasks/_archive/2026-08/TZ-GANTT-401.done.md`
> closed_at: 2026-08-16T15:10:00+03:00

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: deepseek/deepseek-v4-pro (Freebuff executor)
- claimed_at: 2026-08-16T15:05:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: no (Freebuff direct; COMBINE-403 parallel — не пересекается по keys)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — COMBINE-403 (order.service/combine), не на production-cockpit/gantt keys
- [x] TZ / канон / deps прочитаны (`PROMPT-WAVE-COMBINE-SHOP-FLOOR-FREEBUFF.md`, production-cockpit.page.md, gantt-bar.model)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-GANTT-401.md` на месте

## Acceptance

- [x] toggle «По заказам | По рабочим» в масштаб-флайауте
- [x] «По заказам» default — без регрессий
- [x] «По рабочим» группирует по workerLabel; «Не назначен» для —/empty
- [x] worker-группа = сводная строка + всегда развёрнутые children
- [x] read-only в worker-режиме (нет resize/drag)
- [x] ACTIVE filter / buildGanttBars / facade не изменены

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (`/production` read-only view)
- [x] FIC §A page.md + PAGE-TZ-INDEX; §B–E N/A (нет permission/BE/MCP); §F N/A (нет новых общих полей)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS

cd frontend && pnpm exec tsc -p tsconfig.spec.json --noEmit
→ PASS

cd frontend && pnpm exec jest --config jest.config.js --testPathPattern="gantt-bar.model|gantt-bars.component|production-cockpit.page" --no-coverage
→ PASS — 3 suites / 91 tests
```

## Executor report (auto)

- task: TZ-GANTT-401
- outcome: DONE (closeout by wave TZ-OPS-GANTT-401-CLOSE)
- commit: `036b5fd5cde0de407d2a9b41cb0d884cceb8601c` (pushed to origin/main)
- what: read-only «По рабочим» toggle + worker grouping; archive + lock + _NOW + progress
- conflict disclosure: none (COMBINE wave done on separate keys)
- known limits: worker-группы всегда развёрнуты; `workerLabel` с несколькими людьми — одна группа

## Review handoff

- [x] READY FOR REVIEW
- [x] Closed by wave TZ-OPS-GANTT-401-CLOSE (PO authorized closeout)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- [x] closed_at: 2026-08-16T15:10:00+03:00
