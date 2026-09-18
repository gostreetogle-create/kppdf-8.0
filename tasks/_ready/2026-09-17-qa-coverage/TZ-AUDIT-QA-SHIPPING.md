# TZ-AUDIT-QA-SHIPPING: Shipping page + shipment module

> Перед работой: `GEMINI.md`, `docs/how-to-connect-ai.md`, `docs/TZ-AUTHORING.md`.
> Inventory: `docs/audits/2026-09-17-qa-coverage-inventory.md`
> WAVE: `tasks/_ready/2026-09-17-qa-coverage/WAVE-MAP.md`

**РОЛЬ АГЕНТА:** freebuff (docs-only auditor)
**ЗАВИСИМОСТИ:** TZ-AUDIT-QA-ORDERS
**SIZE:** S
**PACK:** WAVE-QA-COVERAGE-2026-09-17
**LAYER:** docs/audit
**PAGES:** /shipping
**PAGE_DOCS:** shipping.page.md
**CONFLICT KEYS:** docs/audits/2026-09-17-qa-coverage-inventory.md ; docs/audits/2026-09-17-qa-checklist-1-verified.md ; docs/audits/2026-09-17-qa-checklist-2-blocked.md ; docs/audits/2026-09-17-qa-coverage-summary.md

## Domain preflight
Проверено (открой при claim): inventory §1–2; релевантные `page.md`; NX pages + Pi-* services + `backend/src/modules/shipment`.
Клиент = Counterparty. Заказ = Order. Не invent SSO.
N/A process-failure AC — docs-only classification.

## ИСХОДНОЕ
- Auth/Shell/Home уже в checklist 1/2.
- Routes in scope: /shipping
- Placeholders в №2 «pending domain audit» — снять/переклассифицировать после этого среза.

## ЧТО ДЕЛАТЬ
1. Claim: `tasks/_active/TZ-AUDIT-QA-SHIPPING.md` + checklist Claim slot `agent_id: freebuff`, `claimed_at` ISO. Чужой claim на те же keys → STOP.
2. Vertical slice UI → PiService/facade → BE controller/service для каждого route в scope. Evidence = реальные `path:symbol`.
3. APPEND в Checklist №1 только полная цепочка; иначе №2 с `[ПРИЧИНА]`.
4. BE modules touched in this slice: classify or note deferred to ORPHAN-BE.
5. Обнови summary counts; убери pending placeholders только для закрытых routes.

6. Archive `tasks/_archive/2026-09/TZ-AUDIT-QA-SHIPPING.done.md` + Executor report (≤15 lines). Commit docs only.

## ИЗМЕНЯТЬ
- `docs/audits/2026-09-17-qa-checklist-1-verified.md`
- `docs/audits/2026-09-17-qa-checklist-2-blocked.md`
- `docs/audits/2026-09-17-qa-coverage-summary.md`
- task claim/archive + `_NOW` / `QUEUE-LIVE` строка статуса

## НЕ ИЗМЕНЯТЬ
- `frontend-nx/**` product code
- `backend/**/*.ts` app logic
- `frontend/` legacy (кроме пометки №2)
- Deploy / wipe / dark redesign

## КРИТЕРИИ ПРИЁМКИ
1. Каждый route из scope ∈ №1 или №2 с evidence.
2. Нет «Verified» без `file:symbol` chain.
3. Summary отражает прогресс домена.
4. `git diff --check` на staged docs; product diff empty.

## known_limitation
Live auth/DB → №2 Manual дополнительно, не вместо code-Verified.
Orphan modules без NX consumer → ORPHAN-BE.

## Verification
```
git diff --check
# product: git diff -- frontend-nx backend | должен быть пуст по app logic
```
