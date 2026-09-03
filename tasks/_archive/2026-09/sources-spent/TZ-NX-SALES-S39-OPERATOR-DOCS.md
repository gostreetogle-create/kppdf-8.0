# TZ-NX-SALES-S39-OPERATOR-DOCS: closeout sales canon

**РОЛЬ:** Executor (docs)  
**LAYER:** 1 · **PAGES:** `/orders` ; `/proposals`  
**PAGE_DOCS:** `docs/pages/orders.page.md` ; `docs/pages/proposals.page.md`  
**ЗАВИСИМОСТИ:** S30–S38 DONE  
**CONFLICT KEYS:** `docs/pages/orders.page.md`; `docs/pages/proposals.page.md`; `docs/SECTION-READINESS.md`; `docs/agent-checklists/WAVE-NX-SALES-CANON.md`

## Domain preflight

Docs-only. Integrity: page.md + PAGE-TZ-INDEX + SECTION-READINESS сделки.

## ЧТО ДЕЛАТЬ

1. NX-секции актуальны: список/создание/оплата/без заглушки/convert accepted.
2. `PAGE-TZ-INDEX.md` — строка волны S30–S39.
3. `SECTION-READINESS.md` — Сделки: NX журнал заказов + КП студия; legacy HUB не обещать в NX.
4. WAVE checklist все [x] + SHA; `_NOW.md` QUEUE EMPTY; `QUEUE-LIVE.md`.
5. `CAPABILITY-LEDGER.md` одна строка: NX orders list/create/paid included.
6. Roadmap `nx-sales-canon-roadmap.md` — S30–S39 DONE.

## НЕ ИЗМЕНЯТЬ

- product runtime, кроме опечаток в docs

## КРИТЕРИИ ПРИЁМКИ

- [ ] WAVE все [x], `_active/` пуст
- [ ] Integrity slot в checklist S39
- [ ] Код-gates N/A (docs-only) — явно в archive

## Archive

`tasks/_archive/2026-09/TZ-NX-SALES-S39-OPERATOR-DOCS.done.md`
