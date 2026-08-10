═══════════════════════════════════════════════════════════════
TZ-SALES-315: Создать КП — правая панель (организация, наценка-подсказка)
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-KP-VITRINE #6
DEPENDS ON: TZ-SALES-312 DONE
LAYER: 3
PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
CHECKLIST: docs/agent-checklists/TZ-SALES-315.md

РОЛЬ: Frontend

CONFLICT KEYS:
frontend/src/app/pages/commercial/proposals/proposal-create.page.ts;
frontend/src/app/pages/commercial/proposals/proposal-create-inspector*.ts;
docs/pages/proposals-create.page.md;
docs/agent-checklists/TZ-SALES-315.md;

---

## ЧТО ДЕЛАТЬ

1. Правая зона: выбор Organization (бланк), поле % наценки, **оценка суммы** (подсказка), нужные dropdown-заглушки по spec.
2. Смена org/% пересчитывает только preview-цифры на экране (не обязателен BE total rewrite).
3. Deep-link «открыть организацию» — router на существующий org editor (reuse).

## НЕ

- Не schema Organization markup fields (successor). Не печать. Не deploy.

## AC

1. Org + % видны; оценка пересчитывается на клиенте.
2. FE tsc + test.
3. Archive.

ARCHIVE: `tasks/_archive/2026-08/TZ-SALES-315.done.md`
