═══════════════════════════════════════════════════════════════
TZ-DICT-309: Измерения — cutover (units → Group Chip Workspace)
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend
ЗАВИСИМОСТИ: TZ-DICT-308 DONE (PiGroupWorkspace + /dictionaries/measurements pilot)
LAYER: 3
PAGES: /dictionaries/measurements ; /dictionaries/units
PAGE_DOCS: measurements-group.page.md ; units.page.md ; dictionaries.page.md

SoT: docs/superpowers/specs/2026-08-04-group-chip-workspace-design.md §2
Проверено: frontend/src/app/pages/dictionaries/measurements-group.page.ts ;
  frontend/src/app/pages/dictionaries/units.page.ts ;
  frontend/src/app/app.routes.ts (оба route живы) ;
  tasks/_archive/2026-08/TZ-DICT-308.done.md (known: UnitsPage duplication)

CONFLICT KEYS:
  frontend/src/app/pages/dictionaries/measurements-group.page.ts ;
  frontend/src/app/pages/dictionaries/measurements-group.page.spec.ts ;
  frontend/src/app/pages/dictionaries/units.page.ts ;
  frontend/src/app/pages/dictionaries/units.page.spec.ts ;
  frontend/src/app/app.routes.ts ;
  docs/pages/measurements-group.page.md ;
  docs/pages/units.page.md ;
  docs/agent-checklists/TZ-DICT-309.md ;
  tasks/_active/TZ-DICT-309.md

ИСХОДНОЕ СОСТОЯНИЕ:
- Пилот 308: MeasurementsGroupPage на /dictionaries/measurements (chip «Единицы» +
  units table) — OK.
- Legacy UnitsPage на /dictionaries/units всё ещё полный CRUD-дубль (~shell).
- Nav «Измерения» уже ведёт на measurements; прямые ссылки/bookmarks на /units
  остаются.
- known 308: дубль логики UnitsPage; hard-coded tools top — не обязан чинить
  top в 309, если нет регрессии.

ЧТО ДЕЛАТЬ:
1. Cutover route: `/dictionaries/units` → redirect на
   `/dictionaries/measurements` (Angular redirectTo или guard). Сохранить
   pageKey/capability поведение (dictionaries).
2. Убрать двойной UX: либо удалить UnitsPage как отдельный chrome и оставить
   только MeasurementsGroupPage; либо thin wrapper, который сразу redirect
   (предпочтительнее один body на measurements). Не оставлять два полноценных
   редактора единиц.
3. Specs: redirect /units → /measurements; measurements smoke (chip Единицы,
   нет H1/path) остаётся зелёным; обновить/удалить units.page.spec под новый
   контракт.
4. Docs: measurements-group.page.md = канон; units.page.md = «redirect legacy»;
   READY FOR REVIEW в DICT-WAVE1-REVIEW.md.

ИЗМЕНЯТЬ: conflict keys выше.
НЕ ИЗМЕНЯТЬ: PiGroupWorkspace API (кроме бага-блокера); backend; другие группы
  (310); hub /dictionaries (311); table kit; commit/push без PO; archive до
  Cursor PASS.

КРИТЕРИИ ПРИЁМКИ:
- [ ] GET/nav на /dictionaries/units приводит на measurements group screen.
- [ ] Один UX редактирования единиц — Group Chip Workspace (нет второго H1-shell
      units как основного входа).
- [ ] fe tsc PASS; jest measurements + units (или redirect spec) PASS.
- [ ] Docs + inbox READY FOR REVIEW; Cursor PASS before archive.

Verification:
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern "measurements-group|units.page" --no-coverage
```

known_limitation: другие группы справочников — DICT-310; hub redirect — 311;
  sticky tools top dynamic — optional polish, не блокер.

∥: не параллелить с DICT-310/311 (общие app.routes / layout).
