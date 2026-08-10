═══════════════════════════════════════════════════════════════
TZ-DOC-TABLES-304: Registry auto-sync ← mongoose schema (без ручного списка)
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-DOC-TABLES #4
DEPENDS ON: TZ-DOC-TABLES-303 DONE
LAYER: 2
PAGES: /doc-constructor/tables
PAGE_DOCS: tables.page.md
CHECKLIST: docs/agent-checklists/TZ-DOC-TABLES-304.md

РОЛЬ: Backend

CONFLICT KEYS:
backend/src/modules/registry/**;
backend/src/modules/product/product.schema.ts;
docs/agent-checklists/TZ-DOC-TABLES-304.md;

---

## ИСХОДНОЕ

PO: при новом поле в БД не хотеть руками править registry. Сейчас DATA_SOURCES — константа.

---

## ЧТО ДЕЛАТЬ

1. Спроектировать генерацию FieldDescriptor из mongoose schema paths
   (whitelist групп / skip internal: deletedAt, organizationId, isSystem, composition…).
2. RU labels: map override table (key→label) + fallback humanize key.
3. Types: map Number→number/currency по имени; Date→date; Boolean→bool; ObjectId ref Photo→image.
4. Unit-тест: добавление mock path появляется в getDataSources без правки огромного массива.
5. Keep explicit allowlist of **sources** (product/material/…) — авто только **fields**.

---

## НЕ

- Не админ-CRUD Mongo registry (старый TZ-87) без PO.
- Не deploy.

## AC

1. Product fields в API ⊆ schema paths (минус deny-list) и ⊇ 303 полезный набор.
2. Новый тест/док: «как добавить entity source» vs «поле подтянется само».
3. BE tsc + tests.
4. Archive + push; Checkpoint idle / propose deploy.

ARCHIVE: `tasks/_archive/2026-08/TZ-DOC-TABLES-304.done.md`
