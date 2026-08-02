═══════════════════════════════════════════════════════════════
TZ-UX-303: Единые названия — Архив документов + Справочники nav
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend copy / IA
ЗАВИСИМОСТИ: нет
LAYER: 3
PAGES: /doc-constructor/documents ; /dictionaries
PAGE_DOCS: documents.page.md ; dictionaries.page.md

CONFLICT KEYS:
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/pages/doc-constructor/documents/documents.page.ts;
frontend/src/app/app.routes.ts;
frontend/src/app/pages/dictionaries/dictionaries.page.ts;
docs/pages/documents.page.md;
docs/pages/dictionaries.page.md;
docs/agent-checklists/TZ-UX-303.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Documents: nav «Архив документов» ≠ page title «Сформированные документы»
   ≠ route title «Сохранённые документы» (три имени одной страницы).
2. Dictionaries: nav «Все справочники», страница только Units («Справочники») —
   overclaim; остальные справочники уже отдельные пункты меню.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Выбрать КАНОН (зафиксировано):
  Documents: **«Сформированные документы»** везде (nav + header + route title).
  Dictionaries nav: **«Единицы измерения»** (страница units-only).
ШАГ 2 — Применить в layout, page, routes title, page.md.
ШАГ 3 — Executor report.

AC: три строки documents совпадают; dictionaries nav не врёт «все».
ПРОМПТ: GEMINI.md + tasks/TZ-UX-303-nav-label-consistency.md.
Checklist docs/agent-checklists/TZ-UX-303.md. Push нет.

---
ARCHIVE_MARKER
outcome: DONE
date: 2026-08-02
agent: Cursor (lightweight UX/docs sweep)
summary: Nav label consistency
---
