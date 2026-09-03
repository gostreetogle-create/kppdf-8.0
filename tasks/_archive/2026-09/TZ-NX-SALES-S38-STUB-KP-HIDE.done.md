# TZ-NX-SALES-S38-STUB-KP-HIDE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (legacy frontend app + backend build)
  - tests: PASS (focused order-detail 14/14)
  - lint: PASS (backend controller eslint)
  - kppdf-web build: N/A (no NX product code touched)
  - checklist: ADDED and completed
  - progress.md: REDIRECTED; live state synchronized in `_NOW.md`
  - status synchronization: PASS

## Delivered

- Legacy order card: removed `order-create-stub-proposal` button and `createStubProposal()`; direct orders now show honest copy «КП не обязателен. Нужен бланк — создайте КП в студии документов.» (`order-no-stub-proposal`).
- Legacy spec: stub block rewritten — button absent, service `createStubProposal` never called; «есть КП» case unchanged.
- Backend: `POST /orders/:id/stub-proposal` Swagger operation marked DEPRECATED («не вызывать из UI; канон MASTER-CORE»); endpoint itself untouched.
- NX grep: `stub-proposal` present in `frontend-nx/**` only in doc comments and negative spec assertions — no call anywhere.
- Synchronized `docs/pages/orders.page.md` (S38 section).

## Gates

- Legacy tsc: PASS.
- Focused Jest: PASS, 14/14.
- Backend tsc: PASS.
- Backend eslint: PASS.
- `nx build kppdf-web`: N/A one-liner (no NX product code).

## Integrity

Endpoint behaviour unchanged (idempotent, kept for old clients); UI no longer proposes the stub. Foreign WIP excluded from the commit.