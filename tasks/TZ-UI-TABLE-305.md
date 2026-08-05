═══════════════════════════════════════════════════════════════
TZ-UI-TABLE-305: Raw registry tables → Flat app-pi-table
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend
ЗАВИСИМОСТИ: TZ-UI-TABLE-301 DONE; TZ-UI-TABLE-302 DONE (kit Tree exists;
  Flat уже в pi-table)
LAYER: 3
PAGES: /doc-constructor/texts ; /doc-constructor/templates ;
  /doc-constructor/tables ; /doc-constructor/documents ;
  /forms ; /inventory (dashboard) ; /dictionaries/text-block-categories
PAGE_DOCS: texts.page.md ; templates.page.md ; tables.page.md ;
  documents.page.md ; (forms/inventory/text-block-cats docs if exist)

SoT: docs/superpowers/specs/2026-08-04-table-kit-design.md §2, §4.2, §6
Проверено: §4.2 list of 7 raw `<table>` registries.

CONFLICT KEYS:
  frontend/src/app/pages/doc-constructor/texts/texts.page.ts ;
  frontend/src/app/pages/doc-constructor/templates/templates.page.ts ;
  frontend/src/app/pages/doc-constructor/tables/tables.page.ts ;
  frontend/src/app/pages/doc-constructor/documents/documents.page.ts ;
  frontend/src/app/pages/forms/forms.page.ts ;
  frontend/src/app/pages/inventory/inventory-dashboard.page.ts ;
  frontend/src/app/pages/dictionaries/text-block-categories.page.ts ;
  (+ matching *.spec.ts) ;
  docs/pages/* (touched pages) ;
  docs/agent-checklists/TZ-UI-TABLE-305.md ;
  tasks/_active/TZ-UI-TABLE-305.md

ЧТО ДЕЛАТЬ:
1. Каждую из 7 страниц §4.2: заменить raw `<table class="w-full…">` реестра
   на `app-pi-table` (Flat): columns, sort/actions/empty/loading как принято
   на соседних kit-страницах. Поведение CRUD/filters сохранить.
2. text-block-categories: уже в PiGroupWorkspace — только body table → pi-table.
3. Specs на каждую затронутую страницу (хотя бы smoke: app-pi-table present,
   no prose page-header regress). fe tsc + jest PASS по затронутым patterns.
4. Docs page.md + checklist → после gates: ARCHIVE сам (см. session prompt).

НЕ: backend; builder canvas / block-renderer / dialogs (§4.4);
  Tree (302); Selectable (304); commit только по session prompt;
  deploy.

AC:
- [ ] 7 реестров на app-pi-table; raw registry `<table>` убраны с этих page
      templates (кроме §4.4 out-of-scope).
- [ ] fe tsc + jest PASS.
- [ ] Archive DONE + lock + progress + _active removed.

Verification:
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern "texts.page|templates.page|tables.page|documents.page|forms.page|inventory-dashboard|text-block-categories|pi-table" --no-coverage
```
