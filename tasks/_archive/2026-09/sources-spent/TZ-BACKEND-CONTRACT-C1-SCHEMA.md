# TZ-BACKEND-CONTRACT-C1-SCHEMA: contractStatus + attachment fields

**РОЛЬ:** Executor (backend)  
**LAYER:** 4 · **PAGES:** —  
**ЗАВИСИМОСТИ:** —  
**CONFLICT KEYS:** `contract.schema.ts`

## Domain preflight

**Проверено:** `Contract.status` = lifecycle draft|sent|signed|…; канон MASTER-CORE добавляет **отдельный** `contractStatus: none|file_attached|generated`.  
Клиент = `customerId` → Counterparty. Договор не блокирует Order.

## ЧТО ДЕЛАТЬ

1. Поле `contractStatus` enum `none|file_attached|generated`, default `none`, index.
2. `attachmentFileId?: string` (или ObjectId ref Media если в проекте так принято — сверка с org assets).
3. `attachmentUrl?: string` optional mirror.
4. **Не** трогать enum `status`.

## НЕ ИЗМЕНЯТЬ

- `frontend-nx/**`, quotation, order

## КРИТЕРИИ ПРИЁМКИ

- [ ] Schema compiles; defaults none
- [ ] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` PASS

## Archive

`tasks/_archive/2026-09/TZ-BACKEND-CONTRACT-C1-SCHEMA.done.md`
