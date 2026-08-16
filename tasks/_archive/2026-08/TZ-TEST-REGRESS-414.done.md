# TZ-TEST-REGRESS-414: jest pack COMBINE+GANTT — DONE

> Source: `tasks/_backlog/TZ-TEST-REGRESS-414-combine-gantt-jest-pack.md`

## OUTCOME

DONE 2026-08-16. Регресс-пакет COMBINE+GANTT зелёный одной командой на каждую
сторону. Deploy НЕ.

## Gates

- `cd backend && pnpm exec jest --testPathPattern="order.service|order.controller" --coverage=false` → PASS — 2 suites / 62 tests
- `cd frontend && pnpm exec jest --config jest.config.js --testPathPattern="dashboard.page|orders.service|production-cockpit|gantt" --no-coverage` → PASS — 6 suites / 122 tests
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS

## Files

- (только evidence; новых product-правок нет)

## known_limitation

- n/a

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T15:34:00+03:00
closed_by: deepseek/deepseek-v4-pro
TZ: TZ-TEST-REGRESS-414
layer: 1
conflict_keys: none (только запуск + evidence)
protects: COMBINE+GANTT regression pack
next: волна завершена — финальный отчёт PO
