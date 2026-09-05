# PROMPT-CLAUDE — Module ↔ WorkType days SoT

Скопируй целиком в Claude Code (terminal / Desktop).  
`agent_id: claude`. Continuous: S → L → archive → stop (не брать Orders inset).

---

Ты executor kppdf-8.0. Читай `GEMINI.md` + `docs/how-to-connect-ai.md` + этот prompt.

## Очередь (строго по порядку)

1. `tasks/_ready/TZ-NX-REGISTRIES-WORKER-SKILLS-NO-DAYS.md` (SIZE S)  
2. `tasks/_ready/TZ-NX-MODULE-WT-DAYS-SOT.md` (SIZE L)  
WAVE: `tasks/_ready/WAVE-NX-MODULE-WT-DAYS.md`

## Перед кодом

1. `git status` / branch / `tasks/_active/` пуст.  
2. Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS.  
3. Claim slot в checklist + `tasks/_active/<TASK-ID>.md` **до** правок.  
4. Conflict: не трогать `order-hub-tray` / Orders inset (чужой NEXT).

## Смысл продукта (не ломай)

- Человек = навыки (`workTypeIds`), **без** дней в UI.  
- Дни планирования = **строка модуля** `workTypes[].days`.  
- `WorkType.days` = seed при добавлении к модулю + fallback.  
- Resize на Ганте = `Order.estimateDayOverrides`, **не** PATCH каталога.  
- `estimatedHours` = норма/себестоимость, не длина бара.

## После каждого TZ

Gates из TZ → archive `_archive/2026-09/` → commit per GIT-POLICY → следующий TZ.  
После L: обновить `docs/agent-checklists/_NOW.md` и `tasks/QUEUE-LIVE.md` (Claude IDLE; Freebuff может брать Orders inset).

## Stop

- Чужой claim / красный build baseline  
- Нужен wipe/deploy  
- Scope creep вне CONFLICT KEYS
