# TZ-KP-MECH-504 — DONE

**Status:** DONE · archived 2026-08-23
**Agent:** cursor-executor (subagent)

ARCHIVE_MARKER

## Что сделано

1. **VAT inherit:** `ProposalWorkspaceDraftService` подтягивает `vatRate` из Organization/Counterparty в `dealVatPercent` при смене `organizationId` / `counterpartyId`.
2. **Dirty guard:** signals `vatTouchedByUser` / `discountTouchedByUser` — ручная правка НДС блокирует автоподстановку; hydrated draft помечает vat touched.
3. **Скидка:** default `none`/0 без schema changes; inherit скидки не добавлялся.
4. **paymentTermDays:** hint-toast «У клиента срок оплаты N дн.» при выборе клиента (без маппинга в KP-поля).
5. **Тесты:** +5 в `proposal-workspace-draft.service.spec.ts` (inherit org/cp, dirty guard, discount default, hydrate touched).

## Gates

- FE tsc: PASS
- jest proposal-workspace-draft.service.spec: 26/26
- eslint (changed files): PASS

## Файлы

- `proposal-workspace-draft.service.ts`
- `proposal-workspace-draft.service.spec.ts`
