═══════════════════════════════════════════════════════════════
TZ-UX-305: Sync page.md drift (orgs, work-types, storage, materials)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Docs-only (можно Cursor Mode A или local)
ЗАВИСИМОСТИ: нет
LAYER: 1 (docs)
PAGES: /organizations ; /work-types ; /storage-items ; /materials
PAGE_DOCS: organizations.page.md ; work-types.page.md ;
  storage-items.page.md ; materials.page.md

CONFLICT KEYS:
docs/pages/organizations.page.md;
docs/pages/work-types.page.md;
docs/pages/storage-items.page.md;
docs/pages/materials.page.md;
docs/agent-checklists/TZ-UX-305.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Docs врут относительно кода:
- organizations / work-types: docs «НЕ pi-table» → код уже app-pi-table
- storage-items: docs pi-table → код PiEntityList
- materials: docs «categories lookup на list» → на list только
  suppliers/photos; categories в form dialog

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Переписать 4 page.md по факту кода (route/API/table component).
ШАГ 2 — Не менять *.ts кроме если найдёте dead comment в коде (prefer docs only).
ШАГ 3 — Executor report.

AC: 4 файла соответствуют коду; git diff только docs (+checklist).
ПРОМПТ: GEMINI.md + tasks/TZ-UX-305-page-docs-sync.md.
Checklist docs/agent-checklists/TZ-UX-305.md. Push нет.

---
ARCHIVE_MARKER
outcome: DONE
date: 2026-08-02
agent: Cursor (lightweight UX/docs sweep)
summary: page.md drift sync
---
