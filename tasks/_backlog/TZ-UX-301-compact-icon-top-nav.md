═══════════════════════════════════════════════════════════════
TZ-UX-301: Компактное верхнее меню (иконки + tooltip)
═══════════════════════════════════════════════════════════════

> READY · smell: меню + «Десктоп»/сессия вылезают за край  
> Canon: `docs/audits/2026-08-08-chrome-nav-admin-smell.md`

STATUS: READY

РОЛЬ: Frontend (layout)

LAYER: 3

PAGES: все (header)
PAGE_DOCS: audit chrome-nav-admin-smell

CONFLICT KEYS:
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/layout/app-layout.nav-order.spec.ts;
frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.ts;
docs/agent-checklists/TZ-UX-301.md;
docs/agent-checklists/_active-map.md;

---

## ЧТО ДЕЛАТЬ

1. Топ-nav категории: по умолчанию **иконка (+ тонкая обводка/active wash)**; подпись — `title`/`aria-label` + tooltip/title на hover (не полный текст всегда в ряд).  
2. На широких экранах (опц. `lg:`) можно показывать короткий label — но P0: не overflow.  
3. Правый блок: Десктоп / тема / колокольчик / Выйти — icon-first, без длинного «Десктоп»+имя, если не влезает; имя user — truncate или только на `md+`.  
4. Dropdown категорий: trigger тоже icon+tooltip; меню открывается как сейчас.  
5. Jest: nav order ids не сломать; visual smoke не обязателен.  
6. RU aria-labels на все пункты.

## НЕ

- Менять порядок категорий NAV-301  
- Production cockpit; admin roles logic  
- Deploy  

## AC

- [ ] На типичной ширине ~1280px все пункты + правый блок **без** горизонтального overflow header  
- [ ] Hover/focus показывает название раздела  
- [ ] Active category читаем (не только цвет текста)  
- [ ] FE tsc + nav-order jest PASS; archive; commit+push  

known_limitation: мобильный hamburger — out of P0 если не было.
