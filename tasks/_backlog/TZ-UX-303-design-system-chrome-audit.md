═══════════════════════════════════════════════════════════════
TZ-UX-303: Аудит — один дизайн chrome из shared (docs)
═══════════════════════════════════════════════════════════════

> READY docs-only · после UX-302 или ∥ как Cursor/docs  
> Цель: список страниц, которые всё ещё «свой» H1/крошки в обход kit

STATUS: READY (RESERVED)

РОЛЬ: Cursor architect или FE read-only → audit md

CONFLICT KEYS:
docs/audits/2026-08-09-design-system-chrome-drift.md;
docs/pages/ui-page-chrome.md;
docs/agent-checklists/TZ-UX-303.md;

## ЧТО ДЕЛАТЬ

1. Grep страниц без PiGroupWorkspace/PiPageChrome / с text-5xl / самодельными крошками.  
2. Таблица: path → chrome used → PASS/FAIL vs эталон.  
3. Successor TZ list (тонкие) только на FAIL.  
4. НЕ кодить продукт в 303 если docs-role; если FE — только docs.

AC: audit file exists; FAIL list prioritized.
