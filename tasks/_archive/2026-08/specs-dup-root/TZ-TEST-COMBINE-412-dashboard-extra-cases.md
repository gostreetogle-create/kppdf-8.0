# TZ-TEST-COMBINE-412: dashboard.page доп. кейсы Комбайна

РОЛЬ: Frontend tests  
LAYER: 1  

CONFLICT KEYS: `frontend/src/app/pages/dashboard/dashboard.page.spec.ts` ; только при необходимости минимальный helper в `dashboard.page.ts` (не UX-rewrite)

## ЧТО ДЕЛАТЬ

Добавить тесты (минимум 3 из списка):

1. Фильтр orderId скрывает чужие карточки; сброс показывает все.  
2. Ship gate: 2 линии, одна не `to_ship` → toast, ship() не вызван.  
3. Обе в `to_ship` → confirmShip path (dialog open).  
4. Дроп `design` → `prep` (обратный) вызывает patchLane.  
5. Карточка без lineId не падает (skip/guard) если есть защита.

Gates: FE tsc + `dashboard.page` jest.

## НЕ

- Module DnD  
- Deploy  

## AC

- [ ] ≥3 новых теста PASS  
- [ ] archive + push  
