# TZ-GANTT-401 — Gantt «По рабочим» (read-only)

> Source prompt: `tasks/_backlog/PROMPT-WAVE-COMBINE-SHOP-FLOOR-FREEBUFF.md`
> PO: вид Ганта по рабочим. Auto-assign / ship templates — **не** в этом чате.

## Scope

Read-only таб/переключатель «По рабочим» на `/production`.

## Делать

1. Источник баров: существующая сборка Gantt (`gantt-bar.model` / facade) — **не** менять ACTIVE filter.
2. Группировка строк: по `workerLabel` / People×WorkType labels **уже** на барах. Без назначения → группа «Не назначен».
3. UI toggle рядом с масштабом: «По заказам» | «По рабочим».
4. Gates: FE tsc + production-cockpit / gantt focused tests.

## НЕ

- Новые schema fields
- Auto-assign / PATCH worker
- order.service.ts
- Deploy
- Combine / boardLane

## Acceptance

- [ ] `/production` → Масштаб-флайаут содержит переключатель «По заказам | По рабочим».
- [ ] «По заказам» (default) = существующий вид (tree по `orderId`, summary по заказу) — без регрессий.
- [ ] «По рабочим» = строки сгруппированы по `workerLabel`; бары без назначения (`—`/empty) попадают в группу «Не назначен».
- [ ] Группа рабочего = сводная строка (span min…max детей) + дочерние work-бары всегда развёрнуты.
- [ ] Read-only: в режиме «По рабочим» нет resize-handle и body-drag (нельзя PATCH worker/order).
- [ ] ACTIVE filter / `buildGanttBars` / facade не изменены.
- [ ] RU-тексты, data-test для нового toggle и worker-групп.

## Gates

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm exec jest --config jest.config.js --testPathPattern="gantt-bar.model|gantt-bars.component|production-cockpit.page" --no-coverage` → PASS

## Ready

Checklist `docs/agent-checklists/TZ-GANTT-401.md` → READY FOR REVIEW. Один commit. Не archive без Cursor PASS.

## Conflict keys

- `frontend/src/app/pages/production/gantt-bar.model.ts` (+ `.spec.ts`)
- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts` (+ `.spec.ts`)
- `frontend/src/app/pages/production/blocks/production-scale-controls.component.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts` (+ `.spec.ts`)
- `docs/pages/production-cockpit.page.md`, `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-GANTT-401.md`, `tasks/_active/TZ-GANTT-401.md`
