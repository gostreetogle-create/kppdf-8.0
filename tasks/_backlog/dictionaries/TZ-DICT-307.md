═══════════════════════════════════════════════════════════════
TZ-DICT-307: Doc-template + text-block categories — Shell cutover
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend
ЗАВИСИМОСТИ: DICT-302 DONE
LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/dictionaries/document-template-categories.page.ts;
frontend/src/app/pages/dictionaries/document-template-categories.page.spec.ts;
frontend/src/app/pages/dictionaries/text-block-categories.page.ts;
frontend/src/app/pages/dictionaries/text-block-categories.page.spec.ts;
docs/pages/ (связанные page docs если есть);
docs/agent-checklists/TZ-DICT-307.md

ЧТО ДЕЛАТЬ:
1. Обе страницы → PiDictionaryShell (короткие title).
2. Sticky tools: search + CTA; убрать header/section prose.
3. CRUD/dialogs сохранить; выровнять row actions к pi-row-actions если расходится.
4. Specs обеих страниц PASS.

AC: единый chrome; routes/pageKeys без регрессии; tsc+jest PASS; Cursor PASS.

НЕ: doc-constructor editors; backend categories modules.

∥: 305/306 OK.
