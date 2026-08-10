═══════════════════════════════════════════════════════════════
TZ-DOC-TABLES-302: Диалог таблицы — overflow-select + нормальный UX полей источника
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-DOC-TABLES #2
DEPENDS ON: нет (лучше после 301)
LAYER: 3
PAGES: /doc-constructor/tables
PAGE_DOCS: tables.page.md
CHECKLIST: docs/agent-checklists/TZ-DOC-TABLES-302.md

РОЛЬ: Frontend

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.ts;
frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.spec.ts;
docs/pages/tables.page.md;
docs/agent-checklists/TZ-DOC-TABLES-302.md;

Проверено: native `<select class="pi-input">` для источника и типа колонки;
канон PO = `app-pi-overflow-select` (`searchable="auto"`).

---

## ЧТО ДЕЛАТЬ

1. Источник данных → `PiOverflowSelect` (полная ширина, не «узкая полоска»).
2. Тип колонки → overflow-select или тот же паттерн (короткий enum — searchable false ok).
3. Список полей registry: читаемые чекбоксы/строки (label 13), не микро-текст;
   пустое состояние «нет полей у источника».
4. Jest: select/overflow wiring + snapshot smoke.

---

## НЕ

- Не менять registry BE. Не photo type (303). Не deploy.

## AC

1. В диалоге нет native `<select>` для источника/типа колонки.
2. Источник визуально «нормальный» dropdown (overlay, не клип диалога).
3. FE tsc + jest dialog.
4. Archive + push.

ARCHIVE: `tasks/_archive/2026-08/TZ-DOC-TABLES-302.done.md`
