# TZ-SALES-355 — Состав КП wide table + edit in place — DONE

- closed_at: 2026-08-11
- agent: Cursor
- status: DONE (код на main; deploy позже по PO)

## Scope

Правый flyout «Состав КП»: табличный layout ~50vw, карандаш → FullEditor без ухода со студии.

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- `proposal-create.page.spec` 34/34 PASS
- Deploy: NO

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-11
closed_by: Cursor
verification:
  - typecheck: PASS
  - jest proposal-create: PASS
  - deploy: PENDING_PO
