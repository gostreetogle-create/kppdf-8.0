═══════════════════════════════════════════════════════════════
TZ-SALES-312: Оболочка «Создать КП» по design-spec
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-KP-VITRINE #3
DEPENDS ON: TZ-SALES-311 DONE
LAYER: 3
PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
CHECKLIST: docs/agent-checklists/TZ-SALES-312.md

РОЛЬ: Frontend

CONFLICT KEYS:
frontend/src/app/pages/commercial/proposals/proposal-create.page.ts;
frontend/src/app/app.routes.ts;
docs/pages/proposals-create.page.md;
docs/agent-checklists/TZ-SALES-312.md;

---

## ЧТО ДЕЛАТЬ

1. Заменить stub на страницу 3 зон по `docs/ux/kp-create-studio-spec.md`.
2. Placeholder-копирайт RU в каждой зоне (без fake data tables).
3. Collapsible left/right на узких viewport по spec.
4. Сохранить deals TOC + KP subchips.
5. Jest smoke: page renders three regions (`data-test`).

---

## НЕ

- Не пикер товаров / не live quotation save / не шаблон PDF.
- Не печать. Не deploy.

## AC

1. `/proposals/create` = три зоны видимы ≥1280px.
2. FE tsc + focused jest.
3. Archive → NEXT 314/315 (или 313 если ещё не взят).

ARCHIVE: `tasks/_archive/2026-08/TZ-SALES-312.done.md`
