# PROMPT — Freebuff агент 1, волна B (каталог + обзор)

> Агент 1 свободен: волна A (OPS-320…UI-408) DONE.
> Claude сейчас на desktop TZD-65 — **не трогать `desktop/**`**.
> Параллель: агент 2 — `PROMPT-FREEBUFF-AGENT2-WAVE-B-2026-08-22.md` (другие файлы).
> Режим: **Medium**. Deploy / wipe — нет.

**PO:** новый чат, скопируй блок ниже.

---

```text
Ты — executor kppdf-8.0, агент 1, волна B. Репо: D:\kppdf-8.0
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + этот файл.

НЕ ТРОГАТЬ: desktop/** (TZD-65 у Claude); Гант gantt-bars/orders-rail; стол manager-desk;
login/enroll; overflow-select; select-trigger; pi-notification-bell; table-template-dialog
(это агент 2). Deploy / wipe запрещены. Push можно. .github/ не трогать.

Перед каждым TZ: git fetch origin && git merge origin/main
Конфликт _NOW / PAGE-TZ-INDEX: чужие строки оставь, свою добавь.

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) TZ → tasks/_active/<ID>.md; checklist _TEMPLATE.md
3) Claim slot agent_id=freebuff-1, claimed_at ISO
4) Чужой _active на те же keys → этот TZ DEFER
5) Team Room claim best-effort

Цикл: CLAIM → код → gates из TZ → archive 2026-08/<ID>.done.md + lock
+ commit + push (не git add -A) → строка _NOW → следующий.

ОЧЕРЕДЬ:
1. tasks/TZ-UI-412-catalog-remaining-micro-type.md
2. tasks/TZ-UI-413-material-form-micro-type.md
3. tasks/TZ-UI-414-dashboard-lane-helper-type.md

СТОП: gates FAIL ×2 → .failed.md, дальше. Файл вне KEYS — не трогай.
DoD: таблица ID | outcome | archive | SHA | gates. Без деплоя.
```
