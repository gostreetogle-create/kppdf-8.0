═══════════════════════════════════════════════════════════════
TZ-DICT-312: Group Chip Workspace polish — gap + tools CTA clip
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend
ЗАВИСИМОСТИ: TZ-DICT-308…311 DONE (deployed warm 2026-08-05)
LAYER: 3
PAGES: /dictionaries/measurements ; /dictionaries/classification ;
  /dictionaries/appearance ; /dictionaries/documents-ref ;
  /categories ; /dictionaries/color-references ;
  /doc-template-categories ; /dictionaries/text-block-categories
PAGE_DOCS: dictionaries.page.md ; measurements-group.page.md

SoT: docs/superpowers/specs/2026-08-04-group-chip-workspace-design.md §2.2
  (chips sticky под header; сразу tools + таблица; без пустой «простыни»)
Проверено: frontend/src/app/shared/page/pi-group-workspace.component.ts
  (chips `sticky top-14`; tools `style="top: 6.25rem"`) ;
  frontend/src/app/layout/app-layout.component.ts (`main` + `pt-page-y`
  unless denseMain) ;
  PO screenshot 2026-08-05: Documents group — большой зазор под nav +
  CTA «+ Создать категорию» обрезан справа белым блоком.

CONFLICT KEYS:
  frontend/src/app/shared/page/pi-group-workspace.component.ts ;
  frontend/src/app/shared/page/pi-group-workspace.component.spec.ts (NEW ok) ;
  frontend/src/app/layout/app-layout.component.ts ;
  frontend/src/app/pages/dictionaries/* (only if page-local tools layout) ;
  docs/pages/dictionaries.page.md ;
  docs/agent-checklists/TZ-DICT-312.md ;
  tasks/_active/TZ-DICT-312.md

ИСХОДНОЕ СОСТОЯНИЕ (баги после warm deploy):
1. **Пустое пространство** между sticky header (главное меню) и рядом
   group chips — «воздух» / белая полоса. Вероятная причина: `main`
   имеет `pt-page-y`, а chips считают sticky `top-14` от viewport → до
   прилипания виден padding страницы; либо лишний margin на host.
   PO: chips должны сидеть **сразу под меню**, как в SoT (sticky chips +
   tools → сразу таблица).
2. **CTA обрезан**: на `/doc-template-categories` кнопка
   «+ Создать категорию» справа перекрыта/срезана белым прямоугольником
   (overflow / sticky stacking / tools bar width). Кнопка должна быть
   целиком видна и кликабельна.
3. Known 308: hard-coded `top: 6.25rem` на tools — ломается при wrap chips
   и конфликтует с layout; заменить на устойчивый offset (CSS var /
   измерение / одна sticky-колонка chips+tools).

ЧТО ДЕЛАТЬ:
1. Убрать мёртвый зазор header→chips на всех Group Chip Workspace
   страницах справочников. Варианты (выбрать минимальный, зафиксировать
   в report):
   a) `denseMain()` (или аналог) для dictionary group routes — без
      `pt-page-y` на main; **или**
   b) chips flush: отрицательный margin / host без верхнего padding; **или**
   c) перестроить sticky: один sticky-блок (chips+tools) под `top-14`.
   Не возвращать огромный H1 / path-крошки.
2. Починить tools row: CTA и search полностью в viewport; `flex-wrap` ок;
   нет clip overflow hidden на tools/host; z-index не перекрывает кнопку
   соседним sticky/body.
3. Tools sticky top — не hard-code одной строкой chips; при 1–2 рядах
   chips tools не залезают под chips и не оставляют дыру.
4. Specs: DOM/layout smoke — chips близко к header (нет «пустой полосы»
   > разумного порога ИЛИ assert denseMain/class); CTA
   `data-test="create-category-button"` visible (getBoundingClientRect /
   not clipped). fe tsc + jest PASS.
5. Docs one-liner + READY FOR REVIEW в DICT-WAVE1-REVIEW.md.
   Screenshot-сверка локально/browser желательна.

ИЗМЕНЯТЬ: conflict keys.
НЕ ИЗМЕНЯТЬ: backend; table kit Tree (UI-TABLE-302); nav group IA (310);
  commit/push без PO; archive до Cursor PASS; не трогать builder dense
  routes без нужды.

КРИТЕРИИ ПРИЁМКИ:
- [ ] На Documents / Измерения / Классификация / Оформление: под меню сразу
      chips (нет большой белой пустоты как на PO-скриншоте).
- [ ] CTA «+ Создать…» на doc-template-categories и text-block-categories
      полностью видна, не обрезана.
- [ ] Sticky chips+tools работают при скролле таблицы; wrap chips ок.
- [ ] fe tsc + jest (pi-group-workspace + dictionaries) PASS.
- [ ] Cursor PASS before archive.

Verification:
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern "pi-group-workspace|dictionaries|app.routes" --no-coverage
```

known_limitation: полный table kit (UI-TABLE-*) — отдельно; этот TZ только
  chrome Group Chip Workspace.

∥: OK с UI-TABLE docs/code если keys не пересекаются с pi-group-workspace /
  app-layout.
