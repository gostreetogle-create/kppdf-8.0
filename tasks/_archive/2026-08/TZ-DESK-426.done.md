# TZ-DESK-426 — workflow chips: deep-link с orderId — DONE

**agent_id:** freebuff-desk-wave
**claimed_at:** 2026-08-23T11:45:35+0300
**closed_at:** 2026-08-23
**SHA:** (заполнить после commit)

ARCHIVE_MARKER
outcome: DONE
closed_by: freebuff-desk-wave
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS
  - checklist: ADDED

## Proof of adoption

- **Consumer `/desk`:** `deskWorkflowChips(orderId)` в `desk-workflow-chips.ts` + computed `workflowChips()` в `manager-desk.page.ts` — Стол `view=desk&orderId`, КП `source=order&sourceId`, Снабжение/Отгрузка `orderId&from=desk`, Комбайн/Гант desk-stub `view&orderId`. Тесты +2 (81/81, включая 47 proposal-create).
- **Consumer `/supply`:** quick view показывает фильтр заказа + «На стол» при `from=desk` (426 тесты +2).
- **Consumer `/shipping`:** orderId/from из query → фильтр-чип + «На стол» (тесты +2).
- **Consumer `/proposals/create`:** `prefillFromOrder(orderId)` — КП наследует клиента (counterpartyId, siteId) и позиции заказа (не пустое КП). Тест +1 (47/47 proposal-create).
- **Docs:** `manager-desk.page.md` (426 строка + таблица), `supply.page.md` (входы).
- **Migration note:** tray больше не navigates (это 425); chips = единственный cross-page путь с orderId. «На стол» = `/desk?orderId=&view=desk`.
- **Legacy leftover:** desk tray «Открыть снабжение» → navigate уходит в 425; rail tools → 427.

## Gates

| Gate | Result |
|------|--------|
| `pnpm exec tsc -p tsconfig.app.json --noEmit` | 0 ✅ |
| `pnpm exec jest` (manager-desk, proposal-create, supply, shipping) | 91+ ✅ |
| `pnpm exec eslint` (9 файлов) | 0 errors (2 pre-existing lifecycle warnings) ✅ |
| `git diff --check` | PASS ✅ |
