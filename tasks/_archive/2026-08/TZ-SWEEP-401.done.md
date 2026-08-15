# TZ-SWEEP-401 — DONE

- **Status:** DONE
- **Executor:** Buffy
- **Cursor verdict:** PASS
- **Closed:** 2026-08-16T00:56:32+03:00
- **Deploy:** not performed

## Delivered

- Backend order status graph allows planned transitions through `ready`; PATCH to `shipped`, `delivered`, or `cancelled` returns RU 400 before mutation.
- Frozen orders still accept status-only updates where allowed.
- Existing `ship()` path creates the shipment, marks the order shipped, and marks all order items shipped.
- Item status `shipped` is rejected until the order is shipped/delivered; legacy items without a status remain safe and default to pending in the UI.
- Kanban drops use optimistic updates with rollback and RU toast; shipping requires confirmation and calls the existing ship action rather than PATCHing shipped.
- Readiness count uses `item.status` only and no longer mixes in `readyForWork`.
- Order form keeps shipped/delivered/cancelled as display-only statuses; «Комбайн» links to `/dashboard`.

## Verification

- Backend TypeScript — PASS
- Backend `order.service.spec` — **42/42 PASS**
- Backend ESLint — PASS
- Frontend TypeScript — PASS
- Focused frontend Jest — **26/26 PASS**
- Adjacent frontend Jest — **62/62 PASS**
- Frontend ESLint, Prettier, `git diff --check` — PASS
- Cursor independent review — **8/8 acceptance points PASS; no blockers**

## Closeout separation

The closeout stages only TZ-SWEEP-401 code, its checklist, status/progress resume, archive, and lock. Concurrent `data/*`, PO-DIARY, architect-owned dashboard/audit/task support files, and other WIP remain untouched.
