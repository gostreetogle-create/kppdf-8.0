═══════════════════════════════════════════════════════════════
TZ-DOC-TABLES-301: Документы TOC тёмный + под Таблицы жёлтые «Все таблицы»|«Из данных»
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-DOC-TABLES #1
DEPENDS ON: нет
LAYER: 3
PAGES: /doc-constructor/tables ; /doc-constructor/templates ; /doc-constructor/documents ; /doc-constructor/texts
PAGE_DOCS: tables.page.md ; templates.page.md ; documents.page.md ; texts.page.md
CHECKLIST: docs/agent-checklists/TZ-DOC-TABLES-301.md

РОЛЬ: Frontend

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/documents/documents-group-chips.ts;
frontend/src/app/pages/doc-constructor/tables/tables.page.ts;
frontend/src/app/pages/doc-constructor/tables/tables.page.spec.ts;
frontend/src/app/pages/doc-constructor/templates/templates.page.ts;
frontend/src/app/pages/doc-constructor/documents/documents.page.ts;
frontend/src/app/pages/doc-constructor/texts/texts.page.ts;
docs/pages/tables.page.md;
docs/agent-checklists/TZ-DOC-TABLES-301.md;

Проверено: сейчас только жёлтый `DOCUMENTS_SECTION_CHIPS`; Deals-эталон =
`DEALS_TOC_CHIPS` + `KP_SECTION_CHIPS`; pathLabel deprecated (UX-315).

---

## ЧТО ДЕЛАТЬ

1. В `documents-group-chips.ts`:
   - `DOCUMENTS_TOC_CHIPS` = Шаблоны|Архив|Тексты|Таблицы (тёмный TOC);
   - `TABLES_SECTION_CHIPS` = Все таблицы → list mode; Из данных → from-registry mode
     (query `?mode=` или local signal / два sub-routes — выбрать **один** тонкий способ,
     зафиксировать в page doc; предпочтительно `?view=all|from-data` без новых lazy pages).
2. Все sibling pages Документов: `[toc]="DOCUMENTS_TOC"` + `tocActiveId`; жёлтый ряд
   только на tables (остальные — пустые chips или один chip раздела — как contracts
   после Deals 310).
3. Убрать дубль CTA в tools, если жёлтые chips закрывают «Из существующих данных»;
   «+ Новая таблица» (blank) оставить на view=all.
4. Jest chrome + page docs.

---

## НЕ

- Не registry fields (303). Не overflow-select dialog (302). Не deploy.

## AC

1. На `/doc-constructor/tables` видны тёмный TOC (Таблицы active) + жёлтые Все таблицы|Из данных.
2. Sibling templates/documents/texts: TOC тёмный, без ложных tables yellow chips.
3. FE tsc + focused jest.
4. Archive + push → NEXT 302/303.

ARCHIVE: `tasks/_archive/2026-08/TZ-DOC-TABLES-301.done.md`
