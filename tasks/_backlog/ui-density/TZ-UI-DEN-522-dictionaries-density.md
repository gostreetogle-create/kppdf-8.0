# TZ-UI-DEN-522: Dictionaries hub — compact lists

PAGES: /dictionaries ; /dictionaries/*
PAGE_DOCS: dictionaries.page.md

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-UI-DEN-511

LAYER: 3

CONFLICT KEYS: frontend/src/app/pages/dictionaries/**

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

Hub tiles + sub-routes: 13px body, 11px labels, hairline grid, no SaaS card shadow.

Sub-pages (units, measurements, appearance, …): inherit page-chrome from 511; table density 12px.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] dictionaries specs PASS if present
- [ ] tsc + lint PASS
