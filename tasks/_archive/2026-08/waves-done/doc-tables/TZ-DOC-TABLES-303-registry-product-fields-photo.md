═══════════════════════════════════════════════════════════════
TZ-DOC-TABLES-303: Registry — полные поля Product (+ фото) по schema SoT
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-DOC-TABLES #3
DEPENDS ON: нет
LAYER: 2–3
PAGES: /doc-constructor/tables ; builder data binding
PAGE_DOCS: tables.page.md
CHECKLIST: docs/agent-checklists/TZ-DOC-TABLES-303.md

РОЛЬ: Backend (+ тонкий FE types если нужно)

CONFLICT KEYS:
backend/src/modules/registry/registry.service.ts;
backend/test/e2e/registry.e2e-spec.ts;
frontend/src/app/shared/services/pi-registry.service.ts;
docs/agent-checklists/TZ-DOC-TABLES-303.md;

Проверено: `DATA_SOURCES` hardcoded; product без notes/ralCode/status/dimensions/photoIds;
FieldType без image; Product schema имеет photoIds.

---

## ЧТО ДЕЛАТЬ

1. Сверить product fields с `product.schema.ts` — добавить пользовательские скаляры
   для печати/таблиц (notes, status, ralCode, dimensions.*, purpose, installation,
   isActive, hasPassport, hasDrawing — по тому, что build() реально резолвит).
2. Фото: тип `image` + primary photo binding **или** временный URL-слот — один путь,
   known_limitation если preview таблицы ещё не рисует image.
3. Лёгкий audit material/work-type на явные дыры.
4. E2E + FE type union.
5. Docs: полный автоскан → 304.

---

## НЕ

- Не mongoose reflection (304). Не EAV. Не deploy.

## AC

1. product в registry содержит photo-слот + недостающие полезные поля.
2. UI списка полей их показывает.
3. BE tsc + registry e2e; FE tsc если types.
4. Archive + push.

ARCHIVE: `tasks/_archive/2026-08/TZ-DOC-TABLES-303.done.md`
KNOWN: авто из schema → 304.
