# PROMPT — Freebuff: волна 2026-08-22 (гигиена + стол + КП + каталог + админ)

> 5 TZ, conflict keys не пересекаются. Deploy / wipe — **запрещены**.
> Push — можно. GitHub Actions / `.github/` — не трогать.

**PO:** скопируй **весь блок ниже** (от CLAIM до DoD) в новый чат Freebuff и сразу жми старт.

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0
Прочитай: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + этот файл.

Deploy / wipe / prod Synology — ЗАПРЕЩЕНЫ.
Push — можно (GitHub только хранилище). .github/ не трогать.

CLAIM первым (до кода), на КАЖДЫЙ TZ:
1) Get-Location + git rev-parse → D:\kppdf-8.0 (не .freebuff/worktrees)
2) git fetch origin && git merge origin/main
3) Файл TZ → tasks/_active/<ID>.md; checklist docs/agent-checklists/_TEMPLATE.md
4) Status CLAIMED; Claim slot: agent_id + claimed_at ISO + workspace
5) Чужие _active conflict keys → STOP этот TZ, следующий по очереди
6) Team Room claim best-effort

Цикл TZ: CLAIM → код строго по Scope → gates из TZ → archive tasks/_archive/2026-08/<ID>.done.md + lock + commit + push (только свои пути, не git add -A) → строка в _NOW.md → сразу следующий TZ, не жди PO.

ОЧЕРЕДЬ (по порядку):
1. tasks/TZ-OPS-320-tasks-spent-hygiene.md
2. tasks/TZ-DESK-418-desk-order-delete.md
3. tasks/TZ-SALES-381-multipage-text-wrap-capacity.md
4. tasks/TZ-UI-407-catalog-filter-escape.md
5. tasks/TZ-UI-408-admin-dialog-font-tokens.md

СТОП:
- Gates FAIL после 2 попыток → archive .failed.md, _NOW, следующий TZ
- Хочется файл вне CONFLICT KEYS → не делай
- Просит деплой/wipe → не делай

DoD волны: таблица ID | outcome | archive | SHA | gates. Без «волна закрыта» и без деплоя.
```

---

Файлы TZ уже в `tasks/` — копировать тексты не нужно, Freebuff читает по путям.
