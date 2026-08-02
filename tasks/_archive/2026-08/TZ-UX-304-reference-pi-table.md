═══════════════════════════════════════════════════════════════
TZ-UX-304: pi-table для Цвета и Категории шаблонов
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend shared-ui migration
ЗАВИСИМОСТИ: нет
LAYER: 3
PAGES: /color-references ; /doc-template-categories
PAGE_DOCS: (создать/обновить color-references.page.md если нет;
  document-template-categories если есть)
SIBLING_OK: /dictionaries уже на app-pi-table

CONFLICT KEYS:
frontend/src/app/pages/dictionaries/color-references.page.ts;
frontend/src/app/pages/dictionaries/document-template-categories.page.ts;
docs/agent-checklists/TZ-UX-304.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Сырой `<table>` на color-references и document-template-categories,
пока соседний dictionaries уже на `<app-pi-table>` — разный UX в одном
разделе «Справочники».

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Мигрировать оба списка на app-pi-table (паттерн dictionaries.page).
ШАГ 2 — Сохранить actions (edit/delete/create), swatch цвета если есть.
ШАГ 3 — Page docs + Executor report.

AC: нет raw table на этих двух страницах; jest/smoke; визуально как units.
ПРОМПТ: GEMINI.md + tasks/TZ-UX-304-reference-pi-table.md.
Checklist docs/agent-checklists/TZ-UX-304.md. Push нет.
