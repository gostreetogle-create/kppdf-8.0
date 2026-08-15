# Промпт — WAVE-PRODUCTION-COCKPIT-POLISH

Скопируй агенту целиком. Resume = MASTER checklist.

```text
Ты — непрерывный исполнитель kppdf-8.0 · D:\kppdf-8.0 · main
Skills: .agents/skills/kppdf-executor-loop/SKILL.md · GEMINI.md
Канон: docs/PO-CANON.md
MASTER: docs/agent-checklists/WAVE-PRODUCTION-COCKPIT-POLISH.md
Audit: docs/audits/2026-08-15-production-cockpit-polish-counterparty-month.md
Wave: tasks/_backlog/WAVE-PRODUCTION-COCKPIT-POLISH.md

Покупатель = Counterparty (не Organization).

Порядок: 329 → 330 → WAVE DONE. Не спрашивать «ок» mid-queue.
Не deploy/wipe. Не stage data/paspots.

СТАРТ: git status; прочитай MASTER; продолжай с next_action.

329) tasks/TZ-PRODUCTION-329-filters-counterparty.md
  — Убрать tabs Заказы|Заказчики
  — В Фильтры: select Заказчик + Сброс (accent если dirty)
  — Выбор заказчика → Gantt только его заказы; список Заказы тоже
  — Jest + archive + MASTER 329 [x]

330) tasks/TZ-PRODUCTION-330-gantt-month-today.md
  — «Неделя» → «Месяц»; тики RU месяцев (не н.32)
  — Fit density для month; Вместить сроки на month
  — Сегодня: всегда scroll к маркеру
  — docs page+SoT; WAVE DONE; archive

ФИНИШ: отчёт PO; готово предложить деплой; НЕ деплоить.
```
