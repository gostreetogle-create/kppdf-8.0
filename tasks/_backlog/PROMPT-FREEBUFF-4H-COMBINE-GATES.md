# PROMPT — Freebuff 4–5 часов (скопируй целиком в один чат)

Ты — исполнитель kppdf-8.0 на `D:\kppdf-8.0`, ветка `main`.  
PO отсутствует ~4–5 часов. Работаешь **по очереди TZ** из волны ниже до полного завершения всех пунктов или пока не упрёшься в блокер.

## Обязательно прочитай сначала

1. `docs/PO-CANON.md`  
2. `docs/GIT-POLICY.md`  
3. `tasks/_backlog/WAVE-FREEBUFF-4H-COMBINE-GATES.md`  
4. `docs/COUPLING-MAP.md` §2 / §2b (boardLane)  
5. `docs/agent-checklists/_NOW.md`

## Режим

- **Один TZ за раз.** Claim → код/тесты → gates → archive + lock → `_NOW` + progress → commit + **push** → следующий.  
- Не начинай следующий, пока текущий не в `tasks/_archive/2026-08/*.done.md`.  
- Коммиты точечные (не `git add .`). Не клади `data/paspots`, `data/products`, secrets.  
- UI тексты только RU.  
- Если conflict с чужим `_active` на тех же keys — DEFER этот TZ, возьми следующий.

## ЗАПРЕЩЕНО

- `deploy.ps1` / wipe / seed / VPN-ломка  
- TZ-COMBINE-406 / 407 / 408 (модули) — PARK  
- Новые фичи Комбайна/Ганта сверх тестов и closeout  
- Править `backend/src/modules/photos/**`  
- Переписывать SWEEP-401 ship write-path «заодно»

## Очередь TZ (файлы спек)

1. `tasks/_backlog/TZ-OPS-GANTT-401-CLOSE.md`  
2. `tasks/_backlog/TZ-TEST-COMBINE-410-lane-controller-spec.md`  
3. `tasks/_backlog/TZ-TEST-COMBINE-411-orders-service-patchlane.md`  
4. `tasks/_backlog/TZ-TEST-COMBINE-412-dashboard-extra-cases.md`  
5. `tasks/_backlog/TZ-TEST-GANTT-402-workers-view-specs.md`  
6. `tasks/_backlog/TZ-TEST-OPS-413-docs-link-smoke.md`  
7. `tasks/_backlog/TZ-TEST-REGRESS-414-combine-gantt-jest-pack.md`

Создай checklist `docs/agent-checklists/<TZ-ID>.md` по `_TEMPLATE.md` при старте каждого.

## Финальный отчёт PO (обязателен)

Когда очередь кончилась или время вышло:

```
WAVE-FREEBUFF-4H DONE/PARTIAL
TZ done: …
TZ skipped/deferred: …
SHAs: …
Gates: …
Deploy: NO
Blockers: …
```

Начни сейчас с пункта 1.
