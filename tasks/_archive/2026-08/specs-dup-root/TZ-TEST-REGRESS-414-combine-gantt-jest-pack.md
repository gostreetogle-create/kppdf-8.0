# TZ-TEST-REGRESS-414: jest pack COMBINE+GANTT

РОЛЬ: Gates  
LAYER: 1  

CONFLICT KEYS: none (только запуск + запись evidence в archive/progress)

## ЧТО ДЕЛАТЬ

1. Запусти и зафиксируй PASS в archive:

```
cd backend && pnpm exec jest --testPathPattern="order.service|order.controller" --coverage=false
cd frontend && pnpm test -- --testPathPattern="dashboard.page|orders.service|production-cockpit|gantt" --coverage=false
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
```

2. Если красное — чини **только** тесты/очевидный дрейф в зоне COMBINE/GANTT; иначе BLOCKED с логом.  
3. Archive DONE с числами suites/tests + push docs.

## НЕ

- Deploy  
- Широкий рефакторинг  

## AC

- [ ] Все команды EXIT 0  
- [ ] archive + push  
