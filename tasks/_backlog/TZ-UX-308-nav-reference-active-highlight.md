═══════════════════════════════════════════════════════════════
TZ-UX-308: Nav «Справ.» — жёлтая подсветка на активной странице
═══════════════════════════════════════════════════════════════

STATUS: READY

РОЛЬ: Frontend (layout)

ЗАВИСИМОСТИ: TZ-UX-307 DONE

LAYER: 3

PAGES: /categories ; /dictionaries/*
PAGE_DOCS: (layout)

Проверено: app-layout.component.ts — reference.entryPath='/dictionaries/classification';
  app.routes.ts — dictionaries/classification → redirectTo 'categories';
  activeCategoryId() матчит только cat.items[].path → URL `/categories` не попадает в reference.

CONFLICT KEYS:
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/layout/app-layout.nav-order.spec.ts;
docs/agent-checklists/TZ-UX-308.md;
docs/agent-checklists/_active-map.md;

НЕ: dialogs; QuickCreate; admin; deploy

---

## ЧТО ДЕЛАТЬ

1. Исправить matching так, чтобы на `/categories` (и прочих alias справочников) `activeCategoryId()==='reference'`.
   Предпочтительно:
   - `entryPath: '/categories'` + item path classification → `/categories` (один канон URL),
   - и/или явный `activeAliases: ['/categories', …]` на категории reference;
   - `documents-ref` уже редиректит на `/doc-template-categories` (есть в items) — проверить тоже.
2. Jest: URL `/categories` → active reference; один другой раздел (напр. `/products`) → не reference.
3. Archive + push.

## AC

- [ ] На странице категорий после клика «Справ.» кнопка жёлтая (как Каталог на /products)
- [ ] Остальные разделы не ломаются
- [ ] jest + tsc PASS; archive; push
