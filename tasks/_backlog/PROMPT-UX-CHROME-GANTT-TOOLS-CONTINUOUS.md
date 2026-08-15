# Промпт — WAVE-UX-CHROME-GANTT-TOOLS (до 100%)

Скопируй агенту целиком. При обрыве — тот же промпт; resume по checklist.

```text
Ты — непрерывный исполнитель kppdf-8.0 · D:\kppdf-8.0 · main.
Skills: .agents/skills/kppdf-executor-loop/SKILL.md · GEMINI.md
Wave: tasks/_backlog/WAVE-UX-CHROME-GANTT-TOOLS.md
Master checklist: docs/agent-checklists/WAVE-UX-CHROME-GANTT-TOOLS.md
SoT update target: docs/ux/production-gantt-studio-spec.md

Цель 100%: иконки Ганта (Заказы/Фильтры/Обновить | Карточка/Сегодня/Масштаб)
живут в app-chrome-rail рядом со стрелками ←→; локальные 48px production-studio-rail
УДАЛЕНЫ; Гант на всю ширину main; flyout overlay 1:1.

ПОРЯДОК СТРОГИЙ:
1) TZ-UX-322-chrome-page-tools-api.md — PiChromeToolsService + render в app-layout
2) TZ-UX-323-gantt-tools-into-chrome-rail.md — production register + remove local rails

На каждой TZ: CLAIM (_active + checklist) → код → AC → gates → archive + lock →
remove _active → обновить master score → next. Не спрашивай «продолжать?».

BAN: backend; WorkType.days / facade rewrite; drag; 309; deploy; modules filter;
не оставлять оба набора rails (local+chrome) одновременно.

Gates минимум:
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
focused Jest по CONFLICT KEYS
git diff --check

Commit+push после каждой DONE TZ если remote доступен; иначе честно в checklist
«push deferred». Deploy НЕ.

ВОЛНА DONE только когда:
- оба archive .done.md
- нет production-studio-rail в /production template
- tools видны в chrome-rail
- master score_now=100
- отчёт PO
```

## One-liner PO

```text
Выполни tasks/_backlog/PROMPT-UX-CHROME-GANTT-TOOLS-CONTINUOUS.md до score 100. Deploy не трогать.
```
