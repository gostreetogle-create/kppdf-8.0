═══════════════════════════════════════════════════════════════
TZ-UX-302: CategoriesPage — вырезать мёртвый doc-template CRUD
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend cleanup
ЗАВИСИМОСТИ: нет (doc-template-categories page уже живой отдельно)
LAYER: 3
PAGES: /categories
PAGE_DOCS: categories.page.md
RELATED_LIVE: /doc-template-categories

CONFLICT KEYS:
frontend/src/app/pages/dictionaries/categories.page.ts;
docs/pages/categories.page.md;
docs/agent-checklists/TZ-UX-302.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

В `categories.page.ts` (~401+) остались `docCatItems`, `loadDocCats`,
`onDocCatCreate/Edit/Delete` и импорты DocumentTemplateCategory* —
в template страницы UI для этого **нет** (живой CRUD на
`/doc-template-categories`). Мёртвый код + риск tsc/NG unused + путаница.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Удалить dead methods/signals/imports, связанные с doc-template
  categories, если не вызываются из template.
ШАГ 2 — Проверить, что `/categories` только product/material Category tree.
ШАГ 3 — Обновить categories.page.md; Executor report.

AC: rg docCat|DocumentTemplateCategory в categories.page.ts → 0;
  page compiles; doc-template-categories не затронут.
ПРОМПТ: GEMINI.md + tasks/TZ-UX-302-categories-dead-doccat.md. Checklist
docs/agent-checklists/TZ-UX-302.md. Push нет.
