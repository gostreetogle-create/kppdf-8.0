# PROMPT — Freebuff: модули на Комбайне (скопируй целиком)

Ты исполнитель kppdf-8.0, workspace `D:\kppdf-8.0`, ветка `main`.  
PO ушёл надолго: доведи **модули на Комбайне** до DONE по очереди. Cursor параллельно делает другое — **не трогай его keys**.

## Прочитай сначала

1. `docs/PO-CANON.md`  
2. `docs/GIT-POLICY.md`  
3. `docs/COUPLING-MAP.md` §2 / §2b  
4. `docs/pages/design-combine.page.md`  
5. `tasks/_backlog/WAVE-FREEBUFF-COMBINE-MODULES.md`  
6. Спеки по очереди (ниже)

## Режим

- **Один TZ за раз** → gates → archive + lock → `_NOW` + progress → commit + **push** → следующий.  
- Не начинай 407, пока 406 не в `tasks/_archive/2026-08/TZ-COMBINE-406.done.md`.  
- Не начинай 408, пока 407 не archived.  
- Stage только свои CONFLICT KEYS. Никогда `git add .`.  
- UI только RU. Deploy / wipe / seed — **запрещены**.

## Не трогать (Cursor / чужое)

- `frontend/src/app/pages/dashboard/dashboard-stats.page.ts` и home widgets (DASHBOARD-401)  
- `frontend/src/app/pages/production/**` (Gantt)  
- `backend/src/modules/photos/**`  
- `data/**`  
- COMBINE item-card/DnD логику ломать не надо — **расширять** expand+module

## Очередь

### 1) `tasks/_backlog/TZ-COMBINE-406-module-lanes.md`

- Schema `Order.moduleLanes: [{ lineId, moduleId, lane }]` sparse  
- `PATCH /orders/:id/lines/:lineId/modules/:moduleId/lane`  
- Полоса линии = **min** по moduleLanes этой линии (если есть записи), иначе `boardLane`  
- Last module → parent следует (min)  
- Reject `lane=shipped` через PATCH (как у линий)  
- Gates: BE tsc + `order.service` jest  

### 2) `tasks/_backlog/TZ-COMBINE-407-module-dnd-ghost.md`

- Expand изделия → модули (BOM top-level / moduleLanes)  
- DnD модуля по колонкам → PATCH module lane  
- Ghost на родителе: серый + «модуль в: {колонка}» если lanes разъехались  
- Материалы **не** карточки  
- Gates: FE tsc + `dashboard.page` jest  

### 3) `tasks/_backlog/TZ-COMBINE-408-shop-worktype-days-gate.md`

- Переход линии/модуля в `shop` только если есть workType + days (каталог или estimate overrides)  
- Иначе 400 RU + toast  
- Gates: BE tsc + order.service jest; минимальный FE toast если нужен  

Checklist на каждый TZ: `docs/agent-checklists/TZ-COMBINE-40X.md` по `_TEMPLATE.md`.

## Финальный отчёт PO

```
WAVE-FREEBUFF-COMBINE-MODULES DONE/PARTIAL
406/407/408: SHA…
Gates: …
Deploy: NO
Blockers: …
```

Начни с **406** сейчас.
