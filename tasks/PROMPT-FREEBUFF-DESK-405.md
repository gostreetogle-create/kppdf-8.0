# PROMPT — Freebuff: TZ-DESK-405 (раскладка стола rev.2)

Скопируй целиком в новый чат Freebuff.

---

CLAIM первым (до кода):

1. `Get-Location` + `git rev-parse HEAD` → repo `D:\kppdf-8.0`, свежий `main`
2. Скопируй `tasks/TZ-DESK-405.md` → `tasks/_active/TZ-DESK-405.md`
3. Checklist: `docs/agent-checklists/TZ-DESK-405.md` — Status CLAIMED
4. `_active-map` / чужие `_active` conflict keys → STOP если пересечение
5. Team Room claim best-effort

Затем: прочитай `GEMINI.md`, `tasks/TZ-DESK-405.md`, `docs/pages/manager-desk.page.md`,
`docs/superpowers/specs/2026-08-18-manager-desk-design.md` § PO review.

**Задача:** правка **только раскладки** `/desk` после PO review 401.

**Must:**
- `app-pi-page-chrome` + **workflow strip** (Стол, КП, Комбайн, Гantt stub, Снабжение, Отгрузка)
- path crumbs при expand
- Expand-in-row под строкой (эталон `orders.page` expandedTpl), **убрать** `__innards` ниже очереди
- Scroll на очереди (`max-height` + overflow)
- Left rail panels → flyout **слева**; right panels → **справа** (см. production-cockpit L flyout)
- Primary CTA + stub links **в tray**, не только на R rail
- Fixture only, без `/api/orders`

**Must NOT:** order form, composition-tree, Gantt embed, deploy, правки production-cockpit.

**Gates:**
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern=manager-desk.page
cd frontend && pnpm exec eslint src/app/pages/desk/manager-desk.page.ts
```

Archive → `tasks/_archive/2026-08/TZ-DESK-405.done.md`, lock, push, executor report в checklist.

**PO ждёт:** посмотреть `/desk` и сказать «раскладка v2 ок» — только потом 402.
