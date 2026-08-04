═══════════════════════════════════════════════════════════════
TZ-DICT-310: Group screens — Классификация / Оформление / Документы
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend
ЗАВИСИМОСТИ: TZ-DICT-308 DONE; TZ-DICT-309 DONE (или DEFER если 309 только
  units-routes — тогда согласовать с PO; default: после 309)
LAYER: 3
PAGES: /dictionaries/classification ; /dictionaries/appearance ;
  /dictionaries/documents-ref (имена route выбрать и зафиксировать в коде+docs) ;
  /categories ; /dictionaries/color-references ; /doc-template-categories ;
  /dictionaries/text-block-categories
PAGE_DOCS: dictionaries.page.md ; categories.page.md ; color-references.page.md ;
  (+ new group page docs)

SoT: docs/superpowers/specs/2026-08-04-group-chip-workspace-design.md §2–§3
Проверено: frontend/src/app/layout/app-layout.component.ts (nav stubs на leaf) ;
  categories / color-references / document-template-categories /
  text-block-categories pages (PiDictionaryShell) ;
  PiGroupWorkspaceComponent

CONFLICT KEYS:
  frontend/src/app/pages/dictionaries/*group*.ts ;
  frontend/src/app/pages/dictionaries/categories.page.ts ;
  frontend/src/app/pages/dictionaries/color-references.page.ts ;
  frontend/src/app/pages/dictionaries/document-template-categories.page.ts ;
  frontend/src/app/pages/dictionaries/text-block-categories.page.ts ;
  frontend/src/app/app.routes.ts ;
  frontend/src/app/layout/app-layout.component.ts ;
  docs/pages/* ;
  docs/agent-checklists/TZ-DICT-310.md ;
  tasks/_active/TZ-DICT-310.md

ИСХОДНОЕ СОСТОЯНИЕ:
- Nav «Справочники» уже по группам, но клик ведёт на **leaf** pages
  (/categories, /color-references, /doc-template-categories) + лишний leaf
  «Категории текстов».
- SoT: клик **группы** → экран группы с chips; body = существующий справочник
  (tree categories / flat colors / flat doc+text cats).
- Измерения уже на PiGroupWorkspace (308/309) — не ломать.

ЧТО ДЕЛАТЬ:
1. Три group routes (имена зафиксировать в routes+docs), например:
   - `/dictionaries/classification` — chips: [{ Категории → body categories tree }]
   - `/dictionaries/appearance` — chips: [{ Цвета → color-references }]
   - `/dictionaries/documents-ref` (или `/dictionaries/docs`) — chips:
     [{ Категории шаблонов }, { Категории текстов }] — переключение body без H1.
2. Реализовать через PiGroupWorkspace; переиспользовать логику существующих
   pages (extract shared body / compose / thin wrappers — выбрать минимальный
   дубль; не копипастить 400+ строк без нужды).
3. Nav: четыре пункта групп → **group routes** (не leaf). Убрать отдельный
   nav-leaf «Категории текстов» (он становится chip внутри Документы).
4. Legacy leaf routes: redirect на соответствующую группу+chip ИЛИ оставить
   deep-link совместимость с redirect (предпочтительно redirect).
5. Specs на каждый group page (chips + default first chip + нет path H1).
   fe tsc + jest PASS.
6. Docs + PAGE-TZ-INDEX + READY FOR REVIEW.

ИЗМЕНЯТЬ: conflict keys.
НЕ ИЗМЕНЯТЬ: backend; measurements (309); hub retire (311); table kit Tree
  (UI-TABLE-302 — categories tree chrome остаётся как есть внутри body);
  commit/push без PO; archive до Cursor PASS.

КРИТЕРИИ ПРИЁМКИ:
- [ ] Клик группы в nav → group screen с жёлтым active chip, без path-крошек,
      без огромного H1 раздела.
- [ ] Документы: ≥2 chips (шаблоны / тексты); переключение меняет body.
- [ ] Классификация / Оформление: ≥1 chip; body = прежний CRUD/tree.
- [ ] fe tsc + jest (новые group specs + затронутые pages) PASS.
- [ ] Cursor PASS before archive.

Verification:
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern "dictionaries|pi-group-workspace" --no-coverage
```

known_limitation: hub /dictionaries cards → DICT-311; Tree kit unification →
  UI-TABLE-302 (не блокер 310).

∥: НЕ параллелить с 309/311 (routes+layout).
