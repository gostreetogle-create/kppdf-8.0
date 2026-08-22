# TZ-SUPPLY-314 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-SUPPLY-314-quick-order-guided-flow.md`
> Commit/push: executor commit после gates

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff
- claimed_at: 2026-08-22T10:11:18+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] `git status` / branch / worktree проверены
- [x] Прочитан `_NOW.md` + `tasks/_active/` — TZ-SUPPLY-315 released, чужого CLAIM на keys нет
- [x] TZ / PO canon / executor-loop / template прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-SUPPLY-314-quick-order-guided-flow.md` на месте
- [x] Живой компонент прочитан: строки актуальны (expandedId :1739, moreExpanded :1743, toggleExpand :2051, onCreate :2072, modal backdrop/panel :1130-1230+)

## Acceptance

- [ ] При создании/раскрытии плитки открыт только блок «Позиция»; «Поставщик» + «Детали» свёрнуты (паттерн moreExpanded: arrow-toggle, aria-expanded, data-test)
- [ ] «Поставщик» авто-раскрывается при categoryId + materialId; «Детали» — всегда доступен (необязательный, не блокировать)
- [ ] Ручной toggle любого блока всегда доступен (guided-default, не жёсткий wizard)
- [ ] Ни один переход не дёргает layout; плавный CSS transition expand/collapse блоков; `prefers-reduced-motion`
- [ ] Модал создания сущности: CSS transition (opacity/scale), без скачка scroll-позиции
- [ ] Cascading category→material/supplier регресс-проверен
- [ ] Существующие тесты не ломаются; новые тесты: default-collapsed где/details, auto-expand по заполнению, no layout-thrash

## Integrity slot (до READY / archive)

- [ ] Тип изменения: page
- [ ] FIC §A–E пройдены или N/A с причиной
- [ ] `page.md` / PAGE-TZ-INDEX обновлены или N/A (нет UI route)
- [ ] SECTION-READINESS обновлён или N/A
- [ ] Чужой WIP не в коммите; conflict keys соблюдены
- [ ] Coupling map обновлён или N/A
- [ ] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS (0 errors)
- [x] `cd frontend && pnpm test -- supply-quick-order` — PASS (28/28)
- [x] `cd frontend && pnpm lint` — PASS (0 new errors)
- [x] `node scripts/smoke/supply-smoke.mjs` — PASS (23/23)

## Executor report

- scope: `frontend/src/app/pages/supply/supply-quick-order.component.ts` + `.spec.ts`
- conflict disclosure: чистое дерево компонента после release 315
- known limits: выбор «когда раскрывать Детали» — PO не ответил, выбран «Детали всегда доступны» (ручной toggle), auto-expand только для «Поставщика» по categoryId+materialId. Без браузерного прохода — первичный сигнал: gates + smoke.

## Review handoff

- [ ] READY FOR REVIEW в wave inbox
- [ ] Не archive до Cursor Verdict PASS (если требуется)

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: 2026-08-22T10:52:01+03:00