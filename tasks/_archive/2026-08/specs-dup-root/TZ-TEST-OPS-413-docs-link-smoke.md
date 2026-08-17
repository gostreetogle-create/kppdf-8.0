# TZ-TEST-OPS-413: docs link smoke COMBINE/GANTT

РОЛЬ: Docs  
LAYER: 1  

CONFLICT KEYS: `docs/pages/PAGE-TZ-INDEX.md` ; `docs/COUPLING-MAP.md` ; `docs/pages/design-combine.page.md` ; `docs/pages/production-cockpit.page.md` ; `_NOW.md`

## ЧТО ДЕЛАТЬ

1. Проверить относительные ссылки из PAGE-TZ-INDEX на COMBINE/GANTT/page.md — 0 broken.  
2. design-combine.page.md и production-cockpit упоминают boardLane / «По рабочим» без противоречия COUPLING.  
3. `_NOW` отражает GANTT-401 DONE + COMBINE 401–405 DONE.  
4. Commit docs + push.

## НЕ

- Product code  
- Deploy  

## AC

- [ ] 0 broken links в затронутых docs  
- [ ] archive + push  
