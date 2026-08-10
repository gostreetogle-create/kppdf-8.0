═══════════════════════════════════════════════════════════════
TZ-SALES-311: Design-spec экрана «Создать КП» (3 колонки)
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-KP-VITRINE #2
DEPENDS ON: TZ-SALES-310 DONE
LAYER: 4 (docs)
PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
CHECKLIST: docs/agent-checklists/TZ-SALES-311.md

РОЛЬ: Docs / UX spec (без product UI logic)

CONFLICT KEYS:
docs/ux/kp-create-studio-spec.md;
docs/pages/proposals-create.page.md;
docs/agent-checklists/TZ-SALES-311.md;

Проверено: PO vision — центр A4-шаблон, слева товары, справа org/%/dropdowns;
канон D21 sales-to-shop; PiGroupWorkspace chrome уже из 310.

---

## ИСХОДНОЕ

Нужен утверждаемый spec до кода оболочки 312. Черновик-скелет может уже лежать
в `docs/ux/kp-create-studio-spec.md` от архитектора — довести до AC и связать page doc.

---

## ЧТО ДЕЛАТЬ

1. Файл `docs/ux/kp-create-studio-spec.md`:
   - Desktop ≥1280: три колонки (левая ~280–320px, центр flex, правая ~300–340px).
   - Tablet: стек или collapsible side panels (open/close).
   - Mobile: центр + drawers.
   - Зоны: Product rail | Preview A4 | Inspector (org, наценка-подсказка, списки).
   - Sticky chrome Сделок не перекрывает.
   - Пустые состояния каждой зоны (одна фраза RU).
2. `docs/pages/proposals-create.page.md` — pointer на spec + route.
3. Не кодировать Angular в этом TZ (кроме опечаток в stub title если нужно).

---

## НЕ

- Не 314/315/316 логика.
- Не печать.
- Не deploy.

---

## AC

1. Spec файл существует, читается за ≤5 мин, размеры колонок явные.
2. Page doc создан/обновлён.
3. Checkpoint NEXT=312.
4. Archive docs-only + commit/push.

ARCHIVE: `tasks/_archive/2026-08/TZ-SALES-311.done.md`
