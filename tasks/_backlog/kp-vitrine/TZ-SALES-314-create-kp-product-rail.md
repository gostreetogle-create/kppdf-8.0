═══════════════════════════════════════════════════════════════
TZ-SALES-314: Создать КП — левый рейл товаров (каталог SoT)
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-KP-VITRINE #5
DEPENDS ON: TZ-SALES-312 DONE
LAYER: 3
PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
CHECKLIST: docs/agent-checklists/TZ-SALES-314.md

РОЛЬ: Frontend

CONFLICT KEYS:
frontend/src/app/pages/commercial/proposals/proposal-create.page.ts;
frontend/src/app/pages/commercial/proposals/proposal-product-rail*.ts;
docs/pages/proposals-create.page.md;
docs/agent-checklists/TZ-SALES-314.md;

---

## ЧТО ДЕЛАТЬ

1. Левая зона: поиск/список изделий (reuse products API / patterns списка продукции — без новой БД).
2. Клик/«Добавить» → строка в draft КП (in-memory или PATCH quotation — выбрать один write-path; зафиксировать в page doc).
3. Не дублировать полноценную «витрину каталога» — тонкий rail.

## НЕ

- Не ModuleMaterials. Не печать. Не правая панель (315). Не deploy.

## AC

1. Можно добавить ≥1 изделие в draft из рейла.
2. FE tsc + focused test.
3. Archive → NEXT 315/316.

ARCHIVE: `tasks/_archive/2026-08/TZ-SALES-314.done.md`
