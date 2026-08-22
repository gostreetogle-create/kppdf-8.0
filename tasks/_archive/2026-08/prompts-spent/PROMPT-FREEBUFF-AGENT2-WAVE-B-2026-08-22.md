# PROMPT — Freebuff агент 2, волна B (вход + chrome + таблицы)

> Агент 2 свободен: TEST-420…UI-411 DONE.
> Claude на desktop TZD-65 — **не трогать `desktop/**`**.
> Параллель: агент 1 — `PROMPT-FREEBUFF-AGENT1-WAVE-B-2026-08-22.md`.
> Режим: **Medium**. Deploy / wipe — нет.

**PO:** новый чат, скопируй блок ниже.

---

```text
Ты — executor kppdf-8.0, агент 2, волна B. Репо: D:\kppdf-8.0
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + этот файл.

НЕ ТРОГАТЬ: desktop/** (TZD-65); products/modules/materials.page.ts; material-form-dialog;
dashboard.page.ts (агент 1); Гант; стол. Deploy / wipe запрещены. Push можно.

Перед каждым TZ: git fetch origin && git merge origin/main
Конфликт _NOW / PAGE-TZ-INDEX: чужие строки оставь.

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) TZ → tasks/_active/<ID>.md; checklist _TEMPLATE.md
3) Claim slot agent_id=freebuff-2, claimed_at ISO
4) Чужой _active на те же keys → DEFER
5) Team Room claim best-effort

Цикл: CLAIM → код → gates → archive 2026-08/<ID>.done.md + lock
+ commit + push (не git add -A) → строка _NOW → следующий.

ОЧЕРЕДЬ:
1. tasks/TZ-UI-415-login-enroll-micro-type.md
2. tasks/TZ-UI-416-shared-chrome-micro-type.md
3. tasks/TZ-UI-417-table-template-counter-type.md

СТОП: gates FAIL ×2 → .failed.md, дальше.
DoD: таблица ID | outcome | archive | SHA | gates. Без деплоя.
```
