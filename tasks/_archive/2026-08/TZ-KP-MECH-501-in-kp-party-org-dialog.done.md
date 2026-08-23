# TZ-KP-MECH-501 — DONE

**Status:** DONE · archived 2026-08-23
**Agent:** cursor-executor

ARCHIVE_MARKER

## Что сделано

1. **Клиент (recipient):** `openCard()` → `PiDialogService.open(CounterpartyFullEditorDialogComponent)` с кэшем из `selectedCounterparty()` или `findById`; после save — upsert в `counterparties` signal. `Router.navigate` удалён.
2. **Организация (inspector):** `openOrganization()` → `OrganizationFullEditorDialogComponent` in-place; кэш из `organizations()` или `findById`; после save — upsert в списке org. Мёртвый `highlight` query param убран.
3. **Тесты:** +1 spec в recipient и inspector — dialog open, `Router.navigate` не вызывается.

## Gates

- FE tsc: 0 errors
- FE test (proposal-create-recipient proposal-create-inspector proposal-workspace): 74 passed
- FE lint: 0 errors (pre-existing warnings only)

## Файлы

- `proposal-create-recipient.component.ts` (+ spec)
- `proposal-create-inspector.component.ts` (+ spec)
