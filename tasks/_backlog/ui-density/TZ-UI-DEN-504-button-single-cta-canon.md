# TZ-UI-DEN-504: PiButton — single gold CTA canon

PAGES: /kit/forms
PAGE_DOCS: ui-density-canon.md ; AI-UI-CONTRACT.md

РОЛЬ АГЕНТА: Frontend Component Engineer

ЗАВИСИМОСТИ: TZ-UI-DEN-501

LAYER: 2

CONFLICT KEYS: frontend/src/app/shared/ui/button/button.component.ts; frontend/src/app/pages/kit/forms/**; docs/ui-density-canon.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Gold fill = `variant="default"` (secondary color sunrise-gold). На страницах иногда несколько default рядом.

Canon: **одна** залитая gold CTA на экран; остальные `outline`/`secondary`/`ghost`.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Document in `button.component.ts` JSDoc + `/kit/forms`:

- `default` = primary confirm only (1 per view)
- `secondary` = secondary filled neutral
- `outline` = tertiary actions

ШАГ 2: Add optional input `data-density-primary="true"` or use existing — **no API break**; docs only unless clear bug in button variants

ШАГ 3: Kit demo «Footer pattern»: left status text + right single gold CTA (Desktop Import reference)

ШАГ 4: `ui-density-canon.md` — ссылка на kit demo section

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Feature page buttons (DEN-510+)
- Gold contrast pairs (already WR-504)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] Kit forms shows Single CTA footer example
- [ ] Button JSDoc states one-gold-per-screen rule
- [ ] tsc + lint PASS
