# TZ-UX-FACT-303 — Order-detail passport FactStack

**Outcome:** DONE
**Date:** 2026-08-08
**Wave:** SHOP-NORTH-B #5
**Executor:** Buffy / openai-gpt-5.6-luna

## Delivered

- Replaced the order-detail passport text cluster with shared `PiFactStack`/`PiFactCard` facts for number, customer, object, status, order date and materials source.
- Kept materials source editing in the FactCard actions slot.
- Kept BOM composition and stripped commerce semantics unchanged; no order money facts were introduced.
- Updated FactCard adoption documentation and order-detail coverage.

## Gates

- Frontend typecheck: PASS
- Order-detail tests: PASS (4/4)
- Targeted ESLint: PASS
- Targeted Prettier and diff check: PASS

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T14:35:00Z
closed_by: Buffy
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint/format: PASS
  - docs adoption: PASS
  - scope review: PASS
