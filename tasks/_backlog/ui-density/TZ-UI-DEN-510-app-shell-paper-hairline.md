# TZ-UI-DEN-510: App shell — paper bg, hairline, nav density

PAGES: /desk ; /dashboard ; (app shell)
PAGE_DOCS: manager-desk.page.md ; page-chrome.md

РОЛЬ АГЕНТА: Frontend Layout Engineer

ЗАВИСИМОСТИ: TZ-UI-DEN-501

LAYER: 3

CONFLICT KEYS: frontend/src/app/layout/app-layout.component.ts; frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.ts; frontend/src/app/shared/page/pi-group-workspace.component.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Layout уже Paper & Ink; возможны `bg-white`, лишние shadow, active tab не gold-underline.

Gold active chips: WR-504 verified `bg-sunrise-warm` + `text-on-gold`.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Main content area → `bg-paper` (not white full bleed)

ШАГ 2: Shell dividers → `hairline-b` between header / content / rails

ШАГ 3: Nav active state — gold underline OR existing gold chip (не оба); compact height ~46px header band if within ±4px without breaking touch targets

ШАГ 4: Remove decorative box-shadow on shell panels

ШАГ 5: Visual regression: app-layout spec if exists; else snapshot class list in .done.md

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Business page content
- Z-index tokens (WR-502 done)
- DESK tray logic (DESK-425 wave)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] No `bg-white` on app-layout outer scroll container
- [ ] AC guard: `rg 'shadow-' frontend/src/app/layout -g '*.ts'` → only allowed dialog-related if any
- [ ] tsc + lint + layout-related tests PASS
