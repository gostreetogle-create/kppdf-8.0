# PROMPT — Freebuff: боковые меню снова видны

> Параллельно DESK-423 можно: другие файлы. Deploy нет.

**PO:** новый чат Freebuff (второй, не тот же что стол), блок ниже.

---

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-UX-345.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; agent_id=freebuff + claimed_at ISO + workspace
4) Чужие _active keys → конфликт с app-layout = STOP; DESK-423 tray не твой
5) Team Room claim best-effort
Затем: docs/AI-AGENT-GUIDE.md + tasks/TZ-UX-345-chrome-rail-visible-at-operator-width.md

НЕ git add -A. НЕ revert UX-326/327/328. НЕ возвращать filters-rail w-12.
НЕ трогать order-hub-tray / manager-desk / backend.

Суть: chrome-rail прячется с 1680, хотя шапка с 1024 уже даёт поле 64px (padding .pi-page-frame). Показать рейлы с 1024px — пока верхнее меню держит ширину. Лёгкий фон как полоска-меню. Fallback каталога тоже 1024, без двойных иконок. Не w-12. Gates из TZ. Archive 2026-08. Без деплоя.
```
