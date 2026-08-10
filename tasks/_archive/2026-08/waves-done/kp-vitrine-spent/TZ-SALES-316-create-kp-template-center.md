═══════════════════════════════════════════════════════════════
TZ-SALES-316: Создать КП — шаблон в центре (bind + preview zone)
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-KP-VITRINE #7
DEPENDS ON: TZ-SALES-312 DONE
LAYER: 3
PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
CHECKLIST: docs/agent-checklists/TZ-SALES-316.md

РОЛЬ: Frontend

CONFLICT KEYS:
frontend/src/app/pages/commercial/proposals/proposal-create.page.ts;
docs/pages/proposals-create.page.md;
docs/agent-checklists/TZ-SALES-316.md;

---

## ЧТО ДЕЛАТЬ

1. Центр: выбор/подстановка шаблона КП из doc-constructor (существующий API шаблонов).
2. Preview-зона A4 (упрощённый HTML/iframe/reuse preview — без нового PDF engine).
3. Кнопка «Редактировать шаблон» → deep-link builder (не встраивать builder).

## НЕ

- Не полный WYSIWYG builder внутри. Не печать пачкой (320). Не deploy.

## AC

1. Выбранный шаблон виден в центре.
2. Deep-link в builder работает.
3. FE tsc + test.
4. Archive; Checkpoint: предложить PO смотреть витрину; 320 остаётся PARK.

ARCHIVE: `tasks/_archive/2026-08/TZ-SALES-316.done.md`
