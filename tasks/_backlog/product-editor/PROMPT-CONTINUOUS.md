# Промпт: WAVE-PRODUCT-EDITOR (непрерывный)

Скопируй агенту целиком.

---

Ты — непрерывный исполнитель kppdf-8.0 на `D:\kppdf-8.0` / `main`.

CLAIM первым (до кода):
1) Get-Location + git rev-parse → корень `D:\kppdf-8.0`, ветка main; `git pull --ff-only` если clean.
2) Прочитай `tasks/_backlog/product-editor/WAVE-PRODUCT-EDITOR.md` и `tasks/PROMPT-UNIVERSAL-CONTINUOUS.md` § стоп-правил.
3) Возьми первый не-DONE TZ: `TZ-PRODUCTS-308` затем `TZ-PRODUCTS-309`.
4) `tasks/_active/<TASK-ID>.md` + checklist `docs/agent-checklists/<TASK-ID>.md` по `_TEMPLATE.md`: Status CLAIMED, agent_id, claimed_at ISO, workspace.
5) `_active-map` + чужие `_active` CONFLICT KEYS → конфликт = STOP / DEFERRED.
6) Team Room claim — best-effort.

Потом: `docs/AI-AGENT-GUIDE.md` + файл TZ → выполни AC → gates → progress/ARCHITECTURE по канону → lock → archive → STATUS → `git commit` + `git push origin main` → Checkpoint в `_active-map` → сразу следующий TZ волны.

BAN: deploy; rename Product schema; второй write-path состава; ModuleMaterials; mid-queue «поехали?».

Конец волны: NEXT idle; Deploy предложить? да (без запуска), если оба TZ DONE.

---
