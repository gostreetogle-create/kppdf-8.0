═══════════════════════════════════════════════════════════════
TZ-DICT-306: Color references — Dictionary Shell cutover
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend
ЗАВИСИМОСТИ: DICT-302 DONE
LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/dictionaries/color-references.page.ts;
frontend/src/app/pages/dictionaries/color-references.page.spec.ts;
docs/pages/color-references.page.md;
docs/agent-checklists/TZ-DICT-306.md

ЧТО ДЕЛАТЬ:
1. PiDictionaryShell title «Цвета»; tools = search + active filter + CTA.
2. Убрать description/section bloat.
3. Сохранить system-color disable contract + dialog CRUD.
4. Specs + docs.

AC: D1–D2 chrome; CRUD/RAL intact; tsc+jest PASS; Cursor PASS.

НЕ: product-form RAL (только read service); backend color-references.

∥: 305/307 OK.
