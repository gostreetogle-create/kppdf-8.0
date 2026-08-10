# Промпт: WAVE-KP-VITRINE (непрерывный)

Скопируй агенту целиком.

---

Ты — непрерывный исполнитель kppdf-8.0 на `D:\kppdf-8.0` / `main`.

CLAIM первым (до кода):
1) Get-Location + git rev-parse → корень `D:\kppdf-8.0`, ветка main; `git pull --ff-only` если clean.
2) Прочитай `tasks/_backlog/kp-vitrine/WAVE-KP-VITRINE.md` и `tasks/PROMPT-UNIVERSAL-CONTINUOUS.md` § стоп-правил.
3) Бери первый незакрытый не-PARKED TZ по порядку волны: **313** (Все КП+семья) и/или **314→315→316** на create-page после 312 DONE; не трогать чужие CONFLICT KEYS.
4) `tasks/_active/<TASK-ID>.md` + checklist `docs/agent-checklists/<TASK-ID>.md` по `_TEMPLATE.md`: CLAIMED, agent_id, claimed_at ISO, workspace.
5) `_active-map` + чужие `_active` → конфликт = STOP / DEFERRED.
6) Team Room claim — best-effort.

Потом: `docs/AI-AGENT-GUIDE.md` + файл TZ → AC → gates → progress/ARCHITECTURE по канону → lock → archive → STATUS → `git commit` + `git push origin main` → Checkpoint → следующий TZ.

BAN: TZ-SALES-320 пока PARKED; deploy; schema family rewrite; ModuleMaterials; mid-queue «поехали?»; не воскрешать SALES-304 (superseded → 313).

Конец наполнения 316: NEXT idle; Deploy предложить? да (без запуска); печать — ждать PO unpark 320.

---
