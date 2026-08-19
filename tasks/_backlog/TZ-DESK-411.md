═══════════════════════════════════════════════════════════════
TZ-DESK-411: стол — capabilities + CTA why-disabled
═══════════════════════════════════════════════════════════════

PAGES: /desk
PAGE_DOCS: manager-desk.page.md

РОЛЬ АГЕНТА: Frontend. Root TZ, GEMINI.md. Freebuff.

ЗАВИСИМОСТИ: TZ-DESK-405 DONE; желательно 402 (live CTA).

LAYER: 3

CONFLICT KEYS: frontend/src/app/pages/desk/manager-desk.page.ts; frontend/src/app/layout/app-layout.component.ts (read-only for nav pageKey map)

Проверено: workflow strip ведёт на routes с разными pageKey (orders/production/supply/shipping/proposals).
CTA по Order.status без explain disabled = support hell.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — workflow strip ACL
- Inject `CapabilitiesService`; hide strip link if user lacks page grant for target route.
- `data-test="desk-workflow-*"` per link; hidden ≠ disabled grey (hidden).

ШАГ 2 — rail tools ACL
- Right rail «Снабжение» only if supply grant; Gantt if production; etc.

ШАГ 3 — CTA disabled copy
- Reuse/extract RU helpers from orders/combine/production for: freeze, missing siteId, wrong status.
- `title` + visible one-line hint under disabled CTA in tray.

ШАГ 4 — specs
- Mock capabilities: user without production → no Gantt in strip.

КРИТЕРИИ ПРИЁМКИ
- Нет клика в 403 forbidden с стола.
- Disabled CTA объясняет причину RU.
- tsc + spec PASS. Archive + push.
