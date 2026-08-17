# TZ-COMBINE-407: FE module DnD + ghost parent (v1.1 PARK)

STATUS: **READY** — после COMBINE-406 archive (не раньше).

РОЛЬ АГЕНТА: Frontend Комбайн

LAYER: 3

CONFLICT KEYS: `frontend/src/app/pages/dashboard/dashboard.page.ts` ; `dashboard.page.spec.ts` ; `orders.service.ts`

---

## ЧТО ДЕЛАТЬ

1. Expand изделия → список модулей (из composition / moduleLanes)  
2. DnD модуля → PATCH module lane  
3. Ghost на родителе: серый чип + «модуль в: {колонка}» если lanes разъехались  
4. Карточка изделия не пустая после last module — следует за min lane  

## НЕ

- Материалы как карточки  
- Gantt  

## AC

- [ ] DnD + ghost + specs  
- [ ] FE tsc + dashboard.page jest PASS  
