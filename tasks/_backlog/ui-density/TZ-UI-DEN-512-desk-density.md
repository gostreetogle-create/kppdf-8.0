# TZ-UI-DEN-512: Manager desk — density pass

PAGES: /desk
PAGE_DOCS: manager-desk.page.md

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-UI-DEN-510; **WAIT** `TZ-DESK-430.done` + desk wave 425…430 quiescent

LAYER: 3

CONFLICT KEYS: frontend/src/app/pages/desk/**; frontend/src/app/pages/manager-desk/**

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Tray cards — paper-raised, hairline, 16px padding (extend DESK-431 if gaps)

ШАГ 2: Order hub rows — 12–13px meta, hairline separators not 24px gaps

ШАГ 3: Single gold CTA per tray view (ship/confirm) — demote secondary fills to outline

ШАГ 4: RU status strings in tray — no raw enum in template

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Tray business logic / DESK-425 workspace IA
- Supply flyout container grid (431)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] manager-desk + order-hub-tray tests PASS
- [ ] Visual checklist §6 zones N/A except footer CTA pattern documented
- [ ] tsc + lint PASS
