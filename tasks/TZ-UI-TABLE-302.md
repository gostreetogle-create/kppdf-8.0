═══════════════════════════════════════════════════════════════
TZ-UI-TABLE-302: Tree variant in pi-table + categories migrate
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend
ЗАВИСИМОСТИ: TZ-UI-TABLE-301 DONE (SoT); TZ-DICT-312 DONE или ∥ OK
  (разные keys: 312 = pi-group-workspace/layout; 302 = pi-table + categories body)
LAYER: 3
PAGES: /categories ; /dictionaries/classification
PAGE_DOCS: categories.page.md

SoT: docs/superpowers/specs/2026-08-04-table-kit-design.md §1 Tree, §2, §4.3, §6
Проверено: frontend/src/app/shared/ui/pi-table.component.ts (Flat/Expandable/selection;
  Tree отсутствует) ;
  frontend/src/app/pages/dictionaries/categories.page.ts (CDK DropList/Drag custom,
  не kit; уже в PiGroupWorkspace DICT-310)

CONFLICT KEYS:
  frontend/src/app/shared/ui/pi-table.component.ts ;
  frontend/src/app/shared/ui/pi-table.component.spec.ts ;
  frontend/src/app/pages/dictionaries/categories.page.ts ;
  frontend/src/app/pages/dictionaries/categories.page.spec.ts ;
  docs/pages/categories.page.md ;
  docs/agent-checklists/TZ-UI-TABLE-302.md ;
  tasks/_active/TZ-UI-TABLE-302.md

ИСХОДНОЕ:
- Categories — единственный non-kit реестр-дерево (CDK custom markup).
- SoT: Tree variant в kit; dragReorder = capability flag; visual sameness с Flat.
- Group Chip chrome уже снаружи (не ломать PiGroupWorkspace).

ЧТО ДЕЛАТЬ:
1. Расширить `app-pi-table` (или тонкий sibling `app-pi-table-tree` в том же
   kit-файле/папке — предпочтительно один primitive с mode/variant input):
   - nested rows / indent levels
   - expand/collapse
   - optional `dragReorder` capability (CDK) — сохранить текущий reorder
     categories (root + children)
2. Мигрировать CategoriesPage body на Tree kit; оставить PiGroupWorkspace снаружи.
3. Specs kit + categories; fe tsc + jest PASS.
4. Docs categories.page.md + READY FOR REVIEW (отдельный inbox ok:
   progress + checklist; можно блок в DICT-WAVE1 или короткий progress-only
   + checklist Status READY FOR REVIEW).

ИЗМЕНЯТЬ: conflict keys.
НЕ: backend; raw catalogs 305; Selectable 304; Group Chip gap (312);
  commit/push без PO; archive до Cursor PASS.

AC:
- [ ] Categories визуально/поведением на kit Tree; CDK drag если был — сохранён
      как flag.
- [ ] Нет отдельного «другого» thead chrome вне kit.
- [ ] fe tsc + jest (pi-table + categories) PASS.
- [ ] READY FOR REVIEW; Cursor PASS before archive.

Verification:
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern "pi-table|categories.page" --no-coverage
```

known_limitation: text-block-categories raw table → TZ-UI-TABLE-305;
  full Tree API может быть MVP (2 уровня как сейчас categories).

∥ DICT-312: OK (разные keys). Не параллелить два агента на categories.page.
