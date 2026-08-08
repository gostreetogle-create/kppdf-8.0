═══════════════════════════════════════════════════════════════
TZ-DICT-301: Dictionaries audit confirm (optional)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG — можно skip если PO принял
  `docs/audits/2026-08-04-dictionaries-ux-ia-audit.md` as-is
SOURCE: audit file + TZ-DICT-300
LAYER: 1
WHO: Cursor или docs-агент

CONFLICT KEYS:
docs/audits/2026-08-04-dictionaries-ux-ia-audit.md;
docs/pages/dictionaries.page.md;
docs/pages/categories.page.md;
docs/pages/color-references.page.md;
docs/agent-checklists/TZ-DICT-301.md

ЧТО ДЕЛАТЬ:
1. Перечитать все dictionary pages в браузере / коде.
2. Дописать в audit только НОВЫЕ gaps (не пересказывать).
3. Синкнуть page docs «текущий smell» одной строкой.

AC: audit актуален; нет product code.

НЕ: UI правки; CATALOG; nav rewrite (это 303).
