# TZ-UI-DEN-511: Page chrome — compact H1 & breadcrumbs

PAGES: (all list/detail with chrome)
PAGE_DOCS: page-chrome.md

РОЛЬ АГЕНТА: Frontend Layout Engineer

ЗАВИСИМОСТИ: TZ-UI-DEN-501

LAYER: 3

CONFLICT KEYS: frontend/src/app/shared/page/pi-page-chrome.component.ts; frontend/src/app/shared/page/pi-page-chrome.component.spec.ts; docs/pages/page-chrome.md

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: H1 max **16–18px** (`text-base`/`text-lg`), не `text-2xl`

ШАГ 2: Breadcrumbs / meta → `text-micro` (11px) or `text-xs` (12px)

ШАГ 3: Chrome block padding → `px-page-x` + compact vertical (8–12px), hairline-b

ШАГ 4: Update `page-chrome.md` with density numbers from ui-density-canon

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- KP workspace chrome (DEN-552)
- Gantt header inside production

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] pi-page-chrome spec updated; no H1 class above text-lg
- [ ] tsc + lint + pi-page-chrome tests PASS
