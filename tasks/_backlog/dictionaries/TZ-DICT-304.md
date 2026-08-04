═══════════════════════════════════════════════════════════════
TZ-DICT-304: Units — Dictionary Shell cutover
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend
ЗАВИСИМОСТИ: DICT-302 DONE; DICT-303 DONE (units route)
LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/dictionaries/units.page.ts;
frontend/src/app/pages/dictionaries/units.page.spec.ts (если есть);
docs/pages/units.page.md;
docs/agent-checklists/TZ-DICT-304.md

ЧТО ДЕЛАТЬ:
1. Подключить PiDictionaryShell: title «Единицы», tools = search/filter category + CTA «Добавить».
2. Убрать bloat header/section texts; add через dialog ИЛИ компактный inline в tools — один паттерн, без второй «простыни».
3. pi-table занимает viewport под sticky tools.
4. Specs + docs.

AC: chrome соответствует D1–D2; CRUD units жив; tsc+jest PASS; Cursor PASS.

НЕ: другие справочники; backend units schema.

∥: после 303; параллельно 305/306/307 OK.
