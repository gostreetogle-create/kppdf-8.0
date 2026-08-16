# TZ-TEST-COMBINE-412: dashboard.page доп. кейсы Комбайна — DONE

> Source: `tasks/_backlog/TZ-TEST-COMBINE-412-dashboard-extra-cases.md`

## OUTCOME

DONE 2026-08-16. dashboard.page.spec +3: (1) reverse drop `design→prep`
вызывает patchLane `{ lane:'prep' }` без freeze/ship гейтов; (2) карточка без
lineId → toast «У изделия нет lineId», PATCH не уходит; (3) prep→shop когда
заказ уже в shop → freeze modal НЕ открывается, прямой patchLane. Deploy НЕ.

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- `pnpm exec jest --config jest.config.js --testPathPattern="dashboard.page" --no-coverage` PASS — 2 suites / 17 tests (+3)

## Files

- `frontend/src/app/pages/dashboard/dashboard.page.spec.ts`

## known_limitation

- n/a

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T15:22:00+03:00
closed_by: deepseek/deepseek-v4-pro
TZ: TZ-TEST-COMBINE-412
layer: 1
conflict_keys: frontend/src/app/pages/dashboard/dashboard.page.spec.ts
protects: combine DnD reverse / lineId guard / non-first-shop paths
next: TZ-TEST-GANTT-402 (workers view specs)
