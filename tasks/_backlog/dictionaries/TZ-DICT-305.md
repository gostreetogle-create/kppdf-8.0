═══════════════════════════════════════════════════════════════
TZ-DICT-305: Categories — Dictionary Shell cutover (keep drag)
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend
ЗАВИСИМОСТИ: DICT-302 DONE
LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/dictionaries/categories.page.ts;
frontend/src/app/pages/dictionaries/categories.page.spec.ts;
docs/pages/categories.page.md;
docs/agent-checklists/TZ-DICT-305.md

ЧТО ДЕЛАТЬ:
1. Заменить page-header+section bloat на PiDictionaryShell title «Категории».
2. Tools: search + filter by type (material/product/general) + CTA Создать.
3. Сохранить CDK drag-reorder (root + children) и API reorder*.
4. Убрать дублирующие hint «перетаскивайте…» из description/section — достаточно subtle empty/drag handle UX.
5. Specs (search/reorder) зелёные.

AC: first viewport = title + sticky tools + tree; drag работает; tsc+jest PASS; Cursor PASS.

НЕ: менять Category backend; units/colors; nav (303).

∥: с 306/307 OK; с 304 после 303.
