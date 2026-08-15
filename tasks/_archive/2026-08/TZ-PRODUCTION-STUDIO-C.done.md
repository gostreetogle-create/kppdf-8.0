# TZ-PRODUCTION-STUDIO-C — DONE

**Status:** DONE / READY FOR REVIEW  
**Closed:** 2026-08-15  
**Score contribution:** +35 (wave score 75/99)

## Delivered

- removed persistent docked `w-56/w-14` order rail and text toolbar;
- added local `48px | Gantt center | 48px` production shell;
- left rail: Заказы, Фильтры, Обновить;
- right rail: Карточка, Сегодня, Масштаб;
- overlay flyouts, one active at a time, backdrop and Escape close;
- focus returns to opener;
- hard split: search/list/select/all active in Заказы; active-only/priority/dates/reset in Фильтры;
- existing estimate/read behavior and routes preserved;
- OrdersRail supports list/filter-only projections without changing filtering logic.

## Gates

- TypeScript PASS;
- production Jest: **22/22 PASS**;
- Prettier PASS;
- ESLint 0 errors, one existing `OnInit` warning;
- Angular build PASS (existing size warnings only);
- no backend/facade/estimate/model changes.

## Known limitation

Full `getBoundingClientRect()` geometry evidence, light/dark browser smoke and `/work-types` closeout belong to Wave D.
