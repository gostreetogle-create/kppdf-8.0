# TZ-NX-SALES-S31-ORDER-PAID — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: claude
source_task: `tasks/TZ-NX-SALES-S31-ORDER-PAID.md`
checklist: `docs/agent-checklists/TZ-NX-SALES-S31-ORDER-PAID.md`
lock_file: `.mimocode/locks/TZ-NX-SALES-S31-ORDER-PAID.lock` (local; ignored by Git)

## Outcome

- `Order.isPaid` defaults to `false`; `Order.paidAt` is nullable and stores the payment moment.
- Direct orders may be created and paid without a `quotationId`.
- Marking an order paid assigns a timestamp when absent; repeating `isPaid: true` preserves an existing timestamp.
- Marking an order unpaid clears `paidAt`.
- Payment writes are allowed through the existing OrderService write path without changing lifecycle status, including on frozen orders.
- Coupling and orders page documentation now identify payment as an Order fact rather than a Quotation field.

## Verification

- acceptance criteria: PASS
- focused tests: `cd backend && pnpm test -- src/modules/order/order.service.spec.ts src/modules/order/dto/update-order.dto.spec.ts --runInBand` — PASS, 89 tests
- typecheck: `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS
- lint: `cd backend && pnpm exec eslint src/modules/order/order.schema.ts src/modules/order/dto/create-order.dto.ts src/modules/order/dto/update-order.dto.ts src/modules/order/order.service.ts src/modules/order/order.service.spec.ts src/modules/order/dto/update-order.dto.spec.ts` — PASS
- baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS, exit 0; existing Angular warnings only
- integrity: PASS; existing `/orders` page and coupling map updated; FIC route/module/page additions N/A
- review diff: PASS; unrelated dirty worktree files excluded from staging
- status synchronization: wave S30/S31 marked DONE; S32 next

## Known limitation

Payment remains a manually recorded order fact; no invoice, payment-provider, or automatic production transition is introduced by this TZ.
