# TZ-TEST-GANTT-402: specs «По рабочим»

РОЛЬ: Frontend tests  
LAYER: 1  

CONFLICT KEYS: `frontend/src/app/pages/production/**/*.spec.ts` ; при необходимости только test helpers — **не** менять assign/SoT

Зависит: GANTT-401 closeout DONE.

## ЧТО ДЕЛАТЬ

1. Усилить/добавить specs: toggle режим; группа «Не назначен»; в worker-режиме нет drag/resize (если так в коде).  
2. Не ломать «По заказам» default.  
3. Gates: FE tsc + jest `production-cockpit|gantt`.

## НЕ

- Auto-assign  
- Schema  
- Deploy  

## AC

- [ ] ≥2 новых/усиленных теста  
- [ ] archive + push  
